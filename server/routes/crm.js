const express = require('express');
const router = express.Router();
const { Lead } = require('../models');

// Listar leads
router.get('/leads', async (req, res) => {
  try {
    const { page = 1, limit = 10, stage = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let leads = await Lead.findAll();
    
    // Filtros
    if (stage) {
      leads = leads.filter(lead => lead.stage === stage);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(searchLower)) ||
        (lead.partner_name && lead.partner_name.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower))
      );
    }

    const count = leads.length;
    const rows = leads.slice(offset, offset + parseInt(limit));

    res.json({
      leads: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar lead
router.post('/leads', async (req, res) => {
  try {
    const { 
      name, partner_name, email, phone, stage, priority, 
      expected_revenue, probability, user_id, source, description, date_deadline 
    } = req.body;
    
    if (!name || !partner_name) {
      return res.status(400).json({ 
        error: 'Nome da oportunidade e nome do cliente são obrigatórios' 
      });
    }

    const lead = await Lead.create({
      name,
      partner_name,
      email,
      phone,
      stage: stage || 'new',
      priority: priority || 0,
      expected_revenue: parseFloat(expected_revenue) || 0,
      probability: parseInt(probability) || 0,
      user_id,
      source: source || 'website',
      description,
      date_deadline
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar lead
router.put('/leads/:id', async (req, res) => {
  try {
    // TODO: Implement update functionality
    res.status(501).json({ error: 'Funcionalidade em desenvolvimento' });
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar lead
router.delete('/leads/:id', async (req, res) => {
  try {
    // TODO: Implement delete functionality
    res.status(501).json({ error: 'Funcionalidade em desenvolvimento' });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas do CRM
router.get('/stats', async (req, res) => {
  try {
    const stats = await Lead.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do CRM:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Pipeline de vendas por estágio
router.get('/pipeline', async (req, res) => {
  try {
    const stages = Lead.stages;
    const pipeline = [];
    for (const stage of stages) {
      const leads = await Lead.findByStage(stage.id);
      const count = leads.length;
      const totalValue = leads.reduce((sum, lead) => sum + (parseFloat(lead.expectedRevenue) || 0), 0);
      pipeline.push({ ...stage, leads, count, totalValue });
    }

    res.json(pipeline);
  } catch (error) {
    console.error('Erro ao buscar pipeline:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Leads por usuário
router.get('/leads-by-user', async (req, res) => {
  try {
    const leads = await Lead.findAll();
    const leadsByUser = {};
    
    leads.forEach(lead => {
      const uid = lead.userId || 'unassigned';
      if (!leadsByUser[uid]) {
        leadsByUser[uid] = {
          userId: uid,
          count: 0,
          totalValue: 0,
          stages: {}
        };
      }
      
      leadsByUser[uid].count++;
      leadsByUser[uid].totalValue += (parseFloat(lead.expectedRevenue) || 0);
      
      if (!leadsByUser[uid].stages[lead.stage]) {
        leadsByUser[uid].stages[lead.stage] = 0;
      }
      leadsByUser[uid].stages[lead.stage]++;
    });

    res.json(Object.values(leadsByUser));
  } catch (error) {
    console.error('Erro ao buscar leads por usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;