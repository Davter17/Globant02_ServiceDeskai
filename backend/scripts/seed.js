/**
 * Database Seed Script
 * 
 * Crea usuarios, oficinas y reportes de ejemplo para desarrollo y demos
 * 
 * Uso:
 *   npm run seed           - Crea datos de ejemplo
 *   npm run seed:clean     - Limpia la base de datos
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Office = require('../src/models/Office');
const Report = require('../src/models/Report');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`)
};

// Datos de usuarios iniciales
const users = [
  // ADMINISTRADORES
  {
    name: 'Admin Principal',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '5551234567',
    department: 'IT Administration',
    isActive: true
  },
  {
    name: 'Carlos Rodriguez',
    email: 'admin@globant.com',
    password: 'AdminGlobant2024!',
    role: 'admin',
    phone: '5551234568',
    department: 'IT Administration',
    isActive: true
  },
  
  // SERVICE DESK
  {
    name: 'Service Desk Test',
    email: 'servicedesk@test.com',
    password: 'Service123!',
    role: 'servicedesk',
    phone: '5552345678',
    department: 'Technical Support',
    isActive: true
  },
  {
    name: 'Maria Garcia',
    email: 'servicedesk@globant.com',
    password: 'ServiceDesk2024!',
    role: 'servicedesk',
    phone: '5552345679',
    department: 'Technical Support',
    isActive: true
  },
  {
    name: 'Pedro Sanchez',
    email: 'pedro.sanchez@globant.com',
    password: 'Service123!',
    role: 'servicedesk',
    phone: '5552345680',
    department: 'Technical Support',
    isActive: true
  },
  
  // USUARIOS REGULARES
  {
    name: 'Usuario Test',
    email: 'user@test.com',
    password: 'User123!',
    role: 'user',
    phone: '5553456789',
    department: 'General',
    isActive: true
  },
  {
    name: 'Juan Perez',
    email: 'juan.perez@globant.com',
    password: 'UserGlobant2024!',
    role: 'user',
    phone: '5553456790',
    department: 'Development',
    isActive: true
  },
  {
    name: 'Ana Martinez',
    email: 'ana.martinez@globant.com',
    password: 'UserGlobant2024!',
    role: 'user',
    phone: '5554567890',
    department: 'Design',
    isActive: true
  },
  {
    name: 'Luis Fernandez',
    email: 'luis.fernandez@globant.com',
    password: 'UserGlobant2024!',
    role: 'user',
    phone: '5555678901',
    department: 'QA',
    isActive: true
  },
  {
    name: 'Sofia Lopez',
    email: 'sofia.lopez@globant.com',
    password: 'User123!',
    role: 'user',
    phone: '5556789012',
    department: 'Marketing',
    isActive: true
  },
  {
    name: 'Miguel Torres',
    email: 'miguel.torres@globant.com',
    password: 'User123!',
    role: 'user',
    phone: '5557890123',
    department: 'Sales',
    isActive: true
  },
  {
    name: 'Laura Ramirez',
    email: 'laura.ramirez@globant.com',
    password: 'User123!',
    role: 'user',
    phone: '5558901234',
    department: 'HR',
    isActive: true
  }
];

// Datos de oficinas iniciales
const offices = [
  {
    code: 'NY-MAIN-01',
    name: 'New York Headquarters',
    capacity: 200,
    location: {
      address: '350 Fifth Avenue',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      postalCode: '10118',
      coordinates: {
        latitude: 40.7484,
        longitude: -73.9857
      }
    },
    isActive: true
  },
  {
    code: 'LA-WEST-01',
    name: 'Los Angeles Office',
    capacity: 150,
    location: {
      address: '633 West 5th Street',
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
      postalCode: '90071',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2537
      }
    },
    isActive: true
  },
  {
    code: 'CHI-CENTRAL-01',
    name: 'Chicago Branch',
    capacity: 120,
    location: {
      address: '233 South Wacker Drive',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      postalCode: '60606',
      coordinates: {
        latitude: 41.8781,
        longitude: -87.6298
      }
    },
    isActive: true
  },
  {
    code: 'SF-TECH-01',
    name: 'San Francisco Tech Hub',
    capacity: 180,
    location: {
      address: '555 California Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      postalCode: '94104',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    isActive: true
  }
];

// Función para crear reportes de ejemplo
const createSampleReports = (users, offices) => {
  const categories = ['hardware', 'software', 'network', 'email', 'printer', 'phone', 'access', 'other'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];

  const reportTemplates = [
    {
      category: 'hardware',
      priority: 'high',
      title: 'Computer not turning on',
      description: 'My workstation computer is not powering on. I tried different power cables but no response.'
    },
    {
      category: 'software',
      priority: 'medium',
      title: 'Unable to access company portal',
      description: 'Getting 403 error when trying to access the employee portal. Already tried clearing cache.'
    },
    {
      category: 'network',
      priority: 'critical',
      title: 'No internet connection in entire floor',
      description: 'The entire 5th floor has no internet connectivity. Multiple users affected.'
    },
    {
      category: 'email',
      priority: 'medium',
      title: 'Cannot send emails',
      description: 'Outlook shows "sending" but emails never go out. Can receive emails fine.'
    },
    {
      category: 'printer',
      priority: 'low',
      title: 'Printer paper jam',
      description: 'The main floor printer has a paper jam. Already tried removing visible paper.'
    },
    {
      category: 'phone',
      priority: 'medium',
      title: 'Desk phone no dial tone',
      description: 'My desk phone extension 4521 has no dial tone. Cannot make or receive calls.'
    },
    {
      category: 'access',
      priority: 'high',
      title: 'Badge not working',
      description: 'My security badge is not opening the main entrance door.'
    },
    {
      category: 'hardware',
      priority: 'low',
      title: 'Monitor flickering',
      description: 'Left monitor keeps flickering. Already tried different cables.'
    },
    {
      category: 'software',
      priority: 'high',
      title: 'License activation failed',
      description: 'Adobe Creative Suite asking for license activation but code is not working.'
    },
    {
      category: 'network',
      priority: 'medium',
      title: 'Slow WiFi connection',
      description: 'WiFi speed is very slow in the conference room B. Download speed less than 1 Mbps.'
    }
  ];

  const reports = [];
  const regularUsers = users.filter(u => u.role === 'user');
  const servicedeskUsers = users.filter(u => u.role === 'servicedesk');

  reportTemplates.forEach((template, index) => {
    const randomUser = regularUsers[index % regularUsers.length];
    const randomOffice = offices[index % offices.length];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const report = {
      ...template,
      createdBy: randomUser._id,
      office: randomOffice._id,
      status: randomStatus,
      location: {
        type: 'Point',
        coordinates: [
          randomOffice.location.coordinates[0] + (Math.random() - 0.5) * 0.01,
          randomOffice.location.coordinates[1] + (Math.random() - 0.5) * 0.01
        ]
      }
    };

    // Si está asignado o resuelto, agregar datos adicionales
    if (randomStatus === 'in_progress' || randomStatus === 'resolved' || randomStatus === 'closed') {
      report.assignedTo = servicedeskUsers[0]._id;
    }

    if (randomStatus === 'resolved' || randomStatus === 'closed') {
      report.resolution = 'Issue has been resolved. All systems working normally now.';
      report.resolvedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
    }

    if (randomStatus === 'closed') {
      report.rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
      report.ratingComment = 'Great service, issue resolved quickly!';
    }

    reports.push(report);
  });

  return reports;
};

// Conectar a MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicedesk';
    
    await mongoose.connect(mongoURI);
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

// Limpiar base de datos
async function cleanDatabase() {
  try {
    log.info('Cleaning database...');
    
    await User.deleteMany({});
    log.success('Deleted all users');
    
    await Office.deleteMany({});
    log.success('Deleted all offices');
    
    await Report.deleteMany({});
    log.success('Deleted all reports');
    
    log.success('Database cleaned successfully');
  } catch (error) {
    log.error(`Error cleaning database: ${error.message}`);
    throw error;
  }
}

// Seed de usuarios
async function seedUsers() {
  try {
    log.info('Seeding users...');
    
    const createdUsers = [];
    
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      log.success(`Created ${user.role} user: ${user.email}`);
    }
    
    return createdUsers;
  } catch (error) {
    log.error(`Error seeding users: ${error.message}`);
    throw error;
  }
}

// Seed de oficinas
async function seedOffices() {
  try {
    log.info('Seeding offices...');
    
    // Crear oficinas una por una para manejar errores individualmente
    const createdOffices = [];
    
    for (const officeData of offices) {
      try {
        const office = await Office.create(officeData);
        createdOffices.push(office);
        log.success(`Created office: ${office.name} (${office.code})`);
      } catch (error) {
        log.warning(`Skipped office ${officeData.name}: ${error.message}`);
        // Continuar con las demás oficinas
      }
    }
    
    if (createdOffices.length === 0) {
      log.warning('No offices were created (geolocation index issue)');
    }
    
    return createdOffices;
  } catch (error) {
    log.error(`Error seeding offices: ${error.message}`);
    // No lanzar error, permitir que continúe con reportes
    return [];
  }
}

// Seed de reportes
async function seedReports(users, offices) {
  try {
    log.info('Seeding reports...');
    
    const reports = createSampleReports(users, offices);
    const createdReports = await Report.insertMany(reports);
    
    log.success(`Created ${createdReports.length} sample reports`);
    
    return createdReports;
  } catch (error) {
    log.error(`Error seeding reports: ${error.message}`);
    throw error;
  }
}

// Mostrar resumen
function showSummary(users, offices, reports) {
  console.log('\n' + '='.repeat(70));
  log.success('🎉 Database seeded successfully!');
  console.log('='.repeat(70));
  
  console.log('\n📊 Summary:');
  console.log(`   👥 Users:    ${users.length} created`);
  console.log(`   🏢 Offices:  ${offices.length} created`);
  console.log(`   📋 Reports:  ${reports.length} created`);
  
  console.log('\n� Quick Access Credentials (Para pruebas):');
  console.log('   ┌──────────────┬─────────────────────────┬───────────────┐');
  console.log('   │ Role         │ Email                   │ Password      │');
  console.log('   ├──────────────┼─────────────────────────┼───────────────┤');
  console.log('   │ 👨‍💼 Admin      │ admin@test.com          │ Admin123!     │');
  console.log('   │ 🎫 ServiceDesk│ servicedesk@test.com    │ Service123!   │');
  console.log('   │ 👤 User       │ user@test.com           │ User123!      │');
  console.log('   └──────────────┴─────────────────────────┴───────────────┘');
  
  console.log('\n📋 Todos los usuarios disponibles:');
  
  // Agrupar usuarios por rol
  const adminUsers = users.filter(u => u.role === 'admin');
  const servicedeskUsers = users.filter(u => u.role === 'servicedesk');
  const regularUsers = users.filter(u => u.role === 'user');
  
  console.log(`\n   👨‍💼 Administradores (${adminUsers.length}):`);
  adminUsers.forEach(u => {
    console.log(`      • ${u.email.padEnd(30)} - ${u.name}`);
  });
  
  console.log(`\n   🎫 Service Desk (${servicedeskUsers.length}):`);
  servicedeskUsers.forEach(u => {
    console.log(`      • ${u.email.padEnd(30)} - ${u.name}`);
  });
  
  console.log(`\n   👤 Usuarios (${regularUsers.length}):`);
  regularUsers.forEach(u => {
    console.log(`      • ${u.email.padEnd(30)} - ${u.name}`);
  });
  
  console.log('\n🌐 Acceder a la aplicación:');
  console.log('   Frontend:  http://localhost:3000');
  console.log('   Backend:   http://localhost:5000');
  console.log('   API Docs:  http://localhost:5000/api-docs');
  
  console.log('\n📖 Documentación:');
  console.log('   Ver USUARIOS_PRUEBA.md para más información');
  console.log('   Ver INICIO_RAPIDO.md para guía de inicio\n');
  
  console.log('='.repeat(70) + '\n');
}

// Main function
async function main() {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Limpiar base de datos
    if (process.argv.includes('--clean') || process.argv.includes('-c')) {
      await cleanDatabase();
      log.success('Database cleaned. Exiting...');
      await mongoose.connection.close();
      return;
    }
    
    // Preguntar si limpiar
    log.warning('This will delete all existing data!');
    
    // Limpiar y seed
    await cleanDatabase();
    
    const createdUsers = await seedUsers();
    const createdOffices = await seedOffices();
    const createdReports = await seedReports(createdUsers, createdOffices);
    
    // Mostrar resumen
    showSummary(createdUsers, createdOffices, createdReports);
    
    // Cerrar conexión
    await mongoose.connection.close();
    log.success('Database connection closed');
    
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { cleanDatabase, seedUsers, seedOffices, seedReports };
