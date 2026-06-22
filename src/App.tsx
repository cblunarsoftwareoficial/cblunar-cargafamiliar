import { useState, useEffect } from 'react';
import { Users, FileText, Home, LogOut, Building2 } from 'lucide-react';
import { useAppContext } from './store/AppContext';
import { calcularProgresoTramite } from './utils/cargas';
import { Dashboard } from './components/Dashboard';
import { TrabajadoresView } from './components/TrabajadoresView';
import { CargasView } from './components/CargasView';
import { EmpresaView } from './components/EmpresaView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { AccountView } from './components/AccountView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('cb_lunar_token');
  });
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('cb_lunar_user') || 'Usuario';
  });
  
  const [currentView, setCurrentView] = useState('dashboard');
  const { cargas } = useAppContext();

  // Sistema de Recordatorios Diarios
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastReminder = localStorage.getItem('cb_lunar_last_reminder');
    
    if (lastReminder !== today) {
      // Check for expiring cargas
      const expiringDetails: string[] = [];
      
      cargas.forEach(c => {
        const progreso = calcularProgresoTramite(c);
        if (!progreso.indefinido && progreso.diasRestantes > 0 && progreso.diasRestantes <= 30) {
          expiringDetails.push(`${c.nombre} (en ${progreso.diasRestantes} días)`);
        }
      });

      if (expiringDetails.length > 0) {
        // Build descriptive message
        const displayList = expiringDetails.slice(0, 3).join(', ');
        const extraCount = expiringDetails.length > 3 ? ` y ${expiringDetails.length - 3} más` : '';
        const bodyText = `Vencimientos próximos: ${displayList}${extraCount}. Por favor revisa el panel.`;

        // Native Desktop Notification
        if (Notification.permission === 'granted') {
          new Notification('CB Lunar | Alerta de Cargas', {
            body: bodyText,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('CB Lunar | Alerta de Cargas', {
                body: bodyText,
              });
            }
          });
        }
      }
      
      localStorage.setItem('cb_lunar_last_reminder', today);
    }
  }, [isAuthenticated, cargas]);

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard onNavigate={(view) => setCurrentView(view)} />;
      case 'empresa': return <EmpresaView />;
      case 'trabajadores': return <TrabajadoresView />;
      case 'cargas': return <CargasView />;
      case 'account': return <AccountView userEmail={userName} />;
      default: return <Dashboard onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  const handleLogin = (token: string, name: string) => {
    localStorage.setItem('cb_lunar_token', token);
    localStorage.setItem('cb_lunar_user', name);
    setUserName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('cb_lunar_token');
    localStorage.removeItem('cb_lunar_user');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="ambient-light-1"></div>
        <div className="ambient-light-2"></div>
        {authView === 'login' ? (
          <LoginView 
            onLogin={handleLogin} 
            onNavigateRegister={() => setAuthView('register')} 
          />
        ) : (
          <RegisterView 
            onRegister={handleLogin} 
            onNavigateLogin={() => setAuthView('login')} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Luces Ambientales (CB Lunar Background) */}
      <div className="ambient-light-1"></div>
      <div className="ambient-light-2"></div>

      <aside className="sidebar glass-panel">
        <div style={{ padding: '1.5rem' }}>
          {/* Logo Lunar */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--brandMain), var(--brandAlt))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem',
              boxShadow: '0 8px 25px rgba(217,70,239,0.4)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              CB
            </div>
            <span style={{ color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Lunar
            </span>
          </div>

          {/* User/App indicator */}
          <div style={{ marginBottom: '2.5rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 700 }}>Módulo Activo</p>
            <div className="flex items-center gap-2">
              <span style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
                <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--brandMain)', opacity: 0.75, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                <span style={{ position: 'relative', borderRadius: '50%', width: '10px', height: '10px', backgroundColor: 'var(--brandMain)' }}></span>
              </span>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Gestor de Cargas</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <Home size={24} /> Inicio
            </button>
            <button 
              className={`nav-item ${currentView === 'empresa' ? 'active' : ''}`}
              onClick={() => setCurrentView('empresa')}
            >
              <Building2 size={24} /> Empresa
            </button>
            <button 
              className={`nav-item ${currentView === 'trabajadores' ? 'active' : ''}`}
              onClick={() => setCurrentView('trabajadores')}
            >
              <Users size={24} /> Trabajadores
            </button>
            <button 
              className={`nav-item ${currentView === 'cargas' ? 'active' : ''}`}
              onClick={() => setCurrentView('cargas')}
            >
              <FileText size={24} /> Cargas Activas
            </button>
          </nav>
        </div>

        <div style={{ marginTop: 'auto', padding: '1.5rem' }}>

          {/* Widget de Cuenta */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px', 
              padding: '1rem',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.75rem', opacity: 0.4, textTransform: 'uppercase' }}>
                Cuenta
              </p>
              
              <div 
                onClick={() => setCurrentView('account')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '0.5rem', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'var(--brandMain)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(112,0,255,0.3)'
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.9)' }}>
                  {userName}
                </span>
              </div>

              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderView()}
      </main>
      
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default App;
