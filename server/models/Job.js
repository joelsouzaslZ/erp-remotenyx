// Mock Job model baseado no HR do Odoo
class Job {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.departmentId = data.departmentId;
    this.description = data.description || '';
    this.requirements = data.requirements || '';
    this.responsibilities = data.responsibilities || '';
    this.noOfRecruitment = data.noOfRecruitment || 1;
    this.noOfEmployee = data.noOfEmployee || 0;
    this.isPublished = data.isPublished || false;
    this.salaryProposed = data.salaryProposed || 0;
    this.salaryExpected = data.salaryExpected || 0;
    this.contractType = data.contractType || 'permanent';
    this.state = data.state || 'recruit';
    this.companyId = data.companyId || '1';
    this.managerId = data.managerId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static data = [
    {
      id: '1',
      name: 'Desenvolvedor Full Stack',
      departmentId: '1',
      description: 'Vaga para desenvolvedor com experiência em tecnologias web modernas',
      requirements: 'Experiência com JavaScript, React, Node.js, bancos de dados',
      responsibilities: 'Desenvolvimento de aplicações web, manutenção de sistemas, colaboração em equipe',
      noOfRecruitment: 2,
      noOfEmployee: 3,
      isPublished: true,
      salaryProposed: 6000,
      salaryExpected: 6500,
      contractType: 'permanent',
      state: 'recruit',
      managerId: '3'
    },
    {
      id: '2',
      name: 'Designer UX/UI',
      departmentId: '2',
      description: 'Profissional para criação de interfaces e experiências de usuário',
      requirements: 'Experiência com Figma, Adobe XD, conhecimentos em UX',
      responsibilities: 'Criação de protótipos, design de interfaces, pesquisa de usuário',
      noOfRecruitment: 1,
      noOfEmployee: 2,
      isPublished: true,
      salaryProposed: 4500,
      salaryExpected: 5000,
      contractType: 'permanent',
      state: 'recruit',
      managerId: '2'
    },
    {
      id: '3',
      name: 'Analista de Marketing',
      departmentId: '4',
      description: 'Profissional para estratégias de marketing digital',
      requirements: 'Experiência em marketing digital, Google Ads, redes sociais',
      responsibilities: 'Campanhas de marketing, análise de métricas, gestão de redes sociais',
      noOfRecruitment: 1,
      noOfEmployee: 0,
      isPublished: false,
      salaryProposed: 4000,
      salaryExpected: 4500,
      contractType: 'permanent',
      state: 'open',
      managerId: null
    }
  ];

  static contractTypes = [
    { id: 'permanent', name: 'Permanente' },
    { id: 'temporary', name: 'Temporário' },
    { id: 'internship', name: 'Estágio' },
    { id: 'freelance', name: 'Freelancer' }
  ];

  static states = [
    { id: 'recruit', name: 'Recrutamento' },
    { id: 'open', name: 'Não Recrutando' },
    { id: 'closed', name: 'Fechado' }
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
    const job = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(job);
    return job;
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

  static findByDepartment(departmentId) {
    return this.data.filter(job => job.departmentId === departmentId);
  }

  static findPublished() {
    return this.data.filter(job => job.isPublished === true);
  }

  static getStats() {
    return {
      total: this.data.length,
      published: this.data.filter(j => j.isPublished).length,
      recruiting: this.data.filter(j => j.state === 'recruit').length,
      totalPositions: this.data.reduce((sum, j) => sum + j.noOfRecruitment, 0),
      totalEmployees: this.data.reduce((sum, j) => sum + j.noOfEmployee, 0)
    };
  }
}

module.exports = Job;