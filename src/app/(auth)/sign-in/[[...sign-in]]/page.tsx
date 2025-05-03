'use client'

import { useState } from 'react';
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
} from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react"; // Import necessary icons

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // TODO: Implement your authentication logic here
      // const response = await fetch('/api/auth/signin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })
      
      // if (response.ok) {
      //   router.push('/dashboard')
      // } else {
      //   setError('Invalid email or password')
      // }
      
      console.log('Sign in attempt:', formData)
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

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
                  className="object-cover"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Өөрийн бүртгэлээр нэвтэрнэ үү
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              <Link href="/sign-up" className="font-medium text-primary hover:text-primary/70">
                Шинэ аккаунт үүсгэх
              </Link>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  className="text-red-400 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email хаяг"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12"
                    required
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <Mail size={18} />
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
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <Lock size={18} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                    Намайг сана
                  </label>
                </div>

                <div>
                  <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/70">
                    Нууц үг мартсан?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white h-[50px] rounded-full"
              >
                Нэвтрэх
              </Button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Эсвэл</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="items-center justify-center w-full flex ">  
                <button
                  type="button"
                  className="flex justify-center items-center bg-white border border-gray-300 rounded-full py-2 px-3 h-[50px] hover:bg-gray-50 transition-colors w-full"
                >
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A10.014 10.014 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                    />
                  </svg>
                  <span className="ml-2 text-gray-600 text-sm font-medium">Google</span>
                </button>

              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}