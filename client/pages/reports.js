import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FinancialChart from '../components/dashboard/FinancialChart';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function Reports() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalEmployees: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchReports();
  }, [user, router, selectedPeriod]);

  const fetchReports = async () => {
    try {
      // Buscar dados financeiros
      const financialResponse = await api.get('/dashboard/financial-chart');
      setFinancialData(financialResponse.data);

      // Buscar estatísticas gerais
      const statsResponse = await api.get('/dashboard/stats');
      setStats({
        totalRevenue: statsResponse.data.revenue,
        totalExpenses: statsResponse.data.expenses,
        totalEmployees: statsResponse.data.employees,
        totalProducts: statsResponse.data.products,
        lowStockProducts: statsResponse.data.lowStockProducts
      });
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type) => {
    // Simulação de exportação
    alert(`Exportando relatório ${type}... (funcionalidade em desenvolvimento)`);
  };

  const calculateGrowth = () => {
    if (financialData.length < 2) return 0;
    const current = financialData[financialData.length - 1];
    const previous = financialData[financialData.length - 2];
    return ((current.profit - previous.profit) / Math.abs(previous.profit)) * 100;
  };

  if (loading) {
    return (
      <Layout title="Relatórios - ERP Remotenyx">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Relatórios - ERP Remotenyx">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análises e estatísticas do sistema</p>
          </div>
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Semana</option>
              <option value="month">Mês</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Ano</option>
            </select>
            <button
              onClick={() => exportReport('PDF')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Exportar PDF
            </button>
            <button
              onClick={() => exportReport('Excel')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Exportar Excel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Despesas Totais</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalExpenses.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Funcionários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ChartBarIcon className={`h-8 w-8 ${
                calculateGrowth() >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Crescimento</p>
                <p className={`text-2xl font-bold ${
                  calculateGrowth() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateGrowth() >= 0 ? '+' : ''}{calculateGrowth().toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-2">
            <FinancialChart data={financialData} />
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Receitas por Categoria</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendas</span>
                <span className="text-sm font-medium">R$ {(stats.totalRevenue * 0.6).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Serviços</span>
                <span className="text-sm font-medium">R$ {(stats.totalRevenue * 0.3).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outros</span>
                <span className="text-sm font-medium">R$ {(stats.totalRevenue * 0.1).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas por Categoria</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Salários</span>
                <span className="text-sm font-medium">R$ {(stats.totalExpenses * 0.5).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{width: '50%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Compras</span>
                <span className="text-sm font-medium">R$ {(stats.totalExpenses * 0.25).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '25%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Marketing</span>
                <span className="text-sm font-medium">R$ {(stats.totalExpenses * 0.15).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outros</span>
                <span className="text-sm font-medium">R$ {(stats.totalExpenses * 0.1).toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{width: '10%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalRevenue > 0 ? ((stats.totalRevenue - stats.totalExpenses) / stats.totalRevenue * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Margem de Lucro</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.totalEmployees > 0 ? (stats.totalRevenue / stats.totalEmployees).toLocaleString('pt-BR', {maximumFractionDigits: 0}) : 0}
              </p>
              <p className="text-sm text-gray-600">Receita por Funcionário</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                stats.lowStockProducts === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.lowStockProducts}
              </p>
              <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}