import { useAppContext } from '../store/AppContext';
import { verificarVigenciaCarga, calcularProgresoTramite, calcularTramo } from '../utils/cargas';
import { AlertTriangle, PartyPopper, PieChart, TrendingUp, Trophy, Building2, Users, HeartPulse } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { empresas, trabajadores, cargas } = useAppContext();

  const cargasVigentes = cargas.filter(c => verificarVigenciaCarga(c).vigente);
  const cargasVencidas = cargas.filter(c => !verificarVigenciaCarga(c).vigente);

  // 1. Cargas por vencer
  const cargasPorVencer = cargasVigentes
    .filter(c => c.tipo === 'hijo')
    .map(c => {
      const progreso = calcularProgresoTramite(c);
      return { carga: c, progreso };
    })
    .filter(item => item.progreso.diasRestantes <= 30 && item.progreso.diasRestantes > 0)
    .sort((a, b) => {
      if (!a.progreso.fechaExpiracion || !b.progreso.fechaExpiracion) return 0;
      return a.progreso.fechaExpiracion.getTime() - b.progreso.fechaExpiracion.getTime();
    });

  // 2. Tramos
  const tramosCount = { A: 0, B: 0, C: 0, D: 0 };
  cargasVigentes.forEach(c => {
    const trabajador = trabajadores.find(t => t.id === c.trabajadorId);
    if (trabajador) {
      const tramo = calcularTramo(trabajador.sueldoBase);
      if (tramo.letra === 'A' || tramo.letra === 'B' || tramo.letra === 'C' || tramo.letra === 'D') {
        tramosCount[tramo.letra as 'A' | 'B' | 'C' | 'D']++;
      }
    }
  });
  const maxTramo = Math.max(...Object.values(tramosCount), 1);

  // 3. Ranking empresas
  const rankingEmpresas = empresas
    .map(emp => ({
      ...emp,
      trabajadoresCount: trabajadores.filter(t => t.empresaId === emp.id).length
    }))
    .sort((a, b) => b.trabajadoresCount - a.trabajadoresCount)
    .slice(0, 3);

  return (
    <div className="pb-10">
      <div className="page-header mb-6">
        <div>
          <h1 className="font-display">Panel de Control</h1>
          <p className="text-muted">Resumen general multi-empresa</p>
        </div>
      </div>

      {/* BLOQUE 1: VENCIMIENTOS */}
      <div className="glass-panel mb-6 border border-white/5" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '2rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
            <AlertTriangle size={20} color="#fbbf24" />
            Cargas por vencer (próximos 30 días)
          </div>
          {cargasPorVencer.length === 0 ? (
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
                <PartyPopper size={32} color="#a855f7" />
              </div>
              <h3 className="font-bold text-white mb-1">Sin cargas por vencer</h3>
              <p className="text-muted text-sm">No hay cargas familiares que venzan en los próximos 30 días.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
              {cargasPorVencer.map(({ carga, progreso }) => {
                const trabajador = trabajadores.find(t => t.id === carga.trabajadorId);
                const width = Math.min(100, Math.max(0, progreso.porcentaje));

                return (
                  <div key={carga.id} className="w-full">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{carga.nombre}</h4>
                        <p className="text-xs text-muted">{trabajador?.nombre}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-display font-bold text-[#fbbf24]">{progreso.diasRestantes} días</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-2 border border-white/10 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${width}%`, background: '#fbbf24' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE 2: GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Gráfico de Estado */}
        <div className="glass-panel border border-white/5" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'white', marginBottom: '2rem', fontSize: '1.125rem', width: '100%' }}>
              <PieChart size={20} color="#0ea5e9" />
              Cargas por estado
            </div>
            <div style={{ position: 'relative', width: '128px', height: '128px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                {cargas.length > 0 && (
                  <circle 
                    cx="64" cy="64" r="54" fill="none" stroke="var(--brandMain)" strokeWidth="12" 
                    strokeDasharray="339.29" 
                    strokeDashoffset={339.29 - (339.29 * (cargasVigentes.length / cargas.length))}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                )}
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-display font-bold text-white" style={{ fontSize: '2rem', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                  {cargas.length}
                </span>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--brandMain)', boxShadow: '0 0 8px var(--brandMain)' }}></div>
                  <span className="text-white font-medium">Vigentes</span>
                </div>
                <span className="font-bold text-white">{cargasVigentes.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  <span className="text-muted font-medium">Vencidas</span>
                </div>
                <span className="font-bold text-muted">{cargasVencidas.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Actividad/Tramos */}
        <div className="glass-panel border border-white/5" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'white', marginBottom: 'auto', fontSize: '1.125rem', width: '100%' }}>
              <TrendingUp size={20} color="#8b5cf6" />
              Distribución por Tramo (Activas)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', height: '160px' }}>
              {['A', 'B', 'C', 'D'].map(tramo => {
                const count = tramosCount[tramo as 'A'|'B'|'C'|'D'];
                const heightPercentage = maxTramo === 0 ? 0 : (count / maxTramo) * 100;
                
                return (
                  <div key={tramo} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{count > 0 ? count : ''}</span>
                    <div 
                      style={{ 
                        width: '40px',
                        height: `${Math.max(4, heightPercentage)}%`, 
                        background: count > 0 ? 'linear-gradient(to top, rgba(139, 92, 246, 0.5), #8b5cf6)' : 'rgba(255,255,255,0.05)',
                        boxShadow: count > 0 ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        transition: 'all 0.5s'
                      }}
                    ></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--textMuted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>Tramo {tramo}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: RANKING EMPRESAS */}
      <div className="glass-panel mb-6 border border-white/5" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '2rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
            <Trophy size={20} color="#f97316" />
            Empresas con más trabajadores
          </div>
          {empresas.length === 0 ? (
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
                <Building2 size={32} color="gray" />
              </div>
              <h3 className="font-bold text-white mb-1">Aún no tienes empresas registradas</h3>
              <p className="text-muted text-sm">Agrega tu primera empresa cliente para comenzar a gestionar trabajadores y cargas.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', width: '100%' }}>
              {rankingEmpresas.map((emp, index) => (
                <div key={emp.id} style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.125rem', background: index === 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.05)', color: index === 0 ? '#f97316' : 'white' }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>{emp.razonSocial}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--textMuted)' }}>{emp.trabajadoresCount} empleados</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE 4: TARJETAS DE NAVEGACIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div 
          onClick={() => onNavigate('empresa')} 
          className="glass-panel hover-glow"
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Empresas</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--textMuted)', marginTop: '0.25rem' }}>Dashboard y cartera de empresas clientes</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('trabajadores')} 
          className="glass-panel hover-glow"
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Trabajadores</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--textMuted)', marginTop: '0.25rem' }}>Directorio global de trabajadores</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('cargas')} 
          className="glass-panel hover-glow"
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Licencias Médicas</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--textMuted)', marginTop: '0.25rem' }}>Vigencia, estados y comprobantes en PDF</div>
          </div>
        </div>
      </div>

    </div>
  );
};
