const express = require('express');
const router = express.Router();
const { Product, Transaction } = require('../models');

// Listar todos os produtos
router.get('/products', (req, res) => {
  try {
    const products = Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo produto
router.post('/products', (req, res) => {
  try {
    const { name, description, price, quantity, category, sku } = req.body;
    
    const product = Product.create({
      name,
      description,
      price,
      quantity,
      category,
      sku
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, category, sku } = req.body;
    
    const product = Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const updatedProduct = Product.update(id, {
      name,
      description,
      price,
      quantity,
      category,
      sku
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const product = Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    Product.delete(id);
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produtos com baixo estoque
router.get('/products/low-stock', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const allProducts = Product.findAll();
    const lowStockProducts = allProducts.filter(product => product.quantity < 10);
    
    res.json(lowStockProducts.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Erro ao buscar produtos com baixo estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Movimentações de estoque (entradas e saídas)
router.post('/movements', (req, res) => {
  try {
    const { productId, type, quantity, description } = req.body;
    
    const product = Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar quantidade do produto
    let newQuantity = product.quantity;
    if (type === 'entrada') {
      newQuantity += parseInt(quantity);
    } else if (type === 'saida') {
      if (product.quantity < parseInt(quantity)) {
        return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
      }
      newQuantity -= parseInt(quantity);
    }
    
    const updatedProduct = Product.update(productId, { ...product, quantity: newQuantity });
    
    // Registrar a movimentação como transação
    const transaction = Transaction.create({
      type: type === 'entrada' ? 'income' : 'expense',
      amount: product.price * quantity,
      description: `${description} - ${product.name}`,
      category: 'Estoque'
    });
    
    res.status(201).json({
      message: 'Movimentação registrada com sucesso',
      product: updatedProduct,
      transaction
    });
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;