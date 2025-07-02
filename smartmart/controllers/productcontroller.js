import { models } from '../config/db/pool.js';
import { productInputSchema, productOutputSerializer } from '../serializers/productserializer.js';
import { categoryOutputSerializer } from '../serializers/categoryserializer.js';

import slugify from 'slugify';
import { Op } from 'sequelize';

export const createProduct = async (req, res) => {
  try {
    const data = productInputSchema.parse(req.body);

    // Check if product name exists
    const existingProduct = await models.Product.findOne({ 
      where: { name: data.name } 
    });
    
    if (existingProduct) {
      return res.status(409).json({ error: 'Product name already exists' });
    }

    // Verify category exists and is active if provided
    if (data.category_id) {
      const category = await models.Category.findOne({ 
        where: { 
          id: data.category_id,
          isActive: true 
        } 
      });
      if (!category) {
        return res.status(400).json({ error: 'Invalid category ID or category is inactive' });
      }
    }

    const product = await models.Product.create({
      ...data,
      isActive: true, // New products are active by default
      slug: slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      })
    });

    return res.status(201).json(productOutputSerializer(product));

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProducts = async (req, res) => {
  //active and not
  try {
    const products = await models.Product.findAll();
    res.json(products.map(productOutputSerializer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductsCategories = async (req, res) => {
  try {
    const categories = await models.Category.findAll({
      where: { isActive: true }, // Only active categories
      include: [{
        model: models.Product,
        as: 'products',
        where: { isActive: true } // Only include active products
      }]
    });
    res.json(categories.map(categoryOutputSerializer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await models.Category.findOne({ 
      where: { 
        slug,
        isActive: true 
      },
      include: [{
        model: models.Product,
        as: 'products',
        where: { isActive: true } // Only active products
      }]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found or inactive' });
    }

    res.json(category.products.map(productOutputSerializer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await models.Product.findOne({
      where: { 
        slug,
        isActive: true 
      },
      include: [{ 
        model: models.Category, 
        as: 'category',
        where: { isActive: true } // Only active categories
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    res.json(productOutputSerializer(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = productInputSchema.parse(req.body);
    const { slug, id } = req.params;

    const product = await models.Product.findOne({ 
      where: { id, slug } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check for name conflicts (excluding current product)
    if (data.name && data.name !== product.name) {
      const existingProduct = await models.Product.findOne({
        where: {
          name: data.name,
          id: { [Op.ne]: id }
        }
      });

      if (existingProduct) {
        return res.status(409).json({ error: 'Product name already in use' });
      }
    }

    // Verify new category exists and is active if changing
    if (data.category_id && data.category_id !== product.category_id) {
      const category = await models.Category.findOne({ 
        where: { 
          id: data.category_id,
          isActive: true 
        } 
      });
      if (!category) {
        return res.status(400).json({ error: 'Invalid category ID or category is inactive' });
      }
    }

    // Only update slug if name changed
    const updateData = { ...data };
    if (data.name && data.name !== product.name) {
      updateData.slug = slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }

    // Prevent direct isActive modification here
    if ('isActive' in updateData) {
      delete updateData.isActive;
    }

    const updatedProduct = await product.update(updateData);
    return res.status(200).json(productOutputSerializer(updatedProduct));

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Generated slug already exists' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const product = await models.Product.findOne({ 
      where: { id, slug } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete by setting isActive to false
    await product.update({ isActive: false });
    return res.status(200).json({ message: 'Product deactivated successfully' });

  } catch (err) {
    console.error(err);
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Cannot delete - product is referenced in orders' 
      });
    }
    
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deactivateProduct = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const product = await models.Product.findOne({ 
      where: { 
        id, 
        slug,
        isActive: true 
      } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Active product not found' });
    }

    await product.update({ isActive: false });
    res.json({ message: "Product deactivated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const activateProduct = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const product = await models.Product.findOne({ 
      where: { 
        id, 
        slug,
        isActive: false 
      } 
    });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Inactive product not found or already active' 
      });
    }

    await product.update({ isActive: true });
    res.json({ message: "Product activated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};