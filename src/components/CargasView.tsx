import { useState } from 'react';
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { verificarVigenciaCarga, calcularTramo, validarRut, showToast, formatRut } from '../utils/cargas';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const CargasView = () => {
  const { cargas, addCarga, removeCarga, trabajadores, empresas } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trabajadorId: '',
    rutCausante: '',
    nombre: '',
    tipo: 'hijo' as 'conyuge' | 'hijo',
    fechaNacimiento: '',
    estudiando: false,
    fechaInicio: '',
    numeroResolucion: '',
    fechaResolucion: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trabajadorId || !formData.rutCausante || !formData.nombre || !formData.fechaNacimiento) return;

    if (!validarRut(formData.rutCausante)) {
      showToast('El RUT del causante ingresado no es válido. Por favor, verifíquelo.', 'error');
      return;
    }

    try {
      await addCarga({
        trabajadorId: formData.trabajadorId,
        rutCausante: formData.rutCausante,
        nombre: formData.nombre,
        tipo: formData.tipo,
        fechaNacimiento: formData.fechaNacimiento,
        estudiando: formData.estudiando,
        fechaInicio: formData.fechaInicio,
        numeroResolucion: formData.numeroResolucion,
        fechaResolucion: formData.fechaResolucion
      });
      
      showToast('Carga familiar registrada.', 'success');
      
      // Reset form
      setFormData({
        trabajadorId: '', nombre: '', rutCausante: '', tipo: 'hijo',
        fechaNacimiento: '', estudiando: false,
        fechaInicio: '', numeroResolucion: '', fechaResolucion: ''
      });
      setShowForm(false);
    } catch (error) {
      showToast('Error al registrar la carga familiar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const data = cargas.map(c => {
      const trabajador = trabajadores.find(t => t.id === c.trabajadorId);
      const empresa = empresas.find(e => e.id === trabajador?.empresaId);
      const estado = verificarVigenciaCarga(c);
      const tramo = trabajador ? calcularTramo(trabajador.sueldoBase) : null;
      
      return {
        'RUT Empresa': empresa?.rut || '',
        'Razón Social Empresa': empresa?.razonSocial || '',
        'RUT Trabajador': trabajador?.rut || '',
        'Nombre Trabajador': trabajador?.nombre || '',
        'Causante': c.nombre,
        'RUT Causante': c.rutCausante,
        'Tipo': c.tipo,
        'Fecha Nacimiento': c.fechaNacimiento,
        'Estudia': c.estudiando ? 'Sí' : 'No',
        'Fecha Inicio': c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-CL') : '-',
        'N° Resolución': c.numeroResolucion,
        'Fecha Resolución': c.fechaResolucion ? new Date(c.fechaResolucion).toLocaleDateString('es-CL') : '-',
        'Vigente': estado.vigente ? 'Sí' : 'No',
        'Motivo Vencimiento': estado.motivoVencimiento || '-',
        'Tramo ASIG': tramo ? tramo.letra : '-',
        'Monto a Pagar': tramo ? tramo.monto : 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cargas Familiares");
    XLSX.writeFile(wb, "cargas_familiares.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Reporte de Cargas Familiares`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);

    const tableData = cargas.map(c => {
      const trabajador = trabajadores.find(t => t.id === c.trabajadorId);
      const empresa = empresas.find(e => e.id === trabajador?.empresaId);
      const estado = verificarVigenciaCarga(c);
      const tramo = trabajador ? calcularTramo(trabajador.sueldoBase) : null;
      
      return [
        empresa?.razonSocial || '-',
        trabajador?.rut || '-',
        c.nombre,
        c.rutCausante,
        c.tipo === 'hijo' && c.estudiando ? 'Hijo (Est.)' : c.tipo,
        estado.vigente ? 'Vigente' : 'Vencida',
        tramo ? `$${tramo.monto.toLocaleString('es-CL')}` : '$0'
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [['Empresa', 'RUT Trabajador', 'Causante', 'RUT Causante', 'Tipo', 'Estado', 'Monto']],
      body: tableData,
    });

    doc.save("cargas_familiares.pdf");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="font-display">Registro de Cargas Familiares</h1>
          <p className="text-muted">Control de causantes y beneficios</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={exportarPDF} disabled={cargas.length === 0}>
            <Download size={18} /> Exportar PDF
          </button>
          <button className="btn btn-secondary" onClick={exportarExcel} disabled={cargas.length === 0}>
            <Download size={18} /> Exportar Excel
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <PlusCircle size={18} /> {showForm ? 'Cancelar' : 'Nueva Carga'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel p-8 mb-6 bg-white/[0.01]">
          <h2 className="text-xl font-display font-bold text-white mb-6">Registrar Nueva Carga Familiar</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Trabajador</label>
              <select 
                className="form-select"
                value={formData.trabajadorId}
                onChange={e => setFormData({...formData, trabajadorId: e.target.value})}
              >
                <option value="">Seleccione un trabajador...</option>
                {trabajadores.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre} ({t.rut})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">RUT Causante</label>
              <input type="text" className="form-input" value={formData.rutCausante} onChange={e => setFormData({...formData, rutCausante: formatRut(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre Causante</label>
              <input type="text" className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Tipo de Carga</label>
              <select className="form-select" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as any})}>
                <option value="hijo">Hijo</option>
                <option value="conyuge">Cónyuge</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento</label>
              <input type="date" className="form-input" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
            </div>
            {formData.tipo === 'hijo' && (
              <div className="form-group flex items-center mt-4">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: 0, textTransform: 'none', letterSpacing: 'normal' }}>
                  <input type="checkbox" checked={formData.estudiando} onChange={e => setFormData({...formData, estudiando: e.target.checked})} />
                  ¿Está estudiando? (Extiende límite a 27 años)
                </label>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input type="date" className="form-input" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">N° Resolución</label>
              <input type="text" className="form-input" value={formData.numeroResolucion} onChange={e => setFormData({...formData, numeroResolucion: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Resolución</label>
              <input type="date" className="form-input" value={formData.fechaResolucion} onChange={e => setFormData({...formData, fechaResolucion: e.target.value})} />
            </div>

            <div className="grid-cols-3 flex" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={!formData.trabajadorId || !formData.rutCausante || !formData.fechaNacimiento || loading}>
                {loading ? 'Guardando...' : 'Guardar Carga'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="px-8 py-5 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
          <h2 className="text-lg font-display font-bold text-white">Monitor Global de Cargas</h2>
        </div>
        <div className="p-4 table-container" style={{ border: 'none', background: 'transparent' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Causante</th>
                <th>Tipo</th>
                <th>Empresa</th>
                <th>Trabajador</th>
                <th>Monto a Pagar</th>
                <th>Vigencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No hay cargas registradas</td>
                </tr>
              ) : (
                cargas.map(c => {
                  const trabajador = trabajadores.find(t => t.id === c.trabajadorId);
                  const empresa = empresas.find(e => e.id === trabajador?.empresaId);
                  const estado = verificarVigenciaCarga(c);
                  const tramo = trabajador ? calcularTramo(trabajador.sueldoBase) : null;
                  
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                        <div className="text-muted text-sm">{c.rutCausante}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {c.tipo} {c.estudiando && c.tipo === 'hijo' ? '(Estudiante)' : ''}
                      </td>
                      <td className="text-muted font-bold text-sm">{empresa?.razonSocial || '-'}</td>
                      <td>{trabajador?.nombre || 'Desconocido'}</td>
                      <td>
                        {estado.vigente && tramo ? (
                          <span className="badge badge-success">${tramo.monto.toLocaleString('es-CL')}</span>
                        ) : (
                          <span className="badge badge-danger">$0</span>
                        )}
                      </td>
                      <td>
                        {estado.vigente ? (
                          <span className="badge badge-success">Activa</span>
                        ) : (
                          <span className="badge badge-danger">Vencida</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => removeCarga(c.id)}
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
