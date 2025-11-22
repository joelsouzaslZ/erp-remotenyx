const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { Department } = require('../models');

// Listar funcionários com paginação e filtros
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '' } = req.query;
    const offset = (page - 1) * limit;

    let employees = Employee.findAll();
    const departments = Department.findAll();
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.phone.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por departamento
    if (department) {
      employees = employees.filter(emp => emp.departmentId === department);
    }
    
    // Adicionar dados do departamento
    const employeesWithDept = employees.map(emp => ({
      ...emp,
      department: departments.find(dept => dept.id === emp.departmentId)
    }));
    
    const count = employeesWithDept.length;
    const rows = employeesWithDept.slice(offset, offset + limit);

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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Buscar dados do departamento
    const department = Department.findById(employee.departmentId);
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
router.post('/', (req, res) => {
  try {
    const { name, email, phone, position, departmentId, salary, hireDate } = req.body;
    
    // Validar dados obrigatórios
    if (!name || !email || !position || !departmentId) {
      return res.status(400).json({ 
        error: 'Nome, email, cargo e departamento são obrigatórios' 
      });
    }

    const employee = Employee.create({
      name,
      email,
      phone,
      position,
      departmentId,
      salary,
      hireDate
    });

    // Buscar dados do departamento
    const department = Department.findById(departmentId);
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
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position, departmentId, salary, hireDate } = req.body;
    
    let employee = Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    employee = Employee.update(id, {
      name,
      email,
      phone,
      position,
      departmentId,
      salary,
      hireDate
    });

    // Buscar dados do departamento
    const department = Department.findById(employee.departmentId);
    const employeeWithDept = {
      ...employee,
      department
    };

    res.json(employeeWithDept);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar funcionário
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    Employee.delete(id);
    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de funcionários
router.get('/stats/overview', (req, res) => {
  try {
    const employees = Employee.findAll();
    const departments = Department.findAll();
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    
    // Contar funcionários por departamento
    const employeesByDept = departments.map(dept => ({
      department_name: dept.name,
      count: employees.filter(emp => emp.departmentId === dept.id).length
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
router.get('/departments/list', (req, res) => {
  try {
    const departments = Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Erro ao listar departamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;