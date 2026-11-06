'use client';
import { useActionState } from 'react';
import { signIn } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function LoginForm(){const [state,action,pending]=useActionState(signIn,{});return <form action={action} className="admin-form"><label>Email<Input name="email" type="email" autoComplete="username" required/></label><label>Password<Input name="password" type="password" autoComplete="current-password" required/></label>{state.error&&<p role="alert" className="error-message">{state.error}</p>}<Button disabled={pending}>{pending?'Signing in…':'Sign in'}</Button><p className="muted">Private access for the artist. To reset your password, use the account recovery steps in the setup guide.</p></form>;}
