import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import StatsCard from '../components/dashboard/StatsCard'
import FinancialChart from '../components/dashboard/FinancialChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import EmployeeStats from '../components/dashboard/EmployeeStats'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import api from '../utils/api'
import {
  CurrencyDollarIcon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState({
    financial: null,
    employees: null,
    inventory: null,
    loading: true
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, loading, router])

  const loadDashboardData = async () => {
    try {
      const [financialRes, employeesRes] = await Promise.all([
        api.get('/financial/dashboard'),
        api.get('/employees/stats/overview')
      ])

      setDashboardData({
        financial: financialRes.data,
        employees: employeesRes.data,
        inventory: {
          total_products: 156,
          low_stock: 8,
          total_value: 45680.50
        },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  if (loading || dashboardData.loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const { financial, employees, inventory } = dashboardData

  return (
    <>
      <Head>
        <title>Dashboard - ERP Remotenyx</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Aqui está um resumo da sua empresa hoje.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Receita Mensal"
              value={`R$ ${financial?.period_summary?.total_income?.toLocaleString() || '0'}`}
              change="+12.5%"
              trend="up"
              icon={CurrencyDollarIcon}
              color="success"
            />
            
            <StatsCard
              title="Funcionários Ativos"
              value={employees?.total_employees || 0}
              subtitle={`${employees?.total_departments || 0} departamentos`}
              icon={UsersIcon}
              color="primary"
            />
            
            <StatsCard
              title="Produtos em Estoque"
              value={inventory?.total_products || 0}
              subtitle={`${inventory?.low_stock || 0} com estoque baixo`}
              icon={CubeIcon}
              color="warning"
            />
            
            <StatsCard
              title="Saldo Total"
              value={`R$ ${financial?.period_summary?.balance?.toLocaleString() || '0'}`}
              change={financial?.period_summary?.balance >= 0 ? '+' : '-'}
              trend={financial?.period_summary?.balance >= 0 ? 'up' : 'down'}
              icon={ChartBarIcon}
              color={financial?.period_summary?.balance >= 0 ? 'success' : 'danger'}
            />
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Financeiro */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Fluxo de Caixa (6 meses)
                </h3>
              </div>
              <div className="card-body">
                {financial?.cash_flow ? (
                  <FinancialChart data={financial.cash_flow} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Carregando gráfico...
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas de Funcionários */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Funcionários por Departamento
                </h3>
              </div>
              <div className="card-body">
                {employees?.employees_by_department ? (
                  <EmployeeStats data={employees.employees_by_department} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Carregando dados...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transações Recentes */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Transações Recentes
              </h3>
              <button 
                onClick={() => router.push('/financial')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todas →
              </button>
            </div>
            <div className="card-body p-0">
              {financial?.pending_transactions ? (
                <RecentTransactions data={financial.pending_transactions} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Nenhuma transação recente
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}