import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products with filters (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { category, service, page = 1, limit = 20, search, vendor } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (category) filter.category = category;
    if (service) filter.service = service;
    if (vendor) filter.vendor = vendor;

    let query = Product.find(filter)
      .populate('vendor', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (search) {
      query = Product.find({
        ...filter,
        $text: { $search: search },
      })
        .populate('vendor', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
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

// Get vendor's own products
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = { vendor: vendorId };
    if (category) filter.category = category;

    let query = Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (search) {
      query = Product.find({
        ...filter,
        $text: { $search: search },
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
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

// Create product (for vendors) - requires authentication
router.post('/', async (req, res) => {
  try {
    const vendorId = req.headers['x-vendor-id'];
    const { name, description, price, category, service, originalPrice, stock, sku, isFeatured, isActive } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: vendor ID required',
      });
    }

    if (!name || !description || price === undefined || !category || !service) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, service',
      });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      category,
      service,
      vendor: vendorId,
      stock: stock || 0,
      sku: sku || '',
      inStock: (stock || 0) > 0,
    });

    await product.save();
    await product.populate('vendor', 'name email');

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

// Update product - only vendor can update their own products
router.put('/:id', async (req, res) => {
  try {
    const vendorId = req.headers['x-vendor-id'];
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: vendor ID required',
      });
    }

    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if vendor owns this product
    if (product.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only update your own products',
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'price', 'originalPrice', 'category', 'service', 'stock', 'sku', 'isFeatured', 'isActive', 'images', 'image'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update inStock status based on stock
    if (updates.stock !== undefined) {
      updates.inStock = updates.stock > 0;
    }

    product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('vendor', 'name email');

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

// Delete product - only vendor can delete their own products
router.delete('/:id', async (req, res) => {
  try {
    const vendorId = req.headers['x-vendor-id'];
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: vendor ID required',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if vendor owns this product
    if (product.vendor.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete your own products',
      });
    }

    await Product.findByIdAndDelete(id);

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
