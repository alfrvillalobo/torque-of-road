const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      message: 'Producto creado',
      data: product,
    });

  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();

    res.json(products);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
};