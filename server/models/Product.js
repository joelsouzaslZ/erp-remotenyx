// Mock Product model for demonstration
class Product {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.quantity = data.quantity;
    this.category = data.category;
    this.sku = data.sku;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static data = [
    {
      id: '1',
      name: 'Produto A',
      description: 'Descrição do Produto A',
      price: 100.00,
      quantity: 50,
      category: 'Eletrônicos',
      sku: 'PROD-A-001'
    },
    {
      id: '2',
      name: 'Produto B',
      description: 'Descrição do Produto B',
      price: 250.00,
      quantity: 8,
      category: 'Roupas',
      sku: 'PROD-B-002'
    },
    {
      id: '3',
      name: 'Produto C',
      description: 'Descrição do Produto C',
      price: 75.50,
      quantity: 120,
      category: 'Casa',
      sku: 'PROD-C-003'
    },
    {
      id: '4',
      name: 'Produto D',
      description: 'Descrição do Produto D',
      price: 30.00,
      quantity: 5,
      category: 'Eletrônicos',
      sku: 'PROD-D-004'
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
    const product = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.push(product);
    return product;
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
}

module.exports = Product;