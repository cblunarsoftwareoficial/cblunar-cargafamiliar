import { useState } from 'react';
import { User, Lock, Shield } from 'lucide-react';

export const AccountView = ({ userEmail }: { userEmail: string }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [phone, setPhone] = useState('');

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'password', label: 'Contraseña', icon: Lock },
    { id: '2fa', label: 'Autenticación de 2 pasos', icon: Shield }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'white', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Tu Cuenta</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Gestiona tu perfil y preferencias de seguridad</p>
      </div>

      <div style={{ display: 'flex', gap: '3rem' }}>
        {/* Sidebar */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(112,0,255,0.15)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  boxShadow: activeTab === tab.id ? 'inset 2px 0 0 var(--brandMain)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <tab.icon size={18} style={{ color: activeTab === tab.id ? 'var(--brandMain)' : 'inherit' }} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'profile' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '2rem' }}>Perfil del Usuario</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>CORREO DE INGRESO</label>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>{userEmail}</span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>NÚMERO DE TELÉFONO</label>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="lunar-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                />
              </div>

              <button className="btn btn-primary" style={{
                background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem 2.5rem',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(112,0,255,0.4)',
                transition: 'all 0.3s ease'
              }}>
                Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '2rem' }}>Cambiar contraseña</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>CONTRASEÑA ACTUAL</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  className="lunar-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                />
                <button 
                  onClick={() => setActiveTab('forgot-password')}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--brandMain)', 
                    fontSize: '0.8rem', 
                    marginTop: '0.75rem', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>NUEVA CONTRASEÑA</label>
                <input
                  type="password"
                  placeholder="Ingresa la nueva contraseña"
                  className="lunar-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  placeholder="Confirma la nueva contraseña"
                  className="lunar-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                />
              </div>

              <button className="btn btn-primary" style={{
                background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem 2.5rem',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(112,0,255,0.4)',
                transition: 'all 0.3s ease'
              }}>
                Actualizar contraseña
              </button>
            </div>
          )}

          {activeTab === '2fa' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Autenticación de 2 pasos (2FA)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Protege tu cuenta con una capa de seguridad adicional.</p>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Aplicación autenticadora</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Usa una aplicación en tu teléfono (como Google Authenticator o Authy) para generar códigos de seguridad.
                </p>
                <button className="btn btn-primary" style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid var(--brandMain)',
                  padding: '0.75rem 2rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(112,0,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Configurar aplicación
                </button>
              </div>
            </div>
          )}

          {activeTab === 'forgot-password' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <button 
                onClick={() => setActiveTab('password')}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1.5rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Volver
              </button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Recuperación inteligente</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Ingresa la última contraseña que recuerdes. Si es cercana o se parece mucho a tu contraseña actual, te enviaremos un código a tu correo electrónico.
              </p>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>ÚLTIMA CONTRASEÑA RECORDADA</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="lunar-input"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                />
              </div>

              <button className="btn btn-primary" style={{
                background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem 2.5rem',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(112,0,255,0.4)',
                transition: 'all 0.3s ease',
                width: '100%'
              }}>
                Validar y enviar código
              </button>
            </div>
          )}

          {activeTab !== 'profile' && activeTab !== 'password' && activeTab !== '2fa' && activeTab !== 'forgot-password' && (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={28} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 600 }}>Sección en desarrollo</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>Esta área de configuración estará disponible en la próxima actualización.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
