'use client';

import { useEffect, useState } from 'react';
import ClearTokenButton from '../clearToken';
import ResetButton from '../ResetButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkStoredUserValidity } from '@/utils/tokenReset';

export default function ResetProfilePage() {
  const [hasBadToken, setHasBadToken] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Check if there's a token in localStorage
    const checkToken = () => {
      try {
        setIsChecking(true);
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('userToken');
          const userData = localStorage.getItem('userData');
          
          // First check using our utility function
          if (!checkStoredUserValidity()) {
            setHasBadToken(true);
            setIsChecking(false);
            return;
          }
          
          // If we have a token, try to extract the ID
          if (token && userData) {
            try {
              const parsedUser = JSON.parse(userData);
              // Check if the ID looks like a test ID
              if (parsedUser.id === 'test-id' || 
                  (typeof parsedUser.id === 'string' && !parsedUser.id.match(/^[0-9a-fA-F]{24}$/))) {
                setHasBadToken(true);
              }
            } catch (e) {
              console.error('Error parsing user data:', e);
              setHasBadToken(true); // If we can't parse it, it's probably bad
            }
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setHasBadToken(true); // If there's an error, assume bad token
      } finally {
        setIsChecking(false);
      }
    };
    
    checkToken();
  }, []);
  
  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Бүртгэл засварлах</h1>
      
      {isChecking ? (
        <Card>
          <CardContent className="py-8 flex justify-center items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            <p>Бүртгэл шалгаж байна...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {hasBadToken ? (
            <ClearTokenButton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Бүртгэл хэвийн байна</CardTitle>
                <CardDescription>
                  Таны бүртгэлд одоогоор ямар нэгэн асуудал илрээгүй байна.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">
                  Хэрэв танд бүртгэлтэй холбоотой асуудал гарсан бол доорх сонголтуудаас сонгоно уу:
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('userToken');
                        localStorage.removeItem('userData');
                        window.location.href = '/sign-in';
                      }
                    }}
                  >
                    Токен устгах
                  </Button>
                  
                  <ResetButton
                    className="w-full" 
                    text="Бүх төлөвүүдийг бүрэн шинэчлэх"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-8">
            <Link href="/profile">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Профайл хуудас руу буцах
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 