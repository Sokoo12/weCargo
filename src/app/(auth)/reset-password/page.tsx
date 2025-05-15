'use client'

import { useState } from 'react';
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
  CardFooter
} from "@/components/ui/card";
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Request reset, 2: Enter code and new password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate phone number
      if (!phoneNumber) {
        setError('Утасны дугаар оруулна уу');
        return;
      }

      // Call API to request password reset
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Нууц үг сэргээх код илгээгдлээ', {
          description: 'Таны утсанд нууц үг сэргээх код илгээгдлээ'
        });
        setStep(2);
      } else {
        setError(data.error || 'Нууц үг сэргээх хүсэлт амжилтгүй болсон');
      }
    } catch (err) {
      console.error('Reset request error:', err);
      setError('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate input
      if (!resetCode) {
        setError('Баталгаажуулах код оруулна уу');
        return;
      }

      if (!newPassword) {
        setError('Шинэ нууц үг оруулна уу');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Нууц үгнүүд таарахгүй байна');
        return;
      }

      // Call API to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          resetCode,
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Нууц үг амжилттай шинэчлэгдлээ', {
          description: 'Та шинэ нууц үгээрээ нэвтэрч болно'
        });
        
        // Redirect to sign-in page after successful reset
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        setError(data.error || 'Нууц үг шинэчлэх амжилтгүй болсон');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Алдаа гарлаа. Дахин оролдоно уу.');
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
              {step === 1 ? 'Нууц үг сэргээх' : 'Шинэ нууц үг тохируулах'}
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              {step === 1 
                ? 'Утасны дугаараа оруулна уу. Бид танд нууц үгээ сэргээх код илгээх болно.'
                : 'Таны утас руу илгээсэн кодыг оруулж, шинэ нууц үгээ тохируулна уу.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-4" onSubmit={handleRequestReset}>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Утасны дугаар"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>📱</span>
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
                      Илгээж байна...
                    </>
                  ) : (
                    'Код авах'
                  )}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="relative">
                  <Input
                    id="resetCode"
                    name="resetCode"
                    type="text"
                    placeholder="Баталгаажуулах код"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>🔑</span>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Шинэ нууц үг"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>🔒</span>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Нууц үгээ баталгаажуулах"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <span>🔒</span>
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
                      Шинэчилж байна...
                    </>
                  ) : (
                    'Нууц үг шинэчлэх'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[50px] rounded-full"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Буцах
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="w-full text-center">
              <Link href="/sign-in" className="text-sm text-primary hover:text-primary/70">
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 