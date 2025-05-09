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
const statusLabels = {
  [OrderStatus.OUT_FOR_DELIVERY]: "Хүргэж байгаа",
  [OrderStatus.DELIVERED]: "Хүргэгдсэн",
  [OrderStatus.CANCELLED]: "Цуцлагдсан",
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchDeliveryHistory}>
            Refresh
          </Button>
          <Button asChild variant="outline">
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
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading delivery history...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package ID</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell>{delivery.order.packageId || 'N/A'}</TableCell>
                      <TableCell>{delivery.address}</TableCell>
                      <TableCell>{delivery.district}</TableCell>
                      <TableCell>{delivery.order.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>{delivery.deliveryFee ? `${delivery.deliveryFee} ₮` : 'Not set'}</TableCell>
                      <TableCell>{formatDate(delivery.completedAt || delivery.updatedAt)}</TableCell>
                      <TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 