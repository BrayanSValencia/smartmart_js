import { models } from '../config/db/pool.js';
import { productImageInputSchema, productImageOutputSerializer } from '../serializers/productImageSerializer.js';

export const createProductImage = async (req, res) => {
  try {
    const data = productImageInputSchema.parse(req.body);

    // Verify product exists and is active
    const product = await models.Product.findOne({
      where: {
        id: data.product_id,
        isActive: true
      }
    });

    if (!product) {
      return res.status(400).json({ error: 'Invalid product ID or product is inactive' });
    }

    // Check if image URL already exists for this product
    const existingImage = await models.ProductImage.findOne({
      where: {
        image_url: data.image_url,
        product_id: data.product_id
      }
    });

    if (existingImage) {
      return res.status(409).json({ error: 'Image URL already exists for this product' });
    }

    const image = await models.ProductImage.create(data);
    return res.status(201).json(productImageOutputSerializer(image));

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductImages = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Verify product exists and is active
    const product = await models.Product.findOne({
      where: {
        id: product_id,
        isActive: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    const images = await models.ProductImage.findAll({
      where: { product_id }
    });

    res.json(images.map(productImageOutputSerializer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await models.ProductImage.findByPk(id, {
      include: [{
        model: models.Product,
        as: 'product',
        where: { isActive: true }
      }]
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found or product is inactive' });
    }

    res.json(productImageOutputSerializer(image));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const data = productImageInputSchema.parse(req.body);
    const { id } = req.params;

    const image = await models.ProductImage.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Verify product exists and is active if changing product_id
    if (data.product_id && data.product_id !== image.product_id) {
      const product = await models.Product.findOne({
        where: {
          id: data.product_id,
          isActive: true
        }
      });

      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID or product is inactive' });
      }
    }

    // Check for duplicate image URLs
    if (data.image_url && data.image_url !== image.image_url) {
      const existingImage = await models.ProductImage.findOne({
        where: {
          image_url: data.image_url,
          product_id: data.product_id || image.product_id
        }
      });

      if (existingImage) {
        return res.status(409).json({ error: 'Image URL already exists for this product' });
      }
    }

    const updatedImage = await image.update(data);
    return res.status(200).json(productImageOutputSerializer(updatedImage));

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await models.ProductImage.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await image.destroy();
    return res.status(204).end();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};