import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const Login: React.FC = () => {
  const { user, signIn, loading, sendReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/homedashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
  await signIn(email, password);
  navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if(!email) { setResetStatus('Informe o email para receber o link.'); return; }
    setResetStatus(null);
    setResetLoading(true);
    try {
      await sendReset(email);
      setResetStatus('Email de redefinição enviado (verifique sua caixa de entrada).');
    } catch(e:any){
      setResetStatus(e.message || 'Falha ao enviar email.');
    } finally { setResetLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleReset} className="text-xs text-emerald-600 hover:underline disabled:opacity-50" disabled={resetLoading}>
                {resetLoading ? 'Enviando...' : 'Esqueci a senha'}
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {resetStatus && <p className="text-xs text-gray-600">{resetStatus}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Entrando...' : 'Entrar'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
