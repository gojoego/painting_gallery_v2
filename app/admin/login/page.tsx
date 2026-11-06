import { LoginForm } from './login-form';
import { configured } from '@/lib/supabase';
export const metadata={title:'Artist sign in',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{denied?:string}>}){const params=await searchParams;return <section className="login-panel"><p className="eyebrow">THE ARTIST’S STUDIO</p><h1>Welcome back.</h1><p>Sign in to manage your paintings.</p>{!configured()?<p className="notice">Connect Supabase to open your studio. See README.md for environment variables and artist account setup.</p>:<LoginForm/>}{params.denied&&<p role="alert">This account is not authorized.</p>}</section>;}
