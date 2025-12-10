/**
 * Image Analysis Service
 * Integración con APIs de análisis de imágenes (Pollinations.ai / Google Vision / Azure)
 */

const POLLINATIONS_API = 'https://image.pollinations.ai/prompt';
const VISION_API_KEY = process.env.REACT_APP_VISION_API_KEY;

/**
 * Analiza una imagen usando Pollinations.ai (Free)
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<Object>} - Resultado del análisis
 */
export const analyzeImageWithPollinations = async (imageFile) => {
  try {
    // Convertir imagen a base64
    const base64Image = await fileToBase64(imageFile);
    
    // Pollinations.ai es principalmente para generación, pero podemos usar
    // un enfoque alternativo con análisis local básico
    
    // Por ahora, devolvemos análisis mock mejorado
    // TODO: Integrar con API real de visión por computadora
    const mockAnalysis = {
      fileName: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      tags: generateSmartTags(imageFile.name),
      objects: detectObjects(imageFile.name),
      confidence: 0.75 + (Math.random() * 0.2),
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      timestamp: new Date(),
      provider: 'mock-analysis',
    };

    return mockAnalysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

/**
 * Analiza múltiples imágenes
 * @param {File[]} imageFiles - Array de archivos
 * @returns {Promise<Object[]>} - Array de resultados
 */
export const analyzeBatch = async (imageFiles) => {
  try {
    const analyses = await Promise.all(
      imageFiles.map(file => analyzeImageWithPollinations(file))
    );
    return analyses;
  } catch (error) {
    console.error('Error in batch analysis:', error);
    throw error;
  }
};

/**
 * Analiza imagen con Google Cloud Vision API
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<Object>} - Resultado del análisis
 */
export const analyzeWithGoogleVision = async (imageFile) => {
  if (!VISION_API_KEY) {
    console.warn('Google Vision API key not configured');
    return analyzeImageWithPollinations(imageFile);
  }

  try {
    const base64Image = await fileToBase64(imageFile);
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image.split(',')[1], // Remove data:image/...;base64,
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'IMAGE_PROPERTIES' },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const result = data.responses[0];
      
      return {
        fileName: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        tags: result.labelAnnotations?.map(label => label.description) || [],
        objects: result.localizedObjectAnnotations?.map(obj => obj.name) || [],
        confidence: result.labelAnnotations?.[0]?.score || 0,
        colors: extractColors(result.imagePropertiesAnnotation),
        timestamp: new Date(),
        provider: 'google-vision',
        rawData: result,
      };
    }

    throw new Error('No analysis data received');
  } catch (error) {
    console.error('Error with Google Vision:', error);
    return analyzeImageWithPollinations(imageFile);
  }
};

/**
 * Analiza imagen con Azure Computer Vision
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<Object>} - Resultado del análisis
 */
export const analyzeWithAzureVision = async (imageFile) => {
  const azureEndpoint = process.env.REACT_APP_AZURE_VISION_ENDPOINT;
  const azureKey = process.env.REACT_APP_AZURE_VISION_KEY;

  if (!azureEndpoint || !azureKey) {
    console.warn('Azure Vision not configured');
    return analyzeImageWithPollinations(imageFile);
  }

  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(
      `${azureEndpoint}/vision/v3.2/analyze?visualFeatures=Tags,Objects,Color,Description`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
        },
        body: formData,
      }
    );

    const data = await response.json();

    return {
      fileName: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      tags: data.tags?.map(tag => tag.name) || [],
      objects: data.objects?.map(obj => obj.object) || [],
      confidence: data.tags?.[0]?.confidence || 0,
      colors: [data.color?.dominantColorForeground, data.color?.dominantColorBackground],
      description: data.description?.captions?.[0]?.text || '',
      timestamp: new Date(),
      provider: 'azure-vision',
      rawData: data,
    };
  } catch (error) {
    console.error('Error with Azure Vision:', error);
    return analyzeImageWithPollinations(imageFile);
  }
};

/**
 * Detecta el tipo de problema basado en las etiquetas
 * @param {string[]} tags - Etiquetas detectadas
 * @returns {string} - Categoría sugerida
 */
export const suggestCategory = (tags) => {
  const tagStr = tags.join(' ').toLowerCase();

  if (tagStr.includes('computer') || tagStr.includes('laptop') || tagStr.includes('monitor')) {
    return 'Hardware';
  }
  if (tagStr.includes('printer') || tagStr.includes('impresora')) {
    return 'Impresoras';
  }
  if (tagStr.includes('phone') || tagStr.includes('telefono')) {
    return 'Teléfonos';
  }
  if (tagStr.includes('cable') || tagStr.includes('network') || tagStr.includes('router')) {
    return 'Red/Conectividad';
  }
  if (tagStr.includes('screen') || tagStr.includes('error') || tagStr.includes('software')) {
    return 'Software';
  }

  return 'Otros';
};

// Helper functions

/**
 * Convierte archivo a base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Genera tags inteligentes basados en el nombre del archivo
 */
const generateSmartTags = (fileName) => {
  const name = fileName.toLowerCase();
  const tags = [];

  // Categorías comunes
  if (name.includes('screen') || name.includes('pantalla')) tags.push('pantalla', 'display');
  if (name.includes('error')) tags.push('error', 'problema');
  if (name.includes('keyboard') || name.includes('teclado')) tags.push('teclado', 'input');
  if (name.includes('mouse') || name.includes('raton')) tags.push('mouse', 'periférico');
  if (name.includes('printer') || name.includes('impresora')) tags.push('impresora', 'hardware');
  if (name.includes('cable')) tags.push('cable', 'conectividad');
  if (name.includes('laptop') || name.includes('computer')) tags.push('computadora', 'equipo');
  
  // Tags generales
  tags.push('dispositivo', 'soporte técnico');

  return tags.slice(0, 5); // Máximo 5 tags
};

/**
 * Detecta objetos basándose en patrones
 */
const detectObjects = (fileName) => {
  const name = fileName.toLowerCase();
  const objects = [];

  if (name.includes('laptop')) objects.push('laptop');
  if (name.includes('monitor')) objects.push('monitor');
  if (name.includes('keyboard')) objects.push('teclado');
  if (name.includes('mouse')) objects.push('mouse');
  if (name.includes('printer')) objects.push('impresora');
  if (name.includes('phone')) objects.push('teléfono');

  return objects.length > 0 ? objects : ['dispositivo electrónico'];
};

/**
 * Extrae colores dominantes
 */
const extractColors = (imageProps) => {
  if (!imageProps?.dominantColors?.colors) {
    return ['#3B82F6', '#10B981'];
  }

  return imageProps.dominantColors.colors
    .slice(0, 3)
    .map(color => color.hex || '#000000');
};

/**
 * Valida si un archivo es una imagen válida
 */
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const errors = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de archivo no permitido. Usa JPG, PNG o WebP.');
  }

  if (file.size > maxSize) {
    errors.push('El archivo excede el tamaño máximo de 5MB.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida un archivo de video
 */
export const validateVideoFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB para videos
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  const errors = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de video no permitido. Usa MP4, WebM o MOV.');
  }

  if (file.size > maxSize) {
    errors.push('El video excede el tamaño máximo de 50MB.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  analyzeImageWithPollinations,
  analyzeBatch,
  analyzeWithGoogleVision,
  analyzeWithAzureVision,
  suggestCategory,
  validateImageFile,
  validateVideoFile,
};
