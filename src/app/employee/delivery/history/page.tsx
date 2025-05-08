'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderSize } from '@prisma/client';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  statusHistory?: StatusHistory[];
}

interface StatusHistory {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  employee?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export default function DeliveryHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      // Fetch only completed deliveries - delivered or cancelled
      const response = await fetch('/api/orders/completed');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      toast.error('Error', {
        description: 'Failed to load delivery history'
      });
    } finally {
      setLoading(false);
    }
  };

  const showOrderDetails = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}/history`);
      if (!response.ok) throw new Error('Failed to fetch order history');
      const data = await response.json();
      setSelectedOrder({
        ...order,
        statusHistory: data
      });
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Error', {
        description: 'Failed to load order details'
      });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      IN_WAREHOUSE: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      IN_UB: 'bg-orange-100 text-orange-800',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <Button variant="outline" onClick={fetchCompletedOrders}>
          Refresh
        </Button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No completed deliveries found
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
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => showOrderDetails(order)}>
                          <Info className="h-4 w-4 mr-2" />
                          Details
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
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Package ID: {selectedOrder?.packageId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <Badge className={selectedOrder?.status ? getStatusBadge(selectedOrder.status) : ''}>
                  {selectedOrder?.status?.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Size</h4>
                <p>{selectedOrder?.size}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Delivery Address</h4>
              <p>{selectedOrder?.deliveryAddress || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Contact</h4>
              <p>{selectedOrder?.phoneNumber || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Payment Status</h4>
              <p>{selectedOrder?.isPaid ? 'Paid' : 'Not paid'}</p>
            </div>
            
            {selectedOrder?.note && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p>{selectedOrder.note}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-1">Status History</h4>
              {selectedOrder?.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Updated By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.statusHistory.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>
                            <Badge className={getStatusBadge(history.status)}>
                              {history.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(history.timestamp)}</TableCell>
                          <TableCell>
                            {history.employee ? history.employee.name : 'System'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No status history found</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 