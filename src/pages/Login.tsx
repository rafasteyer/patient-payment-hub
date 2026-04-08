import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // If we're still here (no redirect), stop loading — auth state change will handle redirect
      setIsLoading(false);
    } catch (err: unknown) {
      setError('Erro ao conectar com Google. Tente novamente.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const isConfigError = false;

  return (
    <div className="min-h-screen bg-industrial-bg flex flex-col justify-center items-center p-4 relative overflow-hidden text-industrial-text">
      {/* Background elements abstract */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#365D08] opacity-10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#365D08] opacity-10 blur-3xl rounded-full"></div>

      <div className="bg-industrial-surface z-10 w-full max-w-md p-8 rounded-2xl shadow-xl border border-industrial-border relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-industrial-accent tracking-tight mb-2">Clínica TM</h1>
          <p className="text-industrial-text-muted text-sm">Gestão de Pacientes e Financeiro</p>
        </div>

        <div className="space-y-4">
          {isConfigError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg flex flex-col gap-1">
              <p className="font-bold">⚠️ Configuração Pendente</p>
              <p>As chaves do Supabase não foram encontradas. Verifique as "Project Secrets" no Lovable.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isConfigError}
            className="w-full flex items-center justify-center gap-3 bg-industrial-surface hover:bg-gray-50 dark:hover:bg-gray-800 text-industrial-text font-medium py-3 px-4 rounded-xl border border-industrial-border transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#365D08] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                <span>Entrar com Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-industrial-text-muted">
            Protegido por políticas de segurança. Ao entrar você está acessando a base de dados da Clínica TM.
          </p>
        </div>
      </div>
      <div className="mt-8 text-industrial-text-muted text-xs">Versão 2.0.0 • Infinite Photon System</div>
    </div>
  );
}
