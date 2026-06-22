import { useState, Fragment } from 'react';
import { Building2, PlusCircle, Trash2, ChevronDown, ChevronRight, Users, User, FileText } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { verificarVigenciaCarga, validarRut, showToast, formatRut } from '../utils/cargas';

export const EmpresaView = () => {
  const { empresas, addEmpresa, removeEmpresa, trabajadores, cargas } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ rut: '', razonSocial: '', telefono: '', email: '' });
  
  // Estados para el acordeón (Drill-down)
  const [expandedEmpresaId, setExpandedEmpresaId] = useState<string | null>(null);
  const [expandedTrabajadorId, setExpandedTrabajadorId] = useState<string | null>(null);

  const toggleEmpresa = (id: string) => {
    if (expandedEmpresaId === id) {
      setExpandedEmpresaId(null);
      setExpandedTrabajadorId(null); // Cerrar trabajador también
    } else {
      setExpandedEmpresaId(id);
      setExpandedTrabajadorId(null);
    }
  };

  const toggleTrabajador = (id: string) => {
    setExpandedTrabajadorId(expandedTrabajadorId === id ? null : id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rut || !formData.razonSocial) return;

    if (!validarRut(formData.rut)) {
      showToast('El RUT ingresado no es válido. Por favor, verifíquelo.', 'error');
      return;
    }

    setLoading(true);
    try {
      await addEmpresa({ 
        rut: formData.rut, 
        razonSocial: formData.razonSocial,
        telefono: formData.telefono,
        email: formData.email
      });
      
      showToast('Empresa añadida al directorio.', 'success');

      setFormData({ rut: '', razonSocial: '', telefono: '', email: '' });
      setShowForm(false);
    } catch (error: any) {
      showToast(`Error al registrar la empresa: ${error.message || 'Desconocido'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="font-display">Explorador Jerárquico</h1>
          <p className="text-muted">Directorio integral de Empresas, Trabajadores y Cargas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> {showForm ? 'Cancelar' : 'Nueva Empresa'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-8 mb-6" style={{ maxWidth: '800px' }}>
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={24} color="var(--brandMain)" />
            <h2 className="text-xl font-display font-bold text-white">Registrar Empresa</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="form-label">RUT Empresa</label>
              <input 
                type="text" 
                className="lunar-input" 
                placeholder="Ej: 76.123.456-7"
                value={formData.rut}
                onChange={e => setFormData({...formData, rut: formatRut(e.target.value)})}
                required
              />
            </div>
            <div className="md:col-span-8">
              <label className="form-label">Razón Social</label>
              <input 
                type="text" 
                className="lunar-input" 
                placeholder="Ej: Mi Empresa SpA"
                value={formData.razonSocial}
                onChange={e => setFormData({...formData, razonSocial: e.target.value})}
                required
              />
            </div>
            
            <div className="md:col-span-4 mt-2">
              <label className="form-label">Teléfono (Opcional)</label>
              <input 
                type="text" 
                className="lunar-input" 
                placeholder="Ej: +56 9 1234 5678"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
              />
            </div>
            <div className="md:col-span-5 mt-2">
              <label className="form-label">Correo (Opcional)</label>
              <input 
                type="email" 
                className="lunar-input" 
                placeholder="contacto@empresa.cl"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="md:col-span-12 flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Empresa'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel overflow-hidden mt-6">
        <div className="p-4 table-container" style={{ border: 'none', background: 'transparent' }}>
          <table className="table" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Razón Social</th>
                <th>RUT</th>
                <th>Total Trabajadores</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-8">No hay empresas registradas</td>
                </tr>
              ) : (
                empresas.map(e => {
                  const empTrabajadores = trabajadores.filter(t => t.empresaId === e.id);
                  const isExpandedEmpresa = expandedEmpresaId === e.id;

                  return (
                    <Fragment key={e.id}>
                      <tr 
                        style={{ 
                          cursor: 'pointer', 
                          background: isExpandedEmpresa ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)' : 'transparent', 
                          transition: 'all 0.3s ease',
                          borderLeft: isExpandedEmpresa ? '3px solid var(--brandMain)' : '3px solid transparent'
                        }}
                        onClick={() => toggleEmpresa(e.id)}
                      >
                        <td className="text-center" style={{ width: '40px' }}>
                          {isExpandedEmpresa ? <ChevronDown size={20} color="var(--brandAlt)" /> : <ChevronRight size={20} className="text-muted" />}
                        </td>
                        <td className="font-bold text-white">
                          <div className="flex items-center gap-2" style={{ textShadow: isExpandedEmpresa ? '0 0 10px rgba(255,255,255,0.3)' : 'none' }}>
                            <Building2 size={16} color={isExpandedEmpresa ? "var(--brandAlt)" : "var(--text-secondary)"} /> 
                            {e.razonSocial}
                          </div>
                        </td>
                        <td className="text-muted">{e.rut}</td>
                        <td><span className="badge badge-info">{empTrabajadores.length} empleados</span></td>
                        <td>
                          <button 
                            style={{ 
                              padding: '0.4rem',
                              background: 'rgba(239,68,68,0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(ev) => { ev.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                            onMouseOut={(ev) => { ev.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                            onClick={(ev) => { ev.stopPropagation(); removeEmpresa(e.id); }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {/* Nivel 1: Trabajadores */}
                      {isExpandedEmpresa && (
                        <tr>
                          <td colSpan={5} style={{ padding: 0, borderBottom: 'none' }}>
                            <div style={{ 
                              background: 'rgba(0, 0, 0, 0.2)', 
                              padding: '2rem', 
                              borderLeft: '3px solid var(--brandMain)',
                              boxShadow: 'inset 0 10px 20px -10px rgba(0,0,0,0.5)'
                            }}>
                              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>
                                <Users size={16} color="var(--brandAlt)" /> NÓMINA DE TRABAJADORES
                              </h3>
                              
                              {empTrabajadores.length === 0 ? (
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Esta empresa no tiene trabajadores asignados aún.</p>
                              ) : (
                                <table className="table" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '40px' }}></th>
                                      <th>Nombre</th>
                                      <th>RUT</th>
                                      <th>Sueldo Base</th>
                                      <th>Cargas</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {empTrabajadores.map(t => {
                                      const isExpandedTrabajador = expandedTrabajadorId === t.id;
                                      const tCargas = cargas.filter(c => c.trabajadorId === t.id);

                                      return (
                                        <Fragment key={t.id}>
                                          <tr 
                                            style={{ cursor: 'pointer', background: isExpandedTrabajador ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            onClick={() => toggleTrabajador(t.id)}
                                          >
                                            <td className="text-center" style={{ width: '40px' }}>
                                              {isExpandedTrabajador ? <ChevronDown size={18} color="var(--brandAlt)" /> : <ChevronRight size={18} className="text-muted" />}
                                            </td>
                                            <td className="font-bold">
                                              <div className="flex items-center gap-2">
                                                <User size={16} color={isExpandedTrabajador ? "var(--brandAlt)" : "gray"} /> 
                                                {t.nombre}
                                              </div>
                                            </td>
                                            <td className="text-muted text-sm">{t.rut}</td>
                                            <td className="text-sm">${t.sueldoBase.toLocaleString('es-CL')}</td>
                                            <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{tCargas.length}</span></td>
                                          </tr>

                                          {/* Nivel 2: Cargas Familiares */}
                                          {isExpandedTrabajador && (
                                            <tr>
                                              <td colSpan={5} style={{ padding: 0 }}>
                                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderLeft: '3px solid var(--brandAlt)' }}>
                                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                                                    <FileText size={14} /> Cargas Familiares Registradas
                                                  </h4>
                                                  
                                                  {tCargas.length === 0 ? (
                                                    <p className="text-xs text-muted">El trabajador no tiene cargas.</p>
                                                  ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {tCargas.map(c => {
                                                        const estado = verificarVigenciaCarga(c);
                                                        return (
                                                          <div key={c.id} style={{ padding: '0.75rem', background: 'var(--surface)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div className="flex justify-between items-center mb-1">
                                                              <span className="font-bold text-sm text-white">{c.nombre}</span>
                                                              <span className={`badge ${estado.vigente ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                                                                {estado.vigente ? 'Vigente' : 'Vencida'}
                                                              </span>
                                                            </div>
                                                            <div className="text-xs text-muted mb-2">RUT: {c.rutCausante}</div>
                                                            <div className="flex justify-between text-xs border-t border-white/10 pt-2 mt-2">
                                                              <span style={{ textTransform: 'capitalize' }}>{c.tipo} {c.estudiando && c.tipo === 'hijo' ? '(Estudiante)' : ''}</span>
                                                              <span>Inicio: {new Date(c.fechaInicio).toLocaleDateString('es-CL')}</span>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
