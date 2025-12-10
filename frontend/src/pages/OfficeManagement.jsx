import React, { useState, useEffect } from 'react';
import '../styles/OfficeManagement.css';

/**
 * OfficeManagement Component (Admin only)
 * CRUD completo para gestión de oficinas
 */
const OfficeManagement = () => {
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: ''
  });

  // Mock data - TODO: Reemplazar con API real en Step 7
  const mockOffices = [
    {
      _id: '1',
      name: 'Oficina Central Madrid',
      address: 'Calle Gran Vía 123',
      city: 'Madrid',
      country: 'España',
      phone: '+34 912 345 678',
      email: 'madrid@example.com',
      location: {
        type: 'Point',
        coordinates: [-3.7038, 40.4168] // [longitude, latitude]
      },
      createdAt: new Date('2024-01-01')
    },
    {
      _id: '2',
      name: 'Oficina Barcelona',
      address: 'Passeig de Gràcia 456',
      city: 'Barcelona',
      country: 'España',
      phone: '+34 932 456 789',
      email: 'barcelona@example.com',
      location: {
        type: 'Point',
        coordinates: [2.1686, 41.3874]
      },
      createdAt: new Date('2024-01-15')
    },
    {
      _id: '3',
      name: 'Oficina Valencia',
      address: 'Calle Colón 789',
      city: 'Valencia',
      country: 'España',
      phone: '+34 963 567 890',
      email: 'valencia@example.com',
      location: {
        type: 'Point',
        coordinates: [-0.3763, 39.4699]
      },
      createdAt: new Date('2024-02-01')
    },
    {
      _id: '4',
      name: 'Oficina Sevilla',
      address: 'Avenida de la Constitución 321',
      city: 'Sevilla',
      country: 'España',
      phone: '+34 954 678 901',
      email: 'sevilla@example.com',
      location: {
        type: 'Point',
        coordinates: [-5.9845, 37.3891]
      },
      createdAt: new Date('2024-02-15')
    }
  ];

  useEffect(() => {
    // TODO: Reemplazar con llamada real a la API
    setTimeout(() => {
      setOffices(mockOffices);
      setFilteredOffices(mockOffices);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, offices]);

  const applyFilters = () => {
    let filtered = offices;

    if (searchTerm) {
      filtered = filtered.filter(office =>
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOffices(filtered);
  };

  const handleOpenModal = (mode, office = null) => {
    setModalMode(mode);
    setSelectedOffice(office);

    if (mode === 'edit' && office) {
      setFormData({
        name: office.name,
        address: office.address,
        city: office.city,
        country: office.country,
        phone: office.phone,
        email: office.email,
        latitude: office.location.coordinates[1].toString(),
        longitude: office.location.coordinates[0].toString()
      });
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: ''
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOffice(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Integrar con API real
    const officeData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(formData.longitude),
          parseFloat(formData.latitude)
        ]
      }
    };

    if (modalMode === 'create') {
      const newOffice = {
        _id: Date.now().toString(),
        ...officeData,
        createdAt: new Date()
      };
      setOffices([...offices, newOffice]);
      console.log('Creating office:', officeData);
    } else {
      const updatedOffices = offices.map(office =>
        office._id === selectedOffice._id
          ? { ...office, ...officeData }
          : office
      );
      setOffices(updatedOffices);
      console.log('Updating office:', selectedOffice._id, officeData);
    }

    handleCloseModal();
  };

  const handleDelete = (officeId) => {
    if (window.confirm('¿Estás seguro de eliminar esta oficina?')) {
      // TODO: Integrar con API real
      setOffices(offices.filter(office => office._id !== officeId));
      console.log('Deleting office:', officeId);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener la ubicación actual');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openInMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  if (loading) {
    return (
      <div className="offices-loading">
        <div className="spinner"></div>
        <p>Cargando oficinas...</p>
      </div>
    );
  }

  return (
    <div className="office-management-container">
      <div className="offices-header">
        <div>
          <h1>Gestión de Oficinas</h1>
          <p>Administra las oficinas y sus ubicaciones</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span>➕</span> Nueva Oficina
        </button>
      </div>

      {/* Stats */}
      <div className="office-stats">
        <div className="stat-card">
          <div className="stat-number">{offices.length}</div>
          <div className="stat-label">Total Oficinas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{new Set(offices.map(o => o.city)).size}</div>
          <div className="stat-label">Ciudades</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{new Set(offices.map(o => o.country)).size}</div>
          <div className="stat-label">Países</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Offices Grid */}
      <div className="offices-grid">
        {filteredOffices.map(office => (
          <div key={office._id} className="office-card">
            <div className="office-header">
              <div className="office-icon">🏢</div>
              <h3>{office.name}</h3>
            </div>

            <div className="office-details">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div>
                  <p className="detail-primary">{office.address}</p>
                  <p className="detail-secondary">{office.city}, {office.country}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📞</span>
                <p className="detail-primary">{office.phone}</p>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <p className="detail-primary">{office.email}</p>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🌍</span>
                <p className="detail-primary">
                  {office.location.coordinates[1].toFixed(4)}, {office.location.coordinates[0].toFixed(4)}
                </p>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <p className="detail-secondary">Creada: {formatDate(office.createdAt)}</p>
              </div>
            </div>

            <div className="office-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openInMaps(office.location.coordinates[1], office.location.coordinates[0])}
              >
                🗺️ Ver en Mapa
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenModal('edit', office)}
              >
                ✏️ Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(office._id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOffices.length === 0 && (
        <div className="no-results">
          <p>📭 No se encontraron oficinas</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? '🏢 Nueva Oficina' : '✏️ Editar Oficina'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre de la Oficina *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Oficina Central Madrid"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Dirección *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Calle Gran Vía 123"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Ciudad *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Madrid"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">País *</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: España"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: +34 912 345 678"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="oficina@example.com"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>📍 Ubicación Geográfica</h4>
                  <p className="form-help">
                    Las coordenadas se usan para mostrar la oficina en el mapa
                  </p>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGetCurrentLocation}
                    style={{ marginBottom: '1rem' }}
                  >
                    📍 Usar mi ubicación actual
                  </button>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="latitude">Latitud *</label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        required
                        step="any"
                        placeholder="Ej: 40.4168"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="longitude">Longitud *</label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        required
                        step="any"
                        placeholder="Ej: -3.7038"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear Oficina' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeManagement;
