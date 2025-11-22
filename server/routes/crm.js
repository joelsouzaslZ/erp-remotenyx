const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Listar leads
router.get('/leads', (req, res) => {
  try {
    const { page = 1, limit = 10, stage = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    let leads = Lead.findAll();
    
    // Filtros
    if (stage) {
      leads = leads.filter(lead => lead.stage === stage);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.partnerName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower)
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
router.post('/leads', (req, res) => {
  try {
    const { 
      name, partnerName, email, phone, stage, priority, 
      expectedRevenue, probability, userId, source, description, dateDeadline 
    } = req.body;
    
    if (!name || !partnerName) {
      return res.status(400).json({ 
        error: 'Nome da oportunidade e nome do cliente são obrigatórios' 
      });
    }

    const lead = Lead.create({
      name,
      partnerName,
      email,
      phone,
      stage: stage || 'new',
      priority: priority || '0',
      expectedRevenue: parseFloat(expectedRevenue) || 0,
      probability: parseInt(probability) || 0,
      userId,
      source: source || 'website',
      description,
      dateDeadline
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar lead
router.put('/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, partnerName, email, phone, stage, priority, 
      expectedRevenue, probability, userId, source, description, dateDeadline 
    } = req.body;
    
    const lead = Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    const updatedLead = Lead.update(id, {
      name,
      partnerName,
      email,
      phone,
      stage,
      priority,
      expectedRevenue: parseFloat(expectedRevenue) || 0,
      probability: parseInt(probability) || 0,
      userId,
      source,
      description,
      dateDeadline
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar lead
router.delete('/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    Lead.delete(id);
    res.json({ message: 'Lead deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas do CRM
router.get('/stats', (req, res) => {
  try {
    const stats = Lead.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do CRM:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Pipeline de vendas por estágio
router.get('/pipeline', (req, res) => {
  try {
    const stages = Lead.stages;
    const pipeline = stages.map(stage => ({
      ...stage,
      leads: Lead.findByStage(stage.id),
      count: Lead.findByStage(stage.id).length,
      totalValue: Lead.findByStage(stage.id).reduce((sum, lead) => sum + lead.expectedRevenue, 0)
    }));

    res.json(pipeline);
  } catch (error) {
    console.error('Erro ao buscar pipeline:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Leads por usuário
router.get('/leads-by-user', (req, res) => {
  try {
    const leads = Lead.findAll();
    const leadsByUser = {};
    
    leads.forEach(lead => {
      if (!leadsByUser[lead.userId]) {
        leadsByUser[lead.userId] = {
          userId: lead.userId,
          count: 0,
          totalValue: 0,
          stages: {}
        };
      }
      
      leadsByUser[lead.userId].count++;
      leadsByUser[lead.userId].totalValue += lead.expectedRevenue;
      
      if (!leadsByUser[lead.userId].stages[lead.stage]) {
        leadsByUser[lead.userId].stages[lead.stage] = 0;
      }
      leadsByUser[lead.userId].stages[lead.stage]++;
    });

    res.json(Object.values(leadsByUser));
  } catch (error) {
    console.error('Erro ao buscar leads por usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;