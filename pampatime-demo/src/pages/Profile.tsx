import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

export default function Profile(){
  const { user, updateDisplayName, sendReset } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if(!user) return <div className='p-6'>Não autenticado.</div>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await updateDisplayName(name.trim());
      setMsg('Nome atualizado.');
    } catch (e:any){
      setMsg(e.message);
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    setMsg(null);
    try {
      await sendReset();
      setMsg('Email de redefinição enviado.');
    } catch(e:any){ setMsg(e.message); }
  };

  return (
    <>
      <Header />
      <div className='p-6 max-w-lg'>
        <Card>
          <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Email</label>
              <Input value={user.email||''} disabled />
            </div>
            <div>
              <label className='text-sm font-medium'>Nome</label>
              <Input value={name} onChange={e=>setName(e.target.value)} />
            </div>
            {msg && <p className='text-sm text-emerald-600'>{msg}</p>}
          </CardContent>
          <CardFooter className='flex gap-2'>
            <Button type='submit' disabled={saving}>{saving? 'Salvando...' : 'Salvar'}</Button>
            <Button type='button' variant='outline' onClick={handleReset}>Redefinir Senha</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
    </>
  );
}
