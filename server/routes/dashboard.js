const express = require('express');
const router = express.Router();
const { Transaction, Employee, Product, Department } = require('../models');

// Estatísticas gerais do dashboard
router.get('/stats', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    const employees = await Employee.findAll();
    const products = await Product.findAll();
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const lowStockProducts = products.filter(p => p.quantity < 10).length;

    res.json({
      revenue: income,
      expenses: expenses,
      profit: income - expenses,
      employees: employees.length,
      products: products.length,
      lowStockProducts: lowStockProducts
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dados do gráfico financeiro - últimos 6 meses
router.get('/financial-chart', (req, res) => {
  try {
    // Mock data para demonstração
    const monthsData = [
      { month: 'Jul/2024', income: 15000, expense: 8000, profit: 7000 },
      { month: 'Ago/2024', income: 18000, expense: 9500, profit: 8500 },
      { month: 'Set/2024', income: 22000, expense: 11000, profit: 11000 },
      { month: 'Out/2024', income: 19000, expense: 10500, profit: 8500 },
      { month: 'Nov/2024', income: 25000, expense: 12000, profit: 13000 },
      { month: 'Dez/2024', income: 28000, expense: 14000, profit: 14000 }
    ];
    
    res.json(monthsData);
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Transações recentes
router.get('/recent-transactions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const transactions = await Transaction.findAll();
    const recentTransactions = transactions.slice(-parseInt(limit)).reverse();
    
    res.json(recentTransactions);
  } catch (error) {
    console.error('Erro ao buscar transações recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Funcionários por departamento
router.get('/employees-by-department', async (req, res) => {
  try {
    const employees = await Employee.findAll();
    const departments = await Department.findAll();
    
    const departmentStats = departments.map(dept => ({
      department: dept.name,
      count: employees.filter(emp => emp.department_id === dept.id).length
    }));
    
    res.json(departmentStats);
  } catch (error) {
    console.error('Erro ao buscar funcionários por departamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;