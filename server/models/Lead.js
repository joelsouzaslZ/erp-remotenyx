// Mock Lead model baseado no CRM do Odoo
class Lead {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.partnerName = data.partnerName;
    this.email = data.email;
    this.phone = data.phone;
    this.stage = data.stage || 'new';
    this.priority = data.priority || '0';
    this.expectedRevenue = data.expectedRevenue || 0;
    this.probability = data.probability || 0;
    this.userId = data.userId;
    this.teamId = data.teamId;
    this.source = data.source || 'website';
    this.description = data.description || '';
    this.dateDeadline = data.dateDeadline;
    this.lostReason = data.lostReason;
    this.tags = data.tags || [];
    this.activities = data.activities || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static data = [
    {
      id: '1',
      name: 'Sistema ERP para Empresa X',
      partnerName: 'Empresa X Ltda',
      email: 'contato@empresax.com.br',
      phone: '(11) 3333-3333',
      stage: 'qualified',
      priority: '1',
      expectedRevenue: 50000,
      probability: 60,
      userId: '1',
      teamId: '1',
      source: 'website',
      description: 'Necessidade de sistema ERP completo para gestão empresarial',
      dateDeadline: '2025-01-15',
      tags: ['ERP', 'Software', 'Enterprise'],
      activities: [
        { type: 'call', date: '2024-12-01', description: 'Primeira conversa' },
        { type: 'meeting', date: '2024-12-05', description: 'Apresentação da proposta' }
      ]
    },
    {
      id: '2',
      name: 'Consultoria em TI',
      partnerName: 'Tech Solutions',
      email: 'info@techsolutions.com',
      phone: '(11) 4444-4444',
      stage: 'proposition',
      priority: '0',
      expectedRevenue: 25000,
      probability: 80,
      userId: '2',
      teamId: '1',
      source: 'referral',
      description: 'Serviços de consultoria em tecnologia da informação',
      dateDeadline: '2024-12-30',
      tags: ['Consultoria', 'TI'],
      activities: [
        { type: 'email', date: '2024-11-20', description: 'Envio de proposta' }
      ]
    },
    {
      id: '3',
      name: 'Website Corporativo',
      partnerName: 'StartupABC',
      email: 'contact@startupabc.com',
      phone: '(11) 5555-5555',
      stage: 'new',
      priority: '0',
      expectedRevenue: 15000,
      probability: 20,
      userId: '1',
      teamId: '1',
      source: 'social_media',
      description: 'Desenvolvimento de website corporativo com área de clientes',
      dateDeadline: '2025-02-28',
      tags: ['Website', 'Startup'],
      activities: []
    }
  ];

  static stages = [
    { id: 'new', name: 'Novo', color: '#6B7280' },
    { id: 'qualified', name: 'Qualificado', color: '#3B82F6' },
    { id: 'proposition', name: 'Proposta', color: '#F59E0B' },
    { id: 'won', name: 'Ganho', color: '#10B981' },
    { id: 'lost', name: 'Perdido', color: '#EF4444' }
  ];

  static findAll() {
    return this.data.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static findById(id) {
    return this.data.find(item => item.id === id);
  }

  static create(data) {
    const lead = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(lead);
    return lead;
  }

  static update(id, data) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...data,
        updatedAt: new Date()
      };
      return this.data[index];
    }
    return null;
  }

  static delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    return null;
  }

  static findByStage(stage) {
    return this.data.filter(lead => lead.stage === stage);
  }

  static getStats() {
    const stats = {};
    this.stages.forEach(stage => {
      stats[stage.id] = this.data.filter(lead => lead.stage === stage.id).length;
    });
    
    const totalRevenue = this.data
      .filter(lead => lead.stage === 'won')
      .reduce((sum, lead) => sum + lead.expectedRevenue, 0);
    
    const expectedRevenue = this.data
      .filter(lead => ['qualified', 'proposition'].includes(lead.stage))
      .reduce((sum, lead) => sum + (lead.expectedRevenue * lead.probability / 100), 0);

    return {
      ...stats,
      totalRevenue,
      expectedRevenue,
      totalLeads: this.data.length
    };
  }
}

module.exports = Lead;