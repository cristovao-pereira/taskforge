import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import { Icons } from '../components/Icons';
import AnimatedBackground from '../components/AnimatedBackground';
import { registerWithEmail, loginWithGoogle, loginWithGithub, syncUserWithBackend } from '../lib/firebase';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      await syncUserWithBackend();
      toast.success('Conta criada com sucesso!');
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Falha ao criar conta com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      await loginWithGithub();
      await syncUserWithBackend();
      toast.success('Conta criada com sucesso!');
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('GitHub signup error:', error);
      toast.error(error.message || 'Falha ao criar conta com GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email, password);
      await syncUserWithBackend();
      toast.success('Conta criada com sucesso!');
      navigate('/app/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />

      {/* Nav */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center absolute top-0 left-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="TaskForge" className="h-12 w-auto object-contain" />
        </Link>
        <div className="hidden md:block">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Já tem uma conta? <Link to="/login" className="hover:opacity-80 ml-1 font-medium" style={{ color: 'var(--accent-color)' }}>Entrar</Link></span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative p-4 z-10">
        <div className="w-full max-w-md shadow-2xl rounded-2xl p-8 md:p-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Criar nova conta</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Comece hoje a automatizar seu sucesso com IA</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Google</span>
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }}></div>
              <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Ou cadastre-se com email</span>
              <div className="flex-grow" style={{ borderTop: '1px solid var(--border-color)' }}></div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span style={{ color: 'var(--text-secondary)' }}>@</span>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="block w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-shadow sm:text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="password" style={{ color: 'var(--text-secondary)' }}>Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Shield className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-shadow sm:text-sm disabled:opacity-50"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="confirmPassword" style={{ color: 'var(--text-secondary)' }}>Confirmar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Shield className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-shadow sm:text-sm disabled:opacity-50"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
              {!loading && <Icons.ChevronDown className="w-4 h-4 ml-2 -rotate-90" />}
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full py-6 text-center z-10">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>© 2026 TaskForge. Todos os direitos reservados.</p>
      </footer>
    </div>

  );
}
