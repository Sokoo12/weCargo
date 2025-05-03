'use client'

import { useState, useEffect } from 'react';
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
import { Mail, Lock, User, Phone, CheckCircle, AlertCircle } from "lucide-react"; // Added Phone icon

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: '',
    form: ''
  })
  
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
    terms: false
  })

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Нэрээ оруулна уу';
        } else if (value.trim().length < 2) {
          error = 'Нэр хэт богино байна';
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = 'Имэйл хаягаа оруулна уу';
        } else if (!emailRegex.test(value)) {
          error = 'Зөв имэйл хаяг оруулна уу';
        }
        break;
        
      case 'phoneNumber':
        const phoneRegex = /^[0-9]{8}$/;
        if (!value.trim()) {
          error = 'Утасны дугаараа оруулна уу';
        } else if (!phoneRegex.test(value)) {
          error = 'Зөв утасны дугаар оруулна уу (8 орон)';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Нууц үгээ оруулна уу';
        } else if (value.length < 8) {
          error = 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Нууц үг томоор эхлэх ёстой';
        } else if (!/[0-9]/.test(value)) {
          error = 'Нууц үг тоо агуулсан байх ёстой';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Нууц үгээ давтаж оруулна уу';
        } else if (value !== formData.password) {
          error = 'Нууц үг таарахгүй байна';
        }
        break;
        
      case 'terms':
        if (!value) {
          error = 'Үйлчилгээний нөхцөлийг зөвшөөрнө үү';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setTermsAccepted(checked);
      setTouched({...touched, [name]: true});
      setErrors({
        ...errors, 
        [name]: !checked ? validateField(name, checked) : '',
        form: ''
      });
    } else {
      setFormData({...formData, [name]: value});
      
      // Only validate if the field has been touched before
      if (touched[name]) {
        setErrors({...errors, [name]: validateField(name, value), form: ''});
      }
    }
  };

  // Handle blur event to validate field
  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setTouched({...touched, [name]: true});
    
    if (type === 'checkbox') {
      setErrors({...errors, [name]: !checked ? validateField(name, checked) : ''});
    } else {
      setErrors({...errors, [name]: validateField(name, value)});
    }
  };

  // Validate entire form before submission
  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      terms: validateField('terms', termsAccepted),
      form: ''
    };
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
      terms: true
    });
    
    setErrors(newErrors);
    
    // Check if any errors exist
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    
    if (!isValid) {
      setErrors({...errors, form: 'Бүртгүүлэхийн тулд бүх талбарыг зөв бөглөнө үү'});
      return;
    }

    try {
      // TODO: Implement your registration logic here
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     phoneNumber: formData.phoneNumber,
      //     password: formData.password,
      //   }),
      // });
      
      // if (response.ok) {
      //   router.push('/dashboard');
      // } else {
      //   const data = await response.json();
      //   setErrors({...errors, form: data.message || 'Бүртгэл амжилтгүй боллоо'});
      // }
      
      console.log('Sign up attempt:', formData);
      // For demo purposes, let's simulate a successful signup
      // router.push('/dashboard');
      
    } catch (err) {
      setErrors({...errors, form: 'Алдаа гарлаа. Дахин оролдоно уу.'});
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
                  className="object-cover"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Шинэ бүртгэл үүсгэх
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              <Link href="/sign-in" className="font-medium text-primary hover:text-primary/70">
                Бүртгэлтэй бол нэвтрэх
              </Link>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.form && (
                <motion.div
                  className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.form}
                </motion.div>
              )}
              
              <div className="space-y-4">
                {/* Name field */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Бүтэн нэр"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched.name && errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched.name && errors.name ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <User size={18} />
                    </div>
                  </div>
                  {touched.name && errors.name && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email field */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email хаяг"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched.email && errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched.email && errors.email ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <Mail size={18} />
                    </div>
                  </div>
                  {touched.email && errors.email && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone number field */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Утасны дугаар"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched.phoneNumber && errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched.phoneNumber && errors.phoneNumber ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <Phone size={18} />
                    </div>
                  </div>
                  {touched.phoneNumber && errors.phoneNumber && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.phoneNumber}
                    </motion.p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Нууц үг"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched.password && errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched.password && errors.password ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <Lock size={18} />
                    </div>
                  </div>
                  {touched.password && errors.password && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Нууц үг давтах"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-gray-100 font-medium rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary pl-12 ${
                        touched.confirmPassword && errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    <div className={`absolute text-white outline-none flex items-center justify-center left-2 h-[34px] w-[34px] top-2 ${
                      touched.confirmPassword && errors.confirmPassword ? 'bg-red-500' : 'bg-primary'
                    } rounded-full`}>
                      <Lock size={18} />
                    </div>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <motion.p 
                      className="text-red-500 text-xs pl-4 flex items-center mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    className={`h-4 w-4 focus:ring-primary border-gray-300 rounded ${
                      touched.terms && errors.terms ? 'border-red-300 text-red-500 focus:ring-red-500' : 'text-primary'
                    }`}
                    required
                  />
                  <label htmlFor="terms" className={`ml-2 block text-sm ${
                    touched.terms && errors.terms ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    <span className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-1 ${
                        touched.terms && errors.terms ? 'text-red-500' : 'text-primary'
                      }`} />
                      <span>
                        Би <a href="#" className="font-medium text-primary hover:text-primary/70">Үйлчилгээний нөхцөл</a> болон <a href="#" className="font-medium text-primary hover:text-primary/70">Нууцлалын бодлого</a>-г зөвшөөрч байна
                      </span>
                    </span>
                  </label>
                </div>
                {touched.terms && errors.terms && (
                  <motion.p 
                    className="text-red-500 text-xs pl-6 flex items-center mt-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.terms}
                  </motion.p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full text-white h-[50px] rounded-full"
              >
                Бүртгүүлэх
              </Button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Эсвэл</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="flex justify-center items-center w-full space-x-2">
                <button
                  type="button"
                  className="w-full flex justify-center items-center bg-white border border-gray-300 rounded-full py-2 px-3 h-[50px] hover:bg-gray-50 transition-colors"
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