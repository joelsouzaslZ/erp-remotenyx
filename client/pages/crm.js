import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function CRM() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [stats, setStats] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    partnerName: '',
    email: '',
    phone: '',
    stage: 'new',
    priority: '0',
    expectedRevenue: '',
    probability: '',
    userId: '',
    source: 'website',
    description: '',
    dateDeadline: ''
  });

  const stages = [
    { id: 'new', name: 'Novo', color: 'bg-gray-100 text-gray-800' },
    { id: 'qualified', name: 'Qualificado', color: 'bg-blue-100 text-blue-800' },
    { id: 'proposition', name: 'Proposta', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'won', name: 'Ganho', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Perdido', color: 'bg-red-100 text-red-800' }
  ];

  const priorities = [
    { id: '0', name: 'Normal', icon: '' },
    { id: '1', name: 'Alta', icon: '🔴' }
  ];

  const sources = [
    { id: 'website', name: 'Website' },
    { id: 'referral', name: 'Indicação' },
    { id: 'social_media', name: 'Redes Sociais' },
    { id: 'phone', name: 'Telefone' },
    { id: 'email', name: 'Email' },
    { id: 'other', name: 'Outro' }
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchLeads();
    fetchStats();
  }, [user, router]);

  const fetchLeads = async () => {
    try {
      // Mock data - substituir por API real
      const mockLeads = [
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
          source: 'website',
          description: 'Necessidade de sistema ERP completo para gestão empresarial',
          dateDeadline: '2025-01-15',
          createdAt: '2024-11-01'
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
          source: 'referral',
          description: 'Serviços de consultoria em tecnologia da informação',
          dateDeadline: '2024-12-30',
          createdAt: '2024-11-15'
        }
      ];
      setLeads(mockLeads);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats
      setStats({
        new: 5,
        qualified: 3,
        proposition: 2,
        won: 8,
        lost: 4,
        totalRevenue: 125000,
        expectedRevenue: 85000,
        totalLeads: 22
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        expectedRevenue: parseFloat(formData.expectedRevenue) || 0,
        probability: parseInt(formData.probability) || 0
      };
      
      if (editingLead) {
        // Update lead
        const updatedLeads = leads.map(lead => 
          lead.id === editingLead.id ? { ...lead, ...data } : lead
        );
        setLeads(updatedLeads);
      } else {
        // Create new lead
        const newLead = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString()
        };
        setLeads([...leads, newLead]);
      }
      
      setShowModal(false);
      setEditingLead(null);
      setFormData({
        name: '', partnerName: '', email: '', phone: '', stage: 'new',
        priority: '0', expectedRevenue: '', probability: '', userId: '',
        source: 'website', description: '', dateDeadline: ''
      });
      fetchStats(); // Atualizar stats
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      partnerName: lead.partnerName,
      email: lead.email,
      phone: lead.phone,
      stage: lead.stage,
      priority: lead.priority,
      expectedRevenue: lead.expectedRevenue.toString(),
      probability: lead.probability.toString(),
      userId: lead.userId,
      source: lead.source,
      description: lead.description,
      dateDeadline: lead.dateDeadline
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este lead?')) {
      try {
        setLeads(leads.filter(lead => lead.id !== id));
        fetchStats(); // Atualizar stats
      } catch (error) {
        console.error('Erro ao deletar lead:', error);
      }
    }
  };

  const getStageInfo = (stageId) => {
    return stages.find(stage => stage.id === stageId) || stages[0];
  };

  const getPriorityInfo = (priorityId) => {
    return priorities.find(p => p.id === priorityId) || priorities[0];
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === '' || lead.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return (
      <Layout title="CRM - ERP Remotenyx">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="CRM - ERP Remotenyx">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Oportunidades</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.qualified || 0) + (stats.proposition || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">R$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receita Esperada</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.expectedRevenue?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">%</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLeads > 0 ? (((stats.won || 0) / stats.totalLeads) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM - Gestão de Leads</h1>
            <p className="text-gray-600">Gerencie oportunidades e pipeline de vendas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Novo Lead</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar leads..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="">Todos os estágios</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead / Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estágio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Esperado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probabilidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const stageInfo = getStageInfo(lead.stage);
                const priorityInfo = getPriorityInfo(lead.priority);
                
                return (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          {priorityInfo.icon && (
                            <span className="ml-2" title="Alta prioridade">
                              {priorityInfo.icon}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{lead.partnerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {lead.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stageInfo.color}`}>
                        {stageInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        R$ {lead.expectedRevenue.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.probability}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingLead ? 'Editar Lead' : 'Novo Lead'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome da oportunidade"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nome do cliente/empresa"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Telefone"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>{priority.name}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  >
                    {sources.map(source => (
                      <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor esperado (R$)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.expectedRevenue}
                    onChange={(e) => setFormData({...formData, expectedRevenue: e.target.value})}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Probabilidade (%)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: e.target.value})}
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dateDeadline}
                    onChange={(e) => setFormData({...formData, dateDeadline: e.target.value})}
                  />
                </div>

                <textarea
                  placeholder="Descrição / Observações"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingLead(null);
                      setFormData({
                        name: '', partnerName: '', email: '', phone: '', stage: 'new',
                        priority: '0', expectedRevenue: '', probability: '', userId: '',
                        source: 'website', description: '', dateDeadline: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingLead ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}