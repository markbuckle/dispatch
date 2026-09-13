import type { Metadata } from 'next';
import { AuthCard } from '../auth-card';

export const metadata: Metadata = {
  title: 'Sign up - Dispatch',
};

export default function SignupPage() {
  return <AuthCard mode="signup" />;
}
