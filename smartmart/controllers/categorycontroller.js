import { models } from '../config/db/pool.js';
import { categoryInputSchema, categoryOutputSerializer } from '../serializers/categoryserializer.js';
import slugify from 'slugify';
import { Op } from 'sequelize';

export const createCategory = async (req, res) => {
  try {
    const data = categoryInputSchema.parse(req.body);

    const existingCategory = await models.Category.findOne({ 
      where: { name: data.name } 
    });
    
    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await models.Category.create({
      name: data.name,
      slug: slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      }),
      isActive: true // New categories are active by default
    });

    return res.status(201).json(categoryOutputSerializer(category));

  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await models.Category.findAll({
      where: { isActive: true } // Only return active categories
    });
    res.json(categories.map(categoryOutputSerializer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const retrieveCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await models.Category.findOne({ 
      where: { slug, isActive: true },
      include: [{
        model: models.Product,
        as: 'products',
        where: { isActive: true } // Only include active products
      }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found or inactive' });
    }

    res.json(categoryOutputSerializer(category));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const data = categoryInputSchema.parse(req.body);
    const { slug, id } = req.params;

    const category = await models.Category.findOne({ 
      where: { id, slug } 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (data.name && data.name !== category.name) {
      const existingCategory = await models.Category.findOne({
        where: {
          name: data.name,
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(409).json({ error: 'Category name already in use' });
      }
    }

    const updateData = { ...data };
    if (data.name && data.name !== category.name) {
      updateData.slug = slugify(data.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }

    // Prevent isActive from being modified here
    if ('isActive' in updateData) {
      delete updateData.isActive;
    }

    const updatedCategory = await category.update(updateData);
    return res.status(200).json(categoryOutputSerializer(updatedCategory));

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

export const deleteCategory = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const category = await models.Category.findOne({ 
      where: { id, slug } 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Soft delete by setting isActive to false
    await category.update({ isActive: false });
    return res.status(200).json({ message: 'Category deactivated successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deactivateCategory = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const category = await models.Category.findOne({ 
      where: { id, slug, isActive: true } 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Active category not found' });
    }

    await category.update({ isActive: false });
    res.json({ message: "Category deactivated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const activateCategory = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const category = await models.Category.findOne({ 
      where: { id, slug, isActive: false } 
    });
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Inactive category not found or already active' 
      });
    }

    await category.update({ isActive: true });
    res.json({ message: "Category activated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};