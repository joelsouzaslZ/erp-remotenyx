// Mock Employee model expandido com campos do Odoo HR
class Employee {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.position = data.position;
    this.departmentId = data.departmentId;
    this.salary = data.salary;
    this.hireDate = data.hireDate;
    
    // Campos avançados baseados no Odoo
    this.managerId = data.managerId || null;
    this.jobTitle = data.jobTitle || data.position;
    this.workLocation = data.workLocation || 'Não informado';
    this.workLocationType = data.workLocationType || 'office'; // office, home, other
    this.contractType = data.contractType || 'CLT';
    this.contractStart = data.contractStart || data.hireDate;
    this.contractEnd = data.contractEnd || null;
    this.emergencyContact = data.emergencyContact || '';
    this.emergencyPhone = data.emergencyPhone || '';
    this.birthday = data.birthday || null;
    this.privateEmail = data.privateEmail || '';
    this.privatePhone = data.privatePhone || '';
    this.address = data.address || '';
    this.bankAccount = data.bankAccount || '';
    this.certificate = data.certificate || '';
    this.studyField = data.studyField || '';
    this.skills = data.skills || [];
    this.status = data.status || 'active'; // active, inactive, terminated
    
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static data = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      position: 'Desenvolvedor Senior',
      departmentId: '1',
      salary: 5000,
      hireDate: '2023-01-15',
      managerId: '3',
      jobTitle: 'Desenvolvedor Full Stack',
      workLocation: 'Escritório - São Paulo',
      workLocationType: 'office',
      contractType: 'CLT',
      contractStart: '2023-01-15',
      contractEnd: null,
      emergencyContact: 'Maria Silva',
      emergencyPhone: '(11) 95555-5555',
      birthday: '1990-05-15',
      privateEmail: 'joao.silva@gmail.com',
      privatePhone: '(11) 96666-6666',
      address: 'Rua A, 123 - São Paulo/SP',
      bankAccount: '001-12345-6',
      certificate: 'Superior Completo',
      studyField: 'Ciência da Computação',
      skills: ['JavaScript', 'React', 'Node.js'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '(11) 88888-8888',
      position: 'Designer UX/UI',
      departmentId: '2',
      salary: 4500,
      hireDate: '2023-03-20',
      managerId: '3',
      jobTitle: 'Designer de Experiência do Usuário',
      workLocation: 'Home Office',
      workLocationType: 'home',
      contractType: 'PJ',
      contractStart: '2023-03-20',
      contractEnd: '2024-03-20',
      emergencyContact: 'José Santos',
      emergencyPhone: '(11) 94444-4444',
      birthday: '1992-08-22',
      privateEmail: 'maria.santos@gmail.com',
      privatePhone: '(11) 97777-7777',
      address: 'Av. B, 456 - Rio de Janeiro/RJ',
      bankAccount: '341-54321-9',
      certificate: 'Superior Completo',
      studyField: 'Design Gráfico',
      skills: ['Figma', 'Adobe XD', 'Photoshop'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      phone: '(11) 77777-7777',
      position: 'Gerente de TI',
      departmentId: '1',
      salary: 8000,
      hireDate: '2022-05-10',
      managerId: null,
      jobTitle: 'Gerente de Tecnologia da Informação',
      workLocation: 'Escritório - São Paulo',
      workLocationType: 'office',
      contractType: 'CLT',
      contractStart: '2022-05-10',
      contractEnd: null,
      emergencyContact: 'Ana Costa',
      emergencyPhone: '(11) 93333-3333',
      birthday: '1985-12-03',
      privateEmail: 'pedro.costa@gmail.com',
      privatePhone: '(11) 98888-8888',
      address: 'Rua C, 789 - São Paulo/SP',
      bankAccount: '237-98765-4',
      certificate: 'MBA',
      studyField: 'Administração',
      skills: ['Gestão de Equipes', 'Estratégia', 'Liderança'],
      status: 'active'
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      phone: '(11) 66666-6666',
      position: 'Analista de RH',
      departmentId: '3',
      salary: 3500,
      hireDate: '2023-06-01',
      managerId: null,
      jobTitle: 'Analista de Recursos Humanos',
      workLocation: 'Escritório - São Paulo',
      workLocationType: 'office',
      contractType: 'CLT',
      contractStart: '2023-06-01',
      contractEnd: null,
      emergencyContact: 'Carlos Oliveira',
      emergencyPhone: '(11) 91111-1111',
      birthday: '1988-04-18',
      privateEmail: 'ana.oliveira@gmail.com',
      privatePhone: '(11) 92222-2222',
      address: 'Rua D, 321 - São Paulo/SP',
      bankAccount: '104-11111-1',
      certificate: 'Superior Completo',
      studyField: 'Psicologia',
      skills: ['Recrutamento', 'Seleção', 'Treinamento'],
      status: 'active'
    }
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
    const employee = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(employee);
    return employee;
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

  // Método para buscar subordinados
  static findSubordinates(managerId) {
    return this.data.filter(emp => emp.managerId === managerId);
  }

  // Método para buscar por skills
  static findBySkills(skills) {
    return this.data.filter(emp => 
      emp.skills && emp.skills.some(skill => 
        skills.includes(skill)
      )
    );
  }
}

module.exports = Employee;