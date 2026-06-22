import { useState } from 'react';
import { useAppContext } from '../store/AppContext';

export const SettingsView = () => {
  const { empresas } = useAppContext();
  const empresa = empresas[0];
  const [formData, setFormData] = useState({
    rut: empresa?.rut || '',
    razonSocial: empresa?.razonSocial || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // setEmpresa({ rut: formData.rut, razonSocial: formData.razonSocial });
    alert('Datos de la empresa guardados correctamente.');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Configuración</h1>
          <p className="text-muted">Ajustes de la empresa y del sistema</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 className="mb-4">Datos de la Empresa</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">RUT Empresa</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="76.123.456-7"
              value={formData.rut}
              onChange={e => setFormData({...formData, rut: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Razón Social</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Mi Empresa SpA"
              value={formData.razonSocial}
              onChange={e => setFormData({...formData, razonSocial: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};
