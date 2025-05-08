'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderSize } from '@prisma/client';
import { Check, Truck, AlertCircle } from 'lucide-react';
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

interface Order {
  id: string;
  packageId: string;
  phoneNumber?: string;
  size: OrderSize;
  status: OrderStatus;
  createdAt: Date;
  note?: string;
  deliveryCost?: number;
  deliveryAddress?: string;
  isPaid: boolean;
}

export default function DeliveryList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch only active deliveries - not delivered or cancelled
      const response = await fetch('/api/orders/active');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error', {
        description: 'Failed to load delivery list'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setStatusNote('');
    setIsUpdateDialogOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
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
      
      await fetchOrders();
      setIsUpdateDialogOpen(false);
      
      toast.success('Status Updated', {
        description: `Order ${selectedOrder.packageId} status updated to ${selectedStatus}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error', {
        description: 'Failed to update order status'
      });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      CUSTOMS_HOLD: 'bg-orange-100 text-orange-800',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatusOptions = (currentStatus: OrderStatus) => {
    // Define the allowed status transitions based on the current status
    const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['OUT_FOR_DELIVERY', 'CUSTOMS_HOLD', 'CANCELLED'],
      CUSTOMS_HOLD: ['IN_TRANSIT', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['DELIVERED'], // Can't change from delivered
      CANCELLED: ['CANCELLED'], // Can't change from cancelled
    };
    
    return statusTransitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery List</h1>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
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
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No active deliveries found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.packageId}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.deliveryAddress || 'Not specified'}</TableCell>
                      <TableCell>{order.size}</TableCell>
                      <TableCell>{order.phoneNumber || 'N/A'}</TableCell>
                      <TableCell>{order.isPaid ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order)}>
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
              Change the status of package {selectedOrder?.packageId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-status">Current Status</Label>
              <div className="py-2">
                {selectedOrder && (
                  <Badge className={getStatusBadge(selectedOrder.status)}>
                    {selectedOrder.status.replace('_', ' ')}
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
                  {selectedOrder && getNextStatusOptions(selectedOrder.status).map((status) => (
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
              disabled={!selectedStatus || selectedStatus === selectedOrder?.status}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 