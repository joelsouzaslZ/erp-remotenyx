import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import api from '../utils/api';

export default function Setup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [dbConfig, setDbConfig] = useState({
    dbName: 'erp_remotenyx',
    dbUser: 'erp_admin',
    dbPassword: 'erp_admin_2025',
    dbHost: 'localhost',
    dbPort: '5432'
  });

  const [adminConfig, setAdminConfig] = useState({
    name: 'Administrador',
    email: 'admin@remotenyx.com',
    password: '',
    confirmPassword: '',
    companyName: 'Minha Empresa'
  });

  const handleDbChange = (e) => {
    setDbConfig({
      ...dbConfig,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminChange = (e) => {
    setAdminConfig({
      ...adminConfig,
      [e.target.name]: e.target.value
    });
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar conexão com o banco
      const response = await api.post('/setup/validate-db', dbConfig);
      if (response.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao validar configuração do banco de dados');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (adminConfig.password !== adminConfig.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (adminConfig.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Criar banco de dados e usuário administrador
      await api.post('/setup/initialize', {
        ...dbConfig,
        ...adminConfig
      });

      // Redirecionar para login
      router.push('/login?setup=success');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao inicializar o sistema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Configuração Inicial - ERP Remotenyx</title>
        <meta name="description" content="Configure seu sistema ERP pela primeira vez" />
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="text-6xl">📊</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo ao ERP Remotenyx
          </h1>
          <p className="text-lg text-gray-600">
            Configure seu sistema em apenas 2 passos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Banco de Dados</span>
            </div>
            <div className={`mx-4 h-1 w-16 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Administrador</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Configuração do Banco de Dados
                </h2>
                <p className="text-gray-600">
                  Configure a conexão com o PostgreSQL
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="dbName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Banco de Dados
                  </label>
                  <input
                    type="text"
                    id="dbName"
                    name="dbName"
                    required
                    value={dbConfig.dbName}
                    onChange={handleDbChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="erp_remotenyx"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dbHost" className="block text-sm font-medium text-gray-700 mb-1">
                      Host
                    </label>
                    <input
                      type="text"
                      id="dbHost"
                      name="dbHost"
                      required
                      value={dbConfig.dbHost}
                      onChange={handleDbChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="localhost"
                    />
                  </div>

                  <div>
                    <label htmlFor="dbPort" className="block text-sm font-medium text-gray-700 mb-1">
                      Porta
                    </label>
                    <input
                      type="text"
                      id="dbPort"
                      name="dbPort"
                      required
                      value={dbConfig.dbPort}
                      onChange={handleDbChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5432"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dbUser" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário do Banco
                  </label>
                  <input
                    type="text"
                    id="dbUser"
                    name="dbUser"
                    required
                    value={dbConfig.dbUser}
                    onChange={handleDbChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="erp_admin"
                  />
                </div>

                <div>
                  <label htmlFor="dbPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha do Banco
                  </label>
                  <input
                    type="password"
                    id="dbPassword"
                    name="dbPassword"
                    value={dbConfig.dbPassword}
                    onChange={handleDbChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deixe em branco se não houver senha"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Validando...' : 'Próximo →'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Criar Conta Administrador
                </h2>
                <p className="text-gray-600">
                  Configure o usuário administrador do sistema
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    value={adminConfig.companyName}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minha Empresa"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Administrador
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={adminConfig.name}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={adminConfig.email}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@empresa.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={adminConfig.password}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={adminConfig.confirmPassword}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Inicializando...' : 'Concluir Configuração'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Suas informações estão seguras e serão criptografadas
          </p>
        </div>
      </div>
    </div>
  );
}
