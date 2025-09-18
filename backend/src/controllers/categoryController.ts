import { Response } from 'express';
import { CategoryModel } from '../models/Category';
import { AuthRequest } from '../middleware/auth';

const categoryModel = new CategoryModel();

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, type, color = '#3B82F6' } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }

    const categoryId = await categoryModel.create({
      name,
      type,
      color,
      userId
    });

    const category = await categoryModel.findById(categoryId);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type } = req.query;

    let categories = await categoryModel.findByUserId(userId);

    if (type && (type === 'income' || type === 'expense')) {
      categories = categories.filter(cat => cat.type === type);
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await categoryModel.findById(parseInt(id));

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, color } = req.body;

    const category = await categoryModel.findById(parseInt(id));

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await categoryModel.update(parseInt(id), updateData);

    const updatedCategory = await categoryModel.findById(parseInt(id));

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await categoryModel.findById(parseInt(id));

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await categoryModel.delete(parseInt(id));

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};