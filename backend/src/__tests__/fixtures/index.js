/**
 * Test Fixtures
 * 
 * Datos de prueba reutilizables
 */

/**
 * Usuarios de prueba
 */
const users = {
  admin: {
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+1234567890',
    isActive: true
  },
  
  servicedesk: {
    name: 'Service Desk Test',
    email: 'servicedesk@test.com',
    password: 'Service123!',
    role: 'servicedesk',
    phone: '+1234567891',
    isActive: true
  },
  
  user: {
    name: 'User Test',
    email: 'user@test.com',
    password: 'User123!',
    role: 'user',
    phone: '+1234567892',
    isActive: true
  },

  inactive: {
    name: 'Inactive User',
    email: 'inactive@test.com',
    password: 'Inactive123!',
    role: 'user',
    phone: '+1234567893',
    isActive: false
  }
};

/**
 * Oficinas de prueba
 */
const offices = {
  main: {
    name: 'Main Office',
    code: 'MAIN-01',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    phone: '+1234567890',
    email: 'main@office.com',
    capacity: 100,
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    isActive: true
  },

  branch: {
    name: 'Branch Office',
    code: 'BRANCH-01',
    address: '456 Branch Ave',
    city: 'Los Angeles',
    country: 'USA',
    phone: '+1234567891',
    email: 'branch@office.com',
    capacity: 50,
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    isActive: true
  }
};

/**
 * Reportes de prueba
 */
const reports = {
  hardware: {
    title: 'Computer not working',
    description: 'My computer does not turn on after power outage',
    category: 'hardware',
    priority: 'high',
    location: 'Office 101',
    workstation: 'WS-101'
  },

  software: {
    title: 'Cannot access email',
    description: 'Getting authentication error when trying to login to email',
    category: 'email',
    priority: 'medium',
    location: 'Office 202',
    workstation: 'WS-202'
  },

  network: {
    title: 'No internet connection',
    description: 'WiFi is connected but no internet access',
    category: 'network',
    priority: 'critical',
    location: 'Office 303'
  }
};

/**
 * Tokens JWT de prueba (generados con usuarios de prueba)
 */
const tokens = {
  // Se generarán dinámicamente en los tests
  admin: null,
  servicedesk: null,
  user: null
};

module.exports = {
  users,
  offices,
  reports,
  tokens
};
