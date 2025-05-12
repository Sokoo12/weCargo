'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@prisma/client';
import { Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

// Mongolian translation mapping
const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.OUT_FOR_DELIVERY]: "Хүргэж байгаа",
  [OrderStatus.DELIVERED]: "Хүргэгдсэн",
  [OrderStatus.CANCELLED]: "Цуцлагдсан",
  [OrderStatus.IN_WAREHOUSE]: "Агуулахад байгаа",
  [OrderStatus.IN_TRANSIT]: "Тээвэрлэж байгаа",
  [OrderStatus.IN_UB]: "Улаанбаатарт байгаа",
};

interface Order {
  id: string;
  packageId?: string;
  phoneNumber?: string;
  status: OrderStatus;
  createdAt: Date;
}

interface Delivery {
  id: string;
  orderId: string;
  address: string;
  district: string;
  apartment?: string;
  notes?: string;
  deliveryFee?: number;
  requestedAt: Date;
  scheduledDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
}

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/deliveries/history');
      if (!response.ok) throw new Error('Failed to fetch delivery history');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      toast.error('Error', {
        description: 'Failed to load delivery history'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    return status === OrderStatus.DELIVERED 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  // Get display label for status (Mongolian or English)
  const getStatusLabel = (status: OrderStatus) => {
    return statusLabels[status] || status.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Delivery History</h1>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <Button variant="outline" onClick={fetchDeliveryHistory} className="flex-1 sm:flex-none">
            Refresh
          </Button>
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/employee/delivery">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deliveries
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-8">Loading delivery history...</div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Package ID</TableHead>
                      <TableHead className="whitespace-nowrap">Address</TableHead>
                      <TableHead className="whitespace-nowrap">District</TableHead>
                      <TableHead className="whitespace-nowrap">Phone</TableHead>
                      <TableHead className="whitespace-nowrap">Fee</TableHead>
                      <TableHead className="whitespace-nowrap">Completed On</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No delivery history found
                        </TableCell>
                      </TableRow>
                    ) : (
                      deliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium whitespace-nowrap">{delivery.order.packageId || 'N/A'}</TableCell>
                          <TableCell className="max-w-[150px] sm:max-w-[200px] truncate">{delivery.address}</TableCell>
                          <TableCell className="whitespace-nowrap">{delivery.district}</TableCell>
                          <TableCell className="whitespace-nowrap">{delivery.order.phoneNumber || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{delivery.deliveryFee ? `${delivery.deliveryFee} ₮` : 'Not set'}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(delivery.completedAt || delivery.updatedAt)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={getStatusBadge(delivery.order.status)}>
                              <Check className="mr-1 h-3 w-3" />
                              {getStatusLabel(delivery.order.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden px-4">
                {deliveries.length === 0 ? (
                  <div className="text-center py-8">
                    No delivery history found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveries.map((delivery) => (
                      <div 
                        key={delivery.id} 
                        className="bg-white border rounded-lg shadow-sm p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-gray-500">Package ID</span>
                            <p className="font-medium">{delivery.order.packageId || 'N/A'}</p>
                          </div>
                          <Badge className={getStatusBadge(delivery.order.status)}>
                            <Check className="mr-1 h-3 w-3" />
                            {getStatusLabel(delivery.order.status)}
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500">Completed On</span>
                          <p className="text-sm">{formatDate(delivery.completedAt || delivery.updatedAt)}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500">Address</span>
                          <p className="text-sm">{delivery.address}</p>
                        </div>
                        
                        <div className="flex justify-between">
                          <div>
                            <span className="text-xs text-gray-500">District</span>
                            <p className="text-sm">{delivery.district}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">Phone</span>
                            <p className="text-sm">{delivery.order.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500">Delivery Fee</span>
                          <p className="font-medium">{delivery.deliveryFee ? `${delivery.deliveryFee} ₮` : 'Not set'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 