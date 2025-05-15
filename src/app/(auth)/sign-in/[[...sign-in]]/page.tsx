'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useUserAuth } from "@/context/UserAuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useUserAuth();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clean up any existing tokens when sign-in page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any existing tokens to avoid conflicts
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
    }
  }, []);

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate phone number and password
      if (!formData.phoneNumber) {
        setError('Phone number is required');
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        setError('Password is required');
        setIsLoading(false);
        return;
      }

      // Use relative URL for same-origin requests to avoid CORS issues
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Login using the simplified context
        login(data.token, data.user);
        
        // Redirect to the dashboard
        router.push('/');
      } else {
        // Error handling
        setError(data.error || 'Invalid phone number or password');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md z-10 mb-[100px] sm:mb-0 mt-[120px]">
        <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={64} 
                  height={64} 
                  priority={true}
                  style={{ height: 'auto' }}
                  className="object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Өөрийн бүртгэлээр нэвтэрнэ үү
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Утасны дугаар болон нууц үгээрээ нэвтэрнэ үү
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Утасны дугаар"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>📱</span>
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Нууц үг"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>🔒</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <Link href="/reset-password" className="text-sm text-primary hover:text-primary/70">
                    Нууц үгээ мартсан?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white h-[50px] rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Нэвтрэх...
                  </>
                ) : (
                  'Нэвтрэх'
                )}
              </Button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Бүртгэлгүй бол</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="items-center justify-center w-full flex ">  
              <Link href="/sign-up" className="font-medium text-primary hover:text-primary/70 text-2xl">
                Бүртгүүлэх
              </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}