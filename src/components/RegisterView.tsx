import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RegisterViewProps {
  onRegister: (token: string, userName: string) => void;
  onNavigateLogin: () => void;
}

export function RegisterView({ onRegister, onNavigateLogin }: RegisterViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [step, setStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      if (data.requireVerification) {
        setStep(2);
      } else {
        // Fallback en caso de que no requiera verificación por alguna razón
        onRegister(data.token, data.user.name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código incorrecto');
      }

      onRegister(data.token, data.user.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      flex: 1,
      backgroundColor: 'transparent',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Luces de fondo del viewport principal */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>

      {/* Contenedor scrolleable */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2rem'
      }}>
        <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        minHeight: '550px',
        margin: 'auto',
        background: 'rgba(15, 15, 25, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>
      {/* Columna Derecha: Formulario (Intercambiado para dar variedad respecto al login) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {step === 1 ? 'Crea tu cuenta' : 'Verifica tu correo'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {step === 1 
                ? 'Únete a CB Lunar y moderniza tu gestión.' 
                : `Hemos enviado un código de 6 dígitos a ${email}.`}
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #ef4444',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>NOMBRE COMPLETO</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="lunar-input" 
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>CORREO ELECTRÓNICO</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    className="lunar-input" 
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                    placeholder="ejemplo@empresa.cl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>CONTRASEÑA SEGURA</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    className="lunar-input" 
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ 
                marginTop: '1rem', 
                width: '100%', 
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)',
                boxShadow: '0 8px 25px rgba(0,240,255,0.4)'
              }} disabled={loading}>
                <span>{loading ? 'Creando cuenta...' : 'Comenzar ahora'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', textAlign: 'center', display: 'block', marginBottom: '1rem' }}>CÓDIGO DE VERIFICACIÓN</label>
                <input 
                  type="text" 
                  className="lunar-input" 
                  style={{ 
                    textAlign: 'center',
                    fontSize: '2rem',
                    letterSpacing: '10px',
                    fontWeight: 'bold',
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '10px' 
                  }}
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ 
                marginTop: '1rem', 
                width: '100%', 
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, var(--brandAlt) 0%, var(--brandMain) 100%)',
                boxShadow: '0 8px 25px rgba(0,240,255,0.4)'
              }} disabled={loading || verificationCode.length !== 6}>
                <span>{loading ? 'Verificando...' : 'Confirmar cuenta'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Volver atrás
              </button>
            </form>
          )}

          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '2.5rem 0 1.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ¿Ya tienes cuenta?
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>

              <button 
                onClick={onNavigateLogin}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  marginTop: '1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Inicia sesión aquí
              </button>
            </>
          )}
        </div>
      </div>

      {/* Columna Izquierda: Beneficios (Innovación) */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(20,20,30,0.8) 0%, rgba(30,20,40,0.8) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)'
      }} className="brand-column">
        {/* Luces de fondo exclusivas para esta vista */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(112,0,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          width: '100%'
        }}>
          
          <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <ShieldCheck size={32} color="var(--brandAlt)" />
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', color: 'white' }}>
            Beneficios exclusivos<br/>para tu empresa.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <CheckCircle2 size={24} color="var(--brandMain)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Gestión Ilimitada</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Agrega tantos trabajadores y cargas familiares como tu empresa necesite sin restricciones.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <CheckCircle2 size={24} color="var(--brandMain)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Soporte Técnico 24/7</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Asistencia en tiempo real garantizada por nuestros expertos a través del portal de clientes.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <CheckCircle2 size={24} color="var(--brandMain)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Facturación Simple</h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Integración directa con Mercado Pago y facturación automatizada a fin de mes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      
      {/* Soporte CSS para ocultar columna izquierda en móviles */}
      <style>{`
        @media (max-width: 1000px) {
          .brand-column { display: none !important; }
        }
      `}</style>
    </div>
  );
}
