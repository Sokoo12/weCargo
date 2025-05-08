'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Phone, Mail, MapPin, Calendar, Shield } from 'lucide-react';

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  role: string;
  joinDate: string;
  lastLogin: string | null;
}

export default function ManagerProfilePage() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/me');
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        setFormData({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
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
      const response = await fetch('/api/employee/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Профайл шинэчлэгдлээ', {
          description: 'Таны профайлын мэдээлэл амжилттай шинэчлэгдлээ.',
        });
        setIsEditing(false);
        fetchEmployeeData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Профайл шинэчлэхэд алдаа гарлаа');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Профайл ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Менежерийн профайл</h1>

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
              
              <div className="space-y-2">
                <Label htmlFor="address">Хаяг</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                    <p className="text-lg">{employee?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Имэйл</p>
                    <p className="text-lg">{employee?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Утас</p>
                    <p className="text-lg">{employee?.phoneNumber || 'Оруулаагүй байна'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Хаяг</p>
                    <p className="text-lg">{employee?.address || 'Оруулаагүй байна'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Элссэн</p>
                    <p className="text-lg">{employee?.joinDate ? formatDate(employee.joinDate) : 'Тодорхойгүй'}</p>
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
          <CardTitle>Бүртгэлийн мэдээлэл</CardTitle>
          <CardDescription>
            Таны бүртгэлийн дэлгэрэнгүй болон удирдлагын эрхүүд
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Ажилтны ID</p>
                <p className="text-lg">{employee?.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Үүрэг</p>
                <p className="text-lg">{employee?.role || 'Менежер'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Сүүлд нэвтэрсэн</p>
                <p className="text-lg">{employee?.lastLogin ? formatDate(employee.lastLogin) : 'Хэзээ ч үгүй'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 