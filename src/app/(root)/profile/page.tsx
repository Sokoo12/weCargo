"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  createdAt: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
}

export default function UserProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [hasInvalidIdError, setHasInvalidIdError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check URL for force reset parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forceReset = urlParams.get('forceReset');
      
      if (forceReset === 'true') {
        // This is a hard reset request - clear everything
        localStorage.clear();
        
        // Restore original fetch if it was overridden
        if (window.originalFetch) {
          window.fetch = window.originalFetch;
        }
        
        // Remove the parameter from URL to prevent repeated resets
        router.replace('/profile');
        
        toast.info('Бүх төлөвүүд бүрэн устгагдлаа', {
          description: 'Та дахин нэвтрэх шаардлагатай.'
        });
        
        // Redirect to sign-in after a brief delay
        setTimeout(() => {
          window.location.href = '/sign-in';
        }, 2000);
        
        return;
      }
    }
    
    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setOrderStats(data.orderStats);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phoneNumber: data.user.phoneNumber || '',
        });
      } else {
        const errorData = await response.json();
        
        // Check for invalid user ID format error
        if (errorData.error && errorData.error.includes('Invalid user ID format')) {
          console.error('Invalid user ID detected:', errorData.error);
          clearInvalidAuthData();
        } else {
          toast.error('Алдаа гарлаа', {
            description: errorData.error || 'Профайл ачаалахад алдаа гарлаа.',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Алдаа гарлаа', {
        description: 'Таны профайлыг ачаалж чадсангүй.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Профайл шинэчлэгдлээ', {
          description: 'Таны профайлын мэдээлэл амжилттай шинэчлэгдлээ.',
        });
        setIsEditing(false);
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        
        // Also check for invalid ID on update
        if (errorData.error && errorData.error.includes('Invalid user ID format')) {
          console.error('Invalid user ID detected during update:', errorData.error);
          clearInvalidAuthData();
        } else {
          throw new Error(errorData.error || 'Профайл шинэчлэхэд алдаа гарлаа');
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Шинэчлэлт амжилтгүй болсон', {
        description: error instanceof Error ? error.message : 'Ямар нэгэн алдаа гарлаа',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to clear invalid auth data with a more thorough approach
  const clearInvalidAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      
      // Restore original fetch if it was overridden
      if (window.originalFetch) {
        window.fetch = window.originalFetch;
      }
      
      toast.info('Бүртгэл хүчингүй болсон', {
        description: 'Та дахин нэвтэрнэ үү.'
      });
      
      // Set error state instead of immediately redirecting
      setHasInvalidIdError(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Профайл ачааллаж байна...</p>
      </div>
    );
  }

  // Show error message if invalid ID was detected
  if (hasInvalidIdError) {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Хүчингүй бүртгэлтэй байна
            </CardTitle>
            <CardDescription>
              Таны нэвтрэх бүртгэл хүчингүй байна. "Invalid user ID format: test-id" гэсэн алдаа гарлаа.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Энэ нь тест хэрэглэгчийн бүртгэлээс үүдэлтэй алдаа юм. Та бүртгэлээ шинэчлэх хуудас руу орж алдааг засна уу.
            </p>
            <Link href="/profile/reset">
              <Button 
                variant="destructive" 
                className="w-full mb-4"
              >
                Бүртгэл засварлах хуудас руу очих
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Бүртгэл хуудас руу очих
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold">Миний профайл</h1>

      <Card>
        <CardHeader>
          <CardTitle>Хувийн мэдээлэл</CardTitle>
          <CardDescription>
            Таны хувийн болон холбоо барих мэдээлэл
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Бүтэн нэр</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Имэйл</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Утасны дугаар</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                  Цуцлах
                </Button>
                <Button type="submit">Хадгалах</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Бүтэн нэр</p>
                    <p className="text-lg">{userData?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Имэйл</p>
                    <p className="text-lg">{userData?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Утас</p>
                    <p className="text-lg">{userData?.phoneNumber || 'Оруулаагүй байна'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Бүртгүүлсэн</p>
                    <p className="text-lg">{userData?.createdAt ? formatDate(userData.createdAt) : 'Тодорхойгүй'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => setIsEditing(true)}>
                  Профайл засах
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Миний захиалгууд</CardTitle>
          <CardDescription>
            Таны захиалгуудын товч мэдээлэл
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{orderStats.totalOrders}</p>
                  <p className="text-sm text-gray-500 mt-1">Нийт захиалга</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{orderStats.pendingOrders}</p>
                  <p className="text-sm text-gray-500 mt-1">Хүлээгдэж байгаа</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{orderStats.inTransitOrders}</p>
                  <p className="text-sm text-gray-500 mt-1">Тээвэрлэж байгаа</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{orderStats.deliveredOrders}</p>
                  <p className="text-sm text-gray-500 mt-1">Хүргэгдсэн</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Link href="/orders">
              <Button className="w-full">
                <span>Захиалгууд харах</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 