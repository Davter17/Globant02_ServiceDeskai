/**
 * Configuración de conexión a MongoDB
 * 
 * Este archivo maneja:
 * - Conexión a MongoDB usando Mongoose
 * - Configuración de opciones de conexión
 * - Manejo de eventos de conexión (success, error, disconnect)
 * - Retry logic para reconexión
 */

const mongoose = require('mongoose');

/**
 * Conectar a MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // URI de conexión desde variables de entorno
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('🔄 Conectando a MongoDB...');

    // Opciones de conexión
    const options = {
      // Configuración recomendada para producción
      maxPoolSize: 10,          // Máximo de conexiones simultáneas
      serverSelectionTimeoutMS: 5000,  // Timeout para seleccionar servidor
      socketTimeoutMS: 45000,   // Timeout para operaciones
      family: 4                 // Usar IPv4
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);

    // Evento: conexión exitosa
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose conectado a MongoDB');
    });

    // Evento: error después de conexión inicial
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err.message);
    });

    // Evento: desconexión
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose desconectado de MongoDB');
    });

    // Evento: reconexión
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconectado a MongoDB');
    });

    // Cerrar conexión cuando el proceso termina
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 Conexión a MongoDB cerrada por terminación de la app');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    
    // En desarrollo, reintentamos después de 5 segundos
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Reintentando conexión en 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      // En producción, terminamos el proceso
      process.exit(1);
    }
  }
};

/**
 * Obtener estado de la conexión
 * @returns {string} Estado de la conexión (disconnected, connected, connecting, disconnecting)
 */
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Cerrar conexión manualmente
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  getConnectionState,
  disconnectDB
};
