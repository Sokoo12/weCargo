'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ClearTokenButton() {
  const router = useRouter();
  const [isCleaning, setIsCleaning] = useState(false);

  const clearToken = () => {
    try {
      setIsCleaning(true);
      
      if (typeof window !== 'undefined') {
        // Remove the tokens from localStorage
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        
        // Clear other potential localStorage items
        localStorage.removeItem("auth_token");
        localStorage.removeItem("admin_token");
        
        // Restore original fetch if it was overridden
        if (window.originalFetch) {
          window.fetch = window.originalFetch;
        }
        
        toast.success('Бүртгэл амжилттай устгагдлаа', {
          description: 'Таны бүртгэлийг устгалаа. Хуудас дахин ачааллаж байна...'
        });
        
        // Force a full page reload to clear any in-memory state
        setTimeout(() => {
          // Navigate directly to sign-in with a forced reload
          window.location.href = '/sign-in';
        }, 1500);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      toast.error('Алдаа гарлаа', {
        description: 'Бүртгэлээ устгахад алдаа гарлаа. Аппаа ахин ачаалаад оролдоно уу.'
      });
      setIsCleaning(false);
    }
  };

  const forceManualReset = () => {
    try {
      // Clear everything in localStorage for a fresh start
      if (typeof window !== 'undefined') {
        localStorage.clear();
        
        // Restore original fetch if it was overridden
        if (window.originalFetch) {
          window.fetch = window.originalFetch;
        }
        
        toast.success('Бүх төлөвүүд устгагдлаа', {
          description: 'Веб аппликэйшнийг бүрэн шинэчилж байна...'
        });
        
        // Force a full page reload
        setTimeout(() => {
          window.location.href = '/sign-in?forcereset=true';
        }, 1000);
      }
    } catch (error) {
      console.error('Error during manual reset:', error);
    }
  };

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
          Хүчингүй бүртгэлтэй байна
        </CardTitle>
        <CardDescription>
          Таны нэвтрэх бүртгэл хүчингүй байна. Энэ нь тест хэрэглэгчийн хийсэн алдаатай холбоотой.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          "Invalid user ID format: test-id" гэсэн алдаа гарсан бол энэ нь өмнөх туршилтын бүртгэлээс үүдэлтэй.
          Доорх товчийг дарж өмнөх бүртгэлийг устгана уу.
        </p>
        <Button 
          variant="destructive" 
          onClick={clearToken}
          className="w-full flex items-center justify-center mb-2"
          disabled={isCleaning}
        >
          {isCleaning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Бүртгэл устгаж байна...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Хүчингүй бүртгэл устгах
            </>
          )}
        </Button>
        
        <div className="mt-4 pt-4 border-t border-yellow-500/20">
          <p className="text-xs text-yellow-800 mb-2">
            Хэрэв дээрх товч ажиллахгүй бол энэ товчийг дарж бүх мэдээллийг устгаж үзнэ үү:
          </p>
          <Button 
            variant="outline" 
            onClick={forceManualReset}
            className="w-full text-xs"
            disabled={isCleaning}
          >
            Бүх төлөвүүдийг бүрэн устгах
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 