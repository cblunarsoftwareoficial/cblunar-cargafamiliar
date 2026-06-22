import { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, Rocket, Activity, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (token: string, userName: string) => void;
  onNavigateRegister: () => void;
}

export function LoginView({ onLogin, onNavigateRegister }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [step, setStep] = useState<'login' | 'forgot' | 'reset'>('login');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      onLogin(data.token, data.user.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('El servidor no respondió correctamente (asegúrate de que el backend local esté corriendo).');
      }
      if (!res.ok) throw new Error(data.error || 'Error al enviar código');
      
      setStep('reset');
      setSuccessMsg('Código enviado exitosamente a tu correo.');
    } catch (err: any) {
      // Intentamos con local primero si falla, vamos a beanstalk (temporal por el dev)
      try {
        const res2 = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const contentType2 = res2.headers.get('content-type');
        let data2;
        if (contentType2 && contentType2.includes('application/json')) {
          data2 = await res2.json();
        } else {
           throw new Error('El servidor online no está actualizado. Inicia tu backend local.');
        }
        if (!res2.ok) throw new Error(data2.error || 'Error al enviar código');
        setStep('reset');
        setSuccessMsg('Código enviado exitosamente a tu correo.');
      } catch (err2: any) {
        setError(err2.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, newPassword })
      });
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('El servidor no respondió correctamente.');
      }
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña');
      
      setStep('login');
      setSuccessMsg('Contraseña restablecida correctamente. Inicia sesión con tu nueva clave.');
      setVerificationCode('');
      setNewPassword('');
    } catch (err: any) {
      try {
        const res2 = await fetch('http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode, newPassword })
        });
        const contentType2 = res2.headers.get('content-type');
        let data2;
        if (contentType2 && contentType2.includes('application/json')) {
          data2 = await res2.json();
        } else {
           throw new Error('El servidor online no está actualizado. Inicia tu backend local.');
        }
        if (!res2.ok) throw new Error(data2.error || 'Error al restablecer contraseña');
        
        setStep('login');
        setSuccessMsg('Contraseña restablecida correctamente. Inicia sesión con tu nueva clave.');
        setVerificationCode('');
        setNewPassword('');
      } catch (err2: any) {
        setError(err2.message);
      }
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
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>

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
        {/* Columna Izquierda: Branding (Innovación) */}
        <div style={{
          flex: '0 0 45%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(20,20,30,0.8) 0%, rgba(30,20,40,0.8) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }} className="brand-column">
        {/* Luces de fondo exclusivas para esta vista */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(112,0,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--brandAlt), var(--brandMain))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0,240,255,0.3)'
            }}>
              <Rocket size={28} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>CB LUNAR</span>
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #a0a0b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            El futuro de la<br/>gestión de cargas.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.6 }}>
            Optimiza los beneficios de tus trabajadores con una plataforma rápida, segura y diseñada para la excelencia.
          </p>

          {/* Tarjetas flotantes decorativas */}
          <div style={{ marginTop: '4rem', display: 'flex', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', flex: 1, background: 'rgba(255,255,255,0.02)' }}>
              <Shield size={24} color="var(--brandAlt)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Seguridad Total</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Datos encriptados y protegidos en AWS.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', flex: 1, background: 'rgba(255,255,255,0.02)' }}>
              <Activity size={24} color="var(--brandMain)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tiempo Real</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Sincronización instantánea de registros.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
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
              {step === 'login' && 'Bienvenido de vuelta'}
              {step === 'forgot' && 'Recupera tu acceso'}
              {step === 'reset' && 'Restablecer clave'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {step === 'login' && 'Ingresa tus credenciales para continuar.'}
              {step === 'forgot' && 'Te enviaremos un código para crear una nueva.'}
              {step === 'reset' && 'Ingresa el código enviado a tu correo.'}
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

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderLeft: '4px solid #10b981',
              color: '#34d399',
              padding: '1rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: 0 }}>CONTRASEÑA</label>
                  <button 
                    type="button"
                    onClick={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }}
                    style={{ fontSize: '0.75rem', color: 'var(--brandMain)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    className="lunar-input" 
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                    placeholder="••••••••"
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
                boxShadow: '0 8px 25px rgba(112,0,255,0.4)'
              }} disabled={loading}>
                <span>{loading ? 'Verificando credenciales...' : 'Ingresar a mi cuenta'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {step === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

              <button type="submit" className="btn btn-primary" style={{ 
                marginTop: '1rem', width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }} disabled={loading}>
                <span>{loading ? 'Enviando...' : 'Enviar código de recuperación'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>

              <button type="button" onClick={() => { setStep('login'); setError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', textAlign: 'center', display: 'block', marginBottom: '1rem' }}>CÓDIGO DE VERIFICACIÓN</label>
                <input 
                  type="text" 
                  className="lunar-input" 
                  style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '10px', fontWeight: 'bold', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>NUEVA CONTRASEÑA</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    className="lunar-input" 
                    style={{ paddingLeft: '2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ 
                marginTop: '1rem', width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }} disabled={loading || verificationCode.length !== 6}>
                <span>{loading ? 'Restableciendo...' : 'Guardar nueva contraseña'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>

              <button type="button" onClick={() => { setStep('login'); setError(''); setSuccessMsg(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Cancelar y volver
              </button>
            </form>
          )}

          {step === 'login' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '2.5rem 0 1.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ¿Nuevo en CB Lunar?
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>

              <button 
                onClick={onNavigateRegister}
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
                Crear una cuenta empresarial
              </button>
            </>
          )}

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
