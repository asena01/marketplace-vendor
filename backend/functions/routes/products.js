import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, service, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (category) filter.category = category;
    if (service) filter.service = service;

    let query = Product.find(filter)
      .populate('vendor', 'name email')
      .skip(skip)
      .limit(parseInt(limit));

    if (search) {
      query = Product.find({
        ...filter,
        $text: { $search: search },
      })
        .populate('vendor', 'name email')
        .skip(skip)
        .limit(parseInt(limit));
    }

    const products = await query;
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create product (for vendors)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, service, vendor } = req.body;

    if (!name || !description || !price || !category || !service || !vendor) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      service,
      vendor,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
