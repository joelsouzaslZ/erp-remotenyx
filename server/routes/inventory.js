const express = require('express');
const router = express.Router();
const models = require('../models');
const { Product, Transaction } = models;

// Debug: inspecionar o objeto `models` e `Product` em tempo de execução
try {
  console.log('DEBUG inventory models keys:', Object.keys(models));
  console.log('DEBUG Product keys:', Product ? Object.keys(Product) : 'Product is undefined');
  console.log('DEBUG Product.findById type:', Product && typeof Product.findById);
} catch (e) {
  console.error('DEBUG error inspecting models:', e);
}

// Listar todos os produtos
router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo produto
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, quantity, category, cost, min_quantity, sku } = req.body;

    const product = await Product.create({
      name,
      category,
      price,
      cost,
      quantity,
      min_quantity,
      description,
      sku
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const { name, description, price, quantity, category, cost, min_quantity, sku } = req.body;
    const updated = await Product.update(idNum, { name, category, price, cost, quantity, min_quantity, description, sku });
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const deleted = await Product.delete(idNum);
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produtos com baixo estoque
router.get('/products/low-stock', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const allProducts = await Product.findAll();
    const lowStockProducts = allProducts.filter(product => product.quantity < 10);
    
    res.json(lowStockProducts.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Erro ao buscar produtos com baixo estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Movimentações de estoque (entradas e saídas)
router.post('/movements', async (req, res) => {
  try {
    const { productId, type, quantity, description } = req.body;
    const qty = parseInt(quantity);
    if (!productId || !type || !qty) return res.status(400).json({ error: 'Dados inválidos' });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualizar quantidade do produto
    let newQuantity = product.quantity || 0;
    if (type === 'entrada') {
      newQuantity += qty;
    } else if (type === 'saida') {
      if (newQuantity < qty) {
        return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
      }
      newQuantity -= qty;
    } else {
      return res.status(400).json({ error: 'Tipo de movimentação inválido' });
    }

    const updatedProduct = await Product.update(productId, { quantity: newQuantity });

    // Registrar a movimentação como transação
    const transaction = await Transaction.create({
      type: type === 'entrada' ? 'income' : 'expense',
      amount: (product.price || 0) * qty,
      description: `${description || ''} - ${product.name}`,
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