import type { Metadata } from 'next';
import { AuthCard } from '../auth-card';

export const metadata: Metadata = {
  title: 'Log in - Dispatch',
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
