"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
}

interface OrderSummary {
  total: number;
  byStatus: Record<string, number>;
}

export default function OrdersDebugPage() {
  const { isAuthenticated, isLoading } = useUserAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingOrders, setCreatingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/debug/orders');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUser(data.user);
        setOrderSummary(data.orderSummary);
        setOrders(data.orders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const createTestOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      setCreatingOrders(true);
      const response = await fetch('/api/debug/create-test-orders', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      toast.success(`Created ${data.count} test orders`);
      
      // Refresh the orders list
      window.location.reload();
    } catch (err) {
      console.error('Error creating test orders:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create test orders');
    } finally {
      setCreatingOrders(false);
    }
  };

  if (isLoading || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Debug Information</h1>
        <Link href="/profile" className="px-4 py-2 bg-primary text-white rounded-md">
          Back to Profile
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phoneNumber || 'None'}</p>
          </div>
        ) : (
          <p>No user information available</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {orderSummary ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <p className="text-3xl font-bold">{orderSummary.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              
              {Object.entries(orderSummary.byStatus).map(([status, count]) => (
                <div key={status} className="bg-gray-100 p-4 rounded-md text-center">
                  <p className="text-3xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600">{status.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No order summary available</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.orderId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.packageId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                        order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No orders available</p>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Raw Order Data</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
          {JSON.stringify(orders, null, 2)}
        </pre>
      </div>

      <Button onClick={createTestOrders} disabled={creatingOrders}>
        {creatingOrders ? 'Creating...' : 'Create Test Orders'}
      </Button>
    </div>
  );
} 