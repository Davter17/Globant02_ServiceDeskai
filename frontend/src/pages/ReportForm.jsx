import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeBatch, suggestCategory } from '../services/imageAnalysisService';
import '../styles/ReportForm.css';

const ReportForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
  });

  const [geolocation, setGeolocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: false,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageAnalysis, setImageAnalysis] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    'Hardware',
    'Software',
    'Red/Conectividad',
    'Impresoras',
    'Teléfonos',
    'Accesos/Permisos',
    'Email',
    'Otros',
  ];

  const priorities = [
    { value: 'low', label: 'Baja', icon: '🟢', color: '#48bb78' },
    { value: 'medium', label: 'Media', icon: '🟡', color: '#ed8936' },
    { value: 'high', label: 'Alta', icon: '🔴', color: '#e53e3e' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error de validación del campo
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null,
      });
    }
  };

  // Función para obtener ubicación GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeolocation(prev => ({
        ...prev,
        error: 'Tu navegador no soporta geolocalización'
      }));
      return;
    }

    setGeolocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
          loading: false,
          error: null,
        });
        
        // Actualizar formData con coordenadas
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        }));
      },
      (error) => {
        let errorMessage = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado. Por favor activa la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
        }
        setGeolocation(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Función para manejar selección de imágenes
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validación de archivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'video/mp4', 'video/webm'];
    
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
        continue;
      }
      if (file.size > maxSize) {
        errors.push(`${file.name}: El archivo excede 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    }

    if (validFiles.length === 0) return;

    // Crear previews
    const newPreviews = await Promise.all(
      validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result,
              type: file.type.startsWith('image') ? 'image' : 'video',
              name: file.name,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setImages([...images, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);

    // Analizar imágenes con IA
    analyzeImages(validFiles);
  };

  // Función para analizar imágenes con IA
  const analyzeImages = async (files) => {
    try {
      console.log('Iniciando análisis de imágenes...');
      
      // Usar el servicio de análisis de imágenes
      const analyses = await analyzeBatch(files);
      
      console.log('Análisis completado:', analyses);
      setImageAnalysis([...imageAnalysis, ...analyses]);

      // Sugerir categoría basada en el primer análisis
      if (analyses.length > 0 && !formData.category) {
        const suggestedCat = suggestCategory(analyses[0].tags);
        if (suggestedCat && suggestedCat !== 'Otros') {
          setFormData(prev => ({ ...prev, category: suggestedCat }));
        }
      }
    } catch (error) {
      console.error('Error al analizar imágenes:', error);
      // Continuar sin análisis
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageAnalysis(imageAnalysis.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (formData.title.length < 5) {
      errors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (formData.description.length < 20) {
      errors.description = 'La descripción debe tener al menos 20 caracteres';
    }

    if (!formData.category) {
      errors.category = 'Debes seleccionar una categoría';
    }

    // Location es ahora opcional (se puede usar GPS)
    // if (!formData.location) {
    //   errors.location = 'La ubicación es requerida';
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos completos del reporte con metadatos
      const reportData = {
        ...formData,
        geolocation: geolocation.latitude ? {
          type: 'Point',
          coordinates: [geolocation.longitude, geolocation.latitude],
          accuracy: geolocation.accuracy,
          timestamp: geolocation.timestamp,
        } : null,
        images: images.map((img, i) => ({
          file: img,
          analysis: imageAnalysis[i] || null,
        })),
        metadata: {
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      };

      // TODO: Llamar al backend para crear el reporte con FormData
      console.log('Crear reporte completo:', reportData);
      
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la lista de reportes
      navigate('/reports');
    } catch (err) {
      setError(err.message || 'Error al crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="report-form-container">
      <div className="report-form-header">
        <h1>✏️ Nuevo Reporte</h1>
        <p>Describe el problema o incidencia que deseas reportar</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Título */}
        <div className="form-group">
          <label htmlFor="title">
            Título <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Mi computadora no enciende"
            required
          />
          {validationErrors.title && (
            <span className="error-text">{validationErrors.title}</span>
          )}
        </div>

        {/* Categoría y Prioridad */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              Categoría <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <span className="error-text">{validationErrors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              Prioridad <span className="required">*</span>
            </label>
            <div className="priority-selector">
              {priorities.map((p) => (
                <label
                  key={p.value}
                  className={`priority-option ${
                    formData.priority === p.value ? 'selected' : ''
                  }`}
                  style={{
                    borderColor:
                      formData.priority === p.value ? p.color : '#e2e8f0',
                  }}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={formData.priority === p.value}
                    onChange={handleChange}
                  />
                  <span className="priority-icon">{p.icon}</span>
                  <span className="priority-label">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="form-group">
          <label htmlFor="location">
            Ubicación <span className="required">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Oficina 3, Planta 2, Edificio A"
            required
          />
          {validationErrors.location && (
            <span className="error-text">{validationErrors.location}</span>
          )}
        </div>

        {/* Geolocalización */}
        <div className="form-group geolocation-section">
          <label>📍 Ubicación GPS (Opcional)</label>
          <div className="geolocation-content">
            {!geolocation.latitude ? (
              <button
                type="button"
                className="btn btn-secondary btn-gps"
                onClick={handleGetLocation}
                disabled={geolocation.loading}
              >
                {geolocation.loading ? (
                  <>
                    <span className="spinner-small"></span> Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    📍 Usar mi ubicación actual
                  </>
                )}
              </button>
            ) : (
              <div className="geolocation-info">
                <div className="geo-data">
                  <span className="geo-icon">✅</span>
                  <div className="geo-details">
                    <strong>Ubicación capturada</strong>
                    <p>Lat: {geolocation.latitude.toFixed(6)}, Lon: {geolocation.longitude.toFixed(6)}</p>
                    <small>Precisión: ±{geolocation.accuracy.toFixed(0)}m</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remove-geo"
                  onClick={() => {
                    setGeolocation({
                      latitude: null,
                      longitude: null,
                      accuracy: null,
                      timestamp: null,
                      error: null,
                      loading: false,
                    });
                    setFormData(prev => ({ ...prev, location: '' }));
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {geolocation.error && (
              <div className="geo-error">{geolocation.error}</div>
            )}
          </div>
          <small className="form-hint">
            La ubicación GPS ayuda al equipo de soporte a identificar tu ubicación exacta
          </small>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">
            Descripción <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el problema con el mayor detalle posible..."
            rows="6"
            required
          />
          {validationErrors.description && (
            <span className="error-text">{validationErrors.description}</span>
          )}
          <small className="form-hint">
            Mínimo 20 caracteres. Sé específico para obtener ayuda más rápida.
          </small>
        </div>

        {/* Upload de Imágenes/Videos */}
        <div className="form-group upload-section">
          <label>📸 Imágenes o Videos (Opcional)</label>
          <div className="upload-content">
            <input
              type="file"
              id="imageUpload"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="imageUpload" className="btn btn-secondary btn-upload">
              📁 Seleccionar archivos
            </label>
            <small className="form-hint">
              Formatos: JPG, PNG, WebP, MP4, WebM. Máximo 5MB por archivo.
            </small>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="preview-item">
                  {preview.type === 'image' ? (
                    <img src={preview.preview} alt={`Preview ${index + 1}`} />
                  ) : (
                    <video src={preview.preview} controls />
                  )}
                  <div className="preview-overlay">
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="preview-info">
                    <span className="preview-name">{preview.name}</span>
                    <span className="preview-size">
                      {(preview.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  {imageAnalysis[index] && (
                    <div className="preview-analysis">
                      <span className="analysis-tag">🤖 Análisis IA:</span>
                      <div className="analysis-tags">
                        {imageAnalysis[index].tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                      <small className="analysis-confidence">
                        Confianza: {(imageAnalysis[index].confidence * 100).toFixed(0)}%
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box - Actualizado */}
        <div className="info-box success">
          <div className="info-icon">✨</div>
          <div className="info-content">
            <h3>¡Nuevas funcionalidades disponibles!</h3>
            <ul>
              <li>✅ Geolocalización GPS automática</li>
              <li>✅ Subida de imágenes y videos</li>
              <li>✅ Análisis automático de imágenes con IA</li>
              <li>✅ Etiquetado inteligente</li>
            </ul>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creando reporte...' : '✓ Crear Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
