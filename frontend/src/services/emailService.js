/**
 * Email API Service
 * 
 * Servicio para interactuar con endpoints de email
 */

import api from './api';

/**
 * Compartir reporte por email
 * @param {string} reportId - ID del reporte
 * @param {string} email - Email del destinatario
 * @param {string} message - Mensaje opcional
 * @returns {Promise}
 */
export const shareReportByEmail = async (reportId, email, message = '') => {
  try {
    const response = await api.post(`/reports/${reportId}/share`, {
      email,
      message
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al compartir reporte' };
  }
};

export default {
  shareReportByEmail
};
