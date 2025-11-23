import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function Financial() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0 });
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: ''
  });

  const categories = {
    income: ['Vendas', 'Serviços', 'Investimentos', 'Outros'],
    expense: ['Compras', 'Salários', 'Marketing', 'Utilidades', 'Outros']
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTransactions();
    fetchStats();
  }, [user, router]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/financial/transactions');
      // API retorna { transactions: [...], total, ... }
      setTransactions(response.data && response.data.transactions ? response.data.transactions : []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/financial/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (editingTransaction) {
        await api.put(`/financial/transactions/${editingTransaction.id}`, data);
      } else {
        await api.post('/financial/transactions', data);
      }
      
      setShowModal(false);
      setEditingTransaction(null);
      setFormData({ type: 'income', amount: '', description: '', category: '' });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: (transaction.amount !== undefined && transaction.amount !== null) ? transaction.amount.toString() : '',
      description: transaction.description || '',
      category: transaction.category || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await api.delete(`/financial/transactions/${id}`);
        fetchTransactions();
        fetchStats();
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Financeiro - ERP Remotenyx">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Financeiro - ERP Remotenyx">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center">
              <ArrowUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Receitas</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {stats.income.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="flex items-center">
              <ArrowDownIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Despesas</p>
                <p className="text-2xl font-bold text-red-900">
                  R$ {stats.expense.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${stats.profit >= 0 ? 'bg-blue-50' : 'bg-red-50'} p-6 rounded-lg`}>
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                stats.profit >= 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {stats.profit >= 0 ? '+' : '-'}
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  stats.profit >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>Lucro</p>
                <p className={`text-2xl font-bold ${
                  stats.profit >= 0 ? 'text-blue-900' : 'text-red-900'
                }`}>
                  R$ {Math.abs(stats.profit).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
            <p className="text-gray-600">Gerencie receitas e despesas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nova Transação</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? '▲ Receita' : '▼ Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{transaction.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount || 0).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt || transaction.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                  required
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Descrição"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Selecione a categoria</option>
                  {categories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTransaction(null);
                      setFormData({ type: 'income', amount: '', description: '', category: '' });
                    }}
                    className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTransaction ? 'Atualizar' : 'Criar'}
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