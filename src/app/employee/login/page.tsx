import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Employee Login',
  description: 'Log in to the weCargo employee portal',
};

export default function EmployeeLoginPage() {
  return <LoginForm />;
} 