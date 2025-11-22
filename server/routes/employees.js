const express = require('express');
const router = express.Router();
const { Employee, Department } = require('../models');

// Listar funcionários com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '' } = req.query;
    const offset = (page - 1) * limit;

    let employees = await Employee.findAll();
    const departments = await Department.findAll();
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
        (emp.phone && emp.phone.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por departamento
    if (department) {
      employees = employees.filter(emp => emp.department_id == department);
    }
    
    // Adicionar dados do departamento
    const employeesWithDept = employees.map(emp => ({
      ...emp,
      department: departments.find(dept => dept.id == emp.department_id)
    }));
    
    const count = employeesWithDept.length;
    const rows = employeesWithDept.slice(offset, offset + parseInt(limit));

    res.json({
      employees: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar funcionário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Buscar dados do departamento
    const departments = await Department.findAll();
    const department = departments.find(d => d.id == employee.department_id);
    const employeeWithDept = {
      ...employee,
      department
    };

    res.json(employeeWithDept);
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo funcionário
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, position, department_id, salary, hire_date } = req.body;
    
    // Validar dados obrigatórios
    if (!name || !email || !position || !department_id) {
      return res.status(400).json({ 
        error: 'Nome, email, cargo e departamento são obrigatórios' 
      });
    }

    const employee = await Employee.create({
      name,
      email,
      phone,
      position,
      department_id,
      salary,
      hire_date
    });

    // Buscar dados do departamento
    const departments = await Department.findAll();
    const department = departments.find(d => d.id == department_id);
    const employeeWithDept = {
      ...employee,
      department
    };

    res.status(201).json(employeeWithDept);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar funcionário
router.put('/:id', async (req, res) => {
  try {
    // TODO: Implement update functionality
    res.status(501).json({ error: 'Funcionalidade em desenvolvimento' });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar funcionário
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Implement delete functionality
    res.status(501).json({ error: 'Funcionalidade em desenvolvimento' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de funcionários
router.get('/stats/overview', async (req, res) => {
  try {
    const employees = await Employee.findAll();
    const departments = await Department.findAll();
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    
    // Contar funcionários por departamento
    const employeesByDept = departments.map(dept => ({
      department_name: dept.name,
      count: employees.filter(emp => emp.department_id == dept.id).length
    }));

    res.json({
      total_employees: totalEmployees,
      total_departments: totalDepartments,
      employees_by_department: employeesByDept
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar departamentos
router.get('/departments/list', async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Erro ao listar departamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;