const express = require('express');
const router = express.Router();
const { Transaction } = require('../models');

// Listar transações
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 10, type = '', category = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let transactions = await Transaction.findAll();
    
    // Filtros
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(t => 
        t.description.toLowerCase().includes(searchLower)
      );
    }

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const count = transactions.length;
    const rows = transactions.slice(offset, offset + parseInt(limit));

    res.json({
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar transação
router.post('/transactions', async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;
    
    if (!type || !category || !description || !amount) {
      return res.status(400).json({ 
        error: 'Tipo, categoria, descrição e valor são obrigatórios' 
      });
    }

    const transaction = await Transaction.create({
      type,
      category,
      description,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar transação
router.put('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, description, amount, date } = req.body;
    
    const transaction = Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const updatedTransaction = Transaction.update(id, {
      type,
      category,
      description,
      amount: parseFloat(amount),
      date
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar transação
router.delete('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    Transaction.delete(id);
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard financeiro
router.get('/dashboard', (req, res) => {
  try {
    const transactions = Transaction.findAll();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Transações por categoria
    const categories = {};
    transactions.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = { income: 0, expense: 0 };
      }
      categories[t.category][t.type] += t.amount;
    });

    const categoryStats = Object.entries(categories).map(([category, amounts]) => ({
      category,
      total: amounts.income + amounts.expense,
      income: amounts.income,
      expense: amounts.expense
    }));

    res.json({
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: totalIncome - totalExpense,
        transaction_count: transactions.length
      },
      categories: categoryStats
    });
  } catch (error) {
    console.error('Erro no dashboard financeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;