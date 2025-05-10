'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@prisma/client';
import { Check, Truck, AlertCircle, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

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
  deliveryPrice?: number;
  approvedByAdmin: boolean;
  deliveryPersonId?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Error', {
        description: 'Failed to load deliveries'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setSelectedStatus(delivery.order.status);
    setStatusNote('');
    setIsUpdateDialogOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedDelivery || !selectedStatus) return;

    try {
      const response = await fetch(`/api/employee/deliveries/${selectedDelivery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: selectedStatus,
          note: statusNote 
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchDeliveries();
      setIsUpdateDialogOpen(false);
      
      toast.success('Status Updated', {
        description: `Delivery status updated to ${selectedStatus}`
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Error', {
        description: 'Failed to update delivery status'
      });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.IN_WAREHOUSE:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.IN_UB:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatusOptions = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case OrderStatus.IN_UB:
      case OrderStatus.OUT_FOR_DELIVERY:
        return [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED];
      case OrderStatus.DELIVERED:
        return [OrderStatus.DELIVERED]; // Can't change from delivered
      default:
        return [currentStatus];
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Available Deliveries</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchDeliveries}>
            Refresh
          </Button>
          <Button asChild variant="outline">
            <Link href="/employee/deliveries/history">
              View History
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading deliveries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No deliveries available at this time
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.order.packageId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(delivery.order.status)}>
                          {delivery.order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.address}</TableCell>
                      <TableCell>{delivery.district}</TableCell>
                      <TableCell>{delivery.order.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>{delivery.deliveryPrice ? `${delivery.deliveryPrice} ₮` : 'Not set'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(delivery)}>
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Change the status of delivery to track progress
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-status">Current Status</Label>
              <div className="py-2">
                {selectedDelivery && (
                  <Badge className={getStatusBadge(selectedDelivery.order.status)}>
                    {selectedDelivery.order.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDelivery && getNextStatusOptions(selectedDelivery.order.status).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add any details about this status change"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitStatusUpdate}
              disabled={!selectedStatus || selectedStatus === selectedDelivery?.order.status}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 