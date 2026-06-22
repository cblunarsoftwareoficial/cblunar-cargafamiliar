import { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { calcularTramo, validarRut, showToast, formatRut } from '../utils/cargas';

export const TrabajadoresView = () => {
  const { trabajadores, addTrabajador, removeTrabajador, cargas, empresas } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ empresaId: '', rut: '', nombre: '', sueldoBase: '', telefono: '', cargo: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresaId || !formData.rut || !formData.nombre || !formData.sueldoBase) return;
    
    if (!validarRut(formData.rut)) {
      showToast('El RUT ingresado no es válido. Por favor, verifíquelo.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await addTrabajador({
        empresaId: formData.empresaId,
        rut: formData.rut,
        nombre: formData.nombre,
        sueldoBase: Number(formData.sueldoBase),
        telefono: formData.telefono,
        cargo: formData.cargo
      });
      
      showToast('Trabajador añadido a la nómina.', 'success');
      
      setFormData({ empresaId: '', rut: '', nombre: '', sueldoBase: '', telefono: '', cargo: '' });
      setShowForm(false);
    } catch (error) {
      showToast('Error al añadir el trabajador. Verifique los datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="font-display">Directorio Global de Trabajadores</h1>
          <p className="text-muted">Gestión de empleados y sus sueldos base</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> {showForm ? 'Cancelar' : 'Nuevo Trabajador'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-8 mb-6 bg-white/[0.01]">
          <h2 className="text-xl font-display font-bold text-white mb-6">Registrar Trabajador</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="form-group mb-0">
              <label className="form-label">Empresa</label>
              <select 
                className="form-select"
                value={formData.empresaId}
                onChange={e => setFormData({...formData, empresaId: e.target.value})}
                required
              >
                <option value="">Seleccione...</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">RUT</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={e => setFormData({...formData, rut: formatRut(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Sueldo Base ($)</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="500000"
                min="0"
                value={formData.sueldoBase}
                onChange={e => setFormData({...formData, sueldoBase: e.target.value})}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Teléfono (Opcional)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Cargo (Opcional)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Ej: Operario"
                value={formData.cargo}
                onChange={e => setFormData({...formData, cargo: e.target.value})}
              />
            </div>
            <div className="flex" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '1rem', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={empresas.length === 0 || loading}>
                {loading ? 'Guardando...' : (empresas.length === 0 ? 'Falta registrar empresa' : 'Guardar Trabajador')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="px-8 py-5 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
          <h2 className="text-lg font-display font-bold text-white">Nómina de la Empresa</h2>
        </div>
        <div className="p-4 table-container" style={{ border: 'none', background: 'transparent' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Sueldo Base</th>
                <th>Tramo ASIG.</th>
                <th>Cargas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabajadores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No hay trabajadores registrados</td>
                </tr>
              ) : (
                trabajadores.map(t => {
                  const tramo = calcularTramo(t.sueldoBase);
                  const numCargas = cargas.filter(c => c.trabajadorId === t.id).length;
                  const empresaAsociada = empresas.find(e => e.id === t.empresaId);
                  
                  return (
                    <tr key={t.id}>
                      <td className="font-bold text-muted">{empresaAsociada?.razonSocial || '-'}</td>
                      <td>{t.rut}</td>
                      <td>{t.nombre}</td>
                      <td>${t.sueldoBase.toLocaleString('es-CL')}</td>
                      <td><span className="badge badge-info">Tramo {tramo.letra} (${tramo.monto.toLocaleString('es-CL')})</span></td>
                      <td>{numCargas}</td>
                      <td>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => removeTrabajador(t.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
