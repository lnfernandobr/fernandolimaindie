'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

interface LoginResponse {
  token: string;
  user: { id: string; name: string; username: string };
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('fernando');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { username, password },
        auth: false,
      });
      setToken(data.token);
      localStorage.setItem('bn_admin_user', JSON.stringify(data.user));
      router.replace('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Painel de administração do fernandolimaindie</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
