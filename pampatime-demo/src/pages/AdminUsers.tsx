import React, { useEffect, useState } from 'react';
import { listUsers, updateUserRole, setUserActive, createUserRecord } from '@/services/userService';
import { AppUser, UserRole } from '@/types/auth';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSecondaryAuth } from '@/firebase/config';
import Header from '@/components/Header';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

const roleLabels: Record<UserRole, string> = { admin: 'Administrador', coordenador: 'Coordenador' };

const AdminUsers: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [confirmingRoleUid, setConfirmingRoleUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const secondary = getSecondaryAuth();
      // cria com senha temporária aleatória
      const tempPassword = Math.random().toString(36).slice(-10) + '!A1';
      const cred = await createUserWithEmailAndPassword(secondary, newEmail, tempPassword);
      if (newName) await updateProfile(cred.user, { displayName: newName });
      const userRecord: AppUser = { uid: cred.user.uid, email: newEmail, displayName: newName, role: 'coordenador', active: true };
      await createUserRecord(userRecord);
      await sendPasswordResetEmail(secondary, newEmail); // envia link para definir senha
      setNewEmail(''); setNewName('');
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (u: AppUser) => {
    await setUserActive(u.uid, !u.active);
    await fetchUsers();
  };

  const requestRoleChange = (u: AppUser) => {
    setConfirmingRoleUid(u.uid);
  };

  const confirmRoleChange = async (u: AppUser, newRole: UserRole) => {
    await updateUserRole(u.uid, newRole);
    setConfirmingRoleUid(null);
    await fetchUsers();
  };

  if (!isAdmin) return <><Header /><div className='p-6'>Sem permissão.</div></>;

  return (
    <>
    <Header />
    <div className='p-6 space-y-6'>
      <Card>
        <CardHeader><CardTitle>Criar Coordenador</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className='grid gap-4 sm:grid-cols-3'>
            <Input placeholder='Nome' value={newName} onChange={e=>setNewName(e.target.value)} required />
            <Input type='email' placeholder='Email' value={newEmail} onChange={e=>setNewEmail(e.target.value)} required />
            <div className='sm:col-span-3'>
              <Button type='submit' disabled={creating}>{creating? 'Criando...' : 'Criar Coordenador'}</Button>
            </div>
          </form>
          {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
          <p className='text-xs text-gray-500 mt-2'>Um email de definição de senha será enviado automaticamente.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuários</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left border-b'>
                  <th className='py-2'>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const otherRole: UserRole = u.role === 'admin' ? 'coordenador' : 'admin';
                  return (
                    <tr key={u.uid} className='border-b last:border-0'>
                      <td className='py-2'>{u.displayName || '-'}</td>
                      <td>{u.email}</td>
                      <td>{roleLabels[u.role]}</td>
                      <td>{u.active ? 'Ativo' : 'Inativo'}</td>
                      <td className='space-x-2'>
                        <Button variant='outline' size='sm' onClick={()=>handleToggleActive(u)}>{u.active ? 'Desativar' : 'Ativar'}</Button>
                        <Button variant='secondary' size='sm' onClick={()=>requestRoleChange(u)}>
                          Tornar {roleLabels[otherRole]}
                        </Button>
                        {confirmingRoleUid === u.uid && (
                          <span className='inline-flex items-center gap-2'>
                            <Button size='sm' variant='destructive' onClick={()=>confirmRoleChange(u, otherRole)}>Confirmar</Button>
                            <Button size='sm' variant='ghost' onClick={()=>setConfirmingRoleUid(null)}>Cancelar</Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length===0 && !loading && <tr><td colSpan={5} className='py-4 text-center'>Nenhum usuário</td></tr>}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  </>
  );
};

export default AdminUsers;
