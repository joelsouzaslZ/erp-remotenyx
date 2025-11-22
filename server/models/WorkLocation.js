// Mock WorkLocation model baseado no HR do Odoo
class WorkLocation {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.complete_name = data.complete_name || data.name;
    this.active = data.active !== undefined ? data.active : true;
    this.address_id = data.address_id;
    this.company_id = data.company_id || '1';
    this.location_type = data.location_type || 'office';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static data = [
    {
      id: '1',
      name: 'Escritório Principal',
      complete_name: 'Escritório Principal - São Paulo/SP',
      active: true,
      address_id: '1',
      company_id: '1',
      location_type: 'office'
    },
    {
      id: '2',
      name: 'Home Office',
      complete_name: 'Trabalho Remoto - Home Office',
      active: true,
      address_id: null,
      company_id: '1',
      location_type: 'home'
    },
    {
      id: '3',
      name: 'Filial Rio de Janeiro',
      complete_name: 'Filial Rio de Janeiro - RJ',
      active: true,
      address_id: '2',
      company_id: '1',
      location_type: 'office'
    },
    {
      id: '4',
      name: 'Coworking',
      complete_name: 'Espaço de Coworking - Various',
      active: true,
      address_id: null,
      company_id: '1',
      location_type: 'other'
    }
  ];

  static locationTypes = [
    { id: 'office', name: 'Escritório' },
    { id: 'home', name: 'Home Office' },
    { id: 'other', name: 'Outro' }
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
    const location = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(location);
    return location;
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

  static findActive() {
    return this.data.filter(location => location.active === true);
  }

  static findByType(type) {
    return this.data.filter(location => location.location_type === type);
  }
}

module.exports = WorkLocation;