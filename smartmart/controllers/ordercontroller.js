// controllers/orderController.js
import { models } from '../config/db/pool.js';
import { v4 as uuidv4 } from 'uuid';
import { checkoutSerializer } from '../serializers/orderSerializer.js';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const orderCache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

// Get current directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Checkout Handler
export const processCheckout = async (req, res) => {
  try {
    const data = await checkoutSerializer.validate(req.body);
    let subtotal = 0;
    const itemsDescription = [];
    const itemsWithPrices = [];

    // Calculate totals and validate products
    for (const item of data.items) {
      const product = await models.Product.findByPk(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      itemsDescription.push(`${item.quantity}x ${product.name}`);
      itemsWithPrices.push({
        ...item,
        price: product.price,
        total: itemTotal
      });
    }

    const tax = Number((subtotal * 0.19).toFixed(2));
    const total = subtotal + tax;
    const invoice = `INV-${uuidv4()}`;

    // Cache items with prices for later use
    orderCache.set(invoice, itemsWithPrices);

    return res.json({
      currency: "usd",
      amount: total,
      tax_base: subtotal,
      tax: tax,
      name: "Order from Smartmart",
      description: itemsDescription.join(" | "),
      invoice: invoice,
      external: "false",
      response: `${process.env.BASE_URL}/epayco/response`,
      confirmation: `${process.env.BASE_URL}/checkout/confirmation`,
      x_extra1: req.user.username
    });

  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(400).json({ 
      error: err.message || "Invalid request data",
      details: err.errors 
    });
  }
};

// 2. Payment Confirmation Handler
export const handlePaymentConfirmation = async (req, res) => {
  try {
    const { 
      x_ref_payco, 
      x_transaction_id, 
      x_amount, 
      x_currency_code, 
      x_signature, 
      x_id_factura: invoice, 
      x_extra1: username,
      x_cod_transaction_state: status 
    } = req.body;

    // Validate required fields
    if (!x_ref_payco || !x_transaction_id || !x_signature || !invoice) {
      return res.status(400).json({ error: "Missing required payment data" });
    }

    // Signature validation
    const signatureString = `${process.env.P_CUST_ID_CLIENTE}^${process.env.P_KEY}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
    const crypto = await import('crypto');
    const calculatedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    if (calculatedSignature !== x_signature) {
      console.warn(`Invalid signature for invoice ${invoice}`);
      return res.status(401).json({ error: "Invalid signature" });
    }

    const purchasedItems = orderCache.take(invoice); // Get and remove from cache
    if (!purchasedItems) {
      console.warn(`Invalid or expired invoice: ${invoice}`);
      return res.status(401).json({ error: "Invalid or expired invoice" });
    }

    if (status !== "1") {
      console.log(`Payment not accepted for invoice ${invoice}. Status: ${status}`);
      return res.json({ message: "Payment not accepted" });
    }

    const user = await models.User.findOne({ where: { username } });
    if (!user) {
      console.warn(`User not found: ${username}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Start transaction
    const transaction = await models.sequelize.transaction();

    try {
      // 1. Create Order
      const order = await models.Order.create({
        invoiceId: invoice,
        firstName: req.body.x_customer_name || "",
        lastName: req.body.x_customer_lastname || "",
        subTotal: req.body.x_amount_base || 0,
        tax: req.body.x_tax || 0,
        taxIco: req.body.x_tax_ico || 0,
        total: req.body.x_amount || 0,
        isPaid: true,
        paymentMethod: req.body.x_franchise || "unknown",
        paymentReference: x_ref_payco,
        userId: user.id
      }, { transaction });

      // 2. Create Order Items and update product stock
      await Promise.all(
        purchasedItems.map(async (item) => {
          await models.OrderItem.create({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
            orderId: order.id
          }, { transaction });

          // Update product stock
          await models.Product.decrement('stock', {
            by: item.quantity,
            where: { id: item.product_id },
            transaction
          });
        })
      );

      await transaction.commit();
      console.log(`Successfully processed payment for invoice ${invoice}`);
      return res.json({ 
        message: "Payment processed successfully",
        orderId: order.id
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Order creation failed:", err);
      return res.status(500).json({ 
        error: "Failed to process order"
      });
    }
  } catch (err) {
    console.error("Payment confirmation error:", err);
    return res.status(500).json({ 
      error: "Internal server error"
    });
  }
};

// 3. Epayco Response Handler
export const handleEpaycoResponse = async (req, res) => {
  try {
    const htmlPath = path.join(__dirname, '../html/epayco_response.html');
    const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
    
    res.set('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (err) {
    console.error("Error serving Epayco response page:", err);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error loading payment response</h1>
          <p>We're unable to display the payment confirmation at this time.</p>
        </body>
      </html>
    `);
  }
};