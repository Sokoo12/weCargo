'use client'

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from "framer-motion";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle } from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  // Validate email function
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Имэйл хаягаа оруулна уу';
    } else if (!emailRegex.test(email)) {
      return 'Зөв имэйл хаяг оруулна уу';
    }
    return '';
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched) {
      setError(validateEmail(e.target.value));
    }
  };

  // Handle blur event to validate field
  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validationError = validateEmail(email);
    setError(validationError);
    
    if (validationError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Хүсэлт амжилтгүй боллоо');
      }
    } catch (err) {
      setError('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ConstellationAnimation />
      <motion.div
        className="w-full max-w-md z-10 mb-[100px] sm:mb-0 mt-[120px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
              {isSubmitted ? 'Имэйл илгээгдсэн' : 'Нууц үг сэргээх'}
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              {isSubmitted 
                ? 'Имэйл хаяг руу нууц үг шинэчлэх заавар илгээгдлээ' 
                : 'Бүртгэлтэй имэйл хаягаа оруулна уу'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSubmitted ? (
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">{email}</span> хаяг руу нууц үг сэргээх холбоос илгээгдлээ.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Хэрэв та имэйл хүлээж аваагүй бол спам хавтсаа шалгана уу.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <motion.div
                    className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email хаяг"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched && error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                      disabled={isLoading}
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched && error ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <Mail size={18} />
                    </div>
                  </div>
                  {touched && error && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {error}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full text-white h-[50px] rounded-full flex items-center justify-center"
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
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Нууц үг сэргээх
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0">
            <Link 
              href="/sign-in" 
              className="text-sm text-primary hover:text-primary/80 flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Нэвтрэх хуудас руу буцах
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}