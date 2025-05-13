"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { Package, Search, Filter, X, Phone, Calendar, AlertCircle } from "lucide-react";

interface OrderStatus {
  id: string;
  orderId: string;
  status: string;
  timestamp: string;
}

interface Order {
  id: string;
  orderId: string;
  packageId?: string;
  trackingNumber?: string;
  status: string;
  phoneNumber?: string;
  createdAt: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string;
  statusHistory: OrderStatus[];
  totalPrice?: number;
  items?: string[];
}

// Helper to make fetch calls without the custom override
const fetchWithoutOverride = async (url: string, options = {}) => {
  // Store the original fetch if it exists
  const originalFetch = (window as any).originalFetch || window.fetch;
  
  try {
    // Use the original fetch function
    return await originalFetch(url, options);
  } catch (error) {
    console.error("Error in fetchWithoutOverride:", error);
    throw error;
  }
};

function OrdersContent() {
  const { user, isAuthenticated, isLoading } = useUserAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams.get('phone');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneFilter, setPhoneFilter] = useState(phoneFromUrl || "");
  const [statusFilter, setStatusFilter] = useState("");
  const [isUserPhoneFiltered, setIsUserPhoneFiltered] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch orders from API based on phone number
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoading && !isAuthenticated) return;
      
      try {
        setIsLoadingOrders(true);
        setError(null);
        
        console.log("User auth state:", { 
          isAuthenticated, 
          userPhone: user?.phoneNumber,
          phoneFromUrl
        });
        
        // If we have a phone param in URL, use that first
        if (phoneFromUrl) {
          console.log("Fetching orders with phone from URL:", phoneFromUrl);
          
          // Use direct fetch without overrides to avoid loops
          const response = await fetchWithoutOverride(`/api/orders/phone/${phoneFromUrl}`);
          
          if (response.status === 404) {
            console.log("No orders found for phone from URL");
            setOrders([]);
            setFilteredOrders([]);
            setIsLoadingOrders(false);
            return;
          }
          
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Orders data from URL phone:", data);
          const ordersData = Array.isArray(data) ? data : [data];
          
          // Ensure orders are strictly for this phone number
          const phoneFilteredOrders = ordersData.filter(order => 
            order.phoneNumber === phoneFromUrl
          );
          
          console.log("Filtered orders for URL phone:", phoneFilteredOrders.length);
          setOrders(phoneFilteredOrders);
          setFilteredOrders(phoneFilteredOrders);
          setIsUserPhoneFiltered(true);
          return;
        }
        
        // Otherwise, if user is authenticated, fetch their orders directly
        if (isAuthenticated && user?.phoneNumber) {
          console.log("Fetching orders for current authenticated user's phone:", user.phoneNumber);
          setIsUserPhoneFiltered(true);
          
          // Use direct fetch without overrides
          const response = await fetchWithoutOverride(`/api/orders/phone/${user.phoneNumber}`);
          
          if (response.status === 404) {
            console.log("No orders found for user's phone");
            setOrders([]);
            setFilteredOrders([]);
            setIsLoadingOrders(false);
            return;
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch orders: ${response.status}`, errorText);
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Orders data for current user:", data);
          const ordersData = Array.isArray(data) ? data : [data];
          
          setOrders(ordersData);
          setFilteredOrders(ordersData);
        } else {
          // If not authenticated or no phone, they shouldn't see any orders
          console.log("User not authenticated or has no phone, not showing any orders");
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, phoneFromUrl, isLoading]);

  // Filter by custom phone number
  const handlePhoneFilter = async () => {
    if (!phoneFilter.trim()) {
      // Reset to user's orders if authenticated
      if (isAuthenticated && user?.phoneNumber) {
        try {
          setIsLoadingOrders(true);
          setError(null);
          
          // Use direct fetch without overrides
          const response = await fetchWithoutOverride(`/api/orders/phone/${user.phoneNumber}`);
          
          if (response.status === 404) {
            setFilteredOrders([]);
            setIsLoadingOrders(false);
            return;
          }
          
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
          
          const data = await response.json();
          const ordersData = Array.isArray(data) ? data : [data];
          
          setFilteredOrders(ordersData);
        } catch (err) {
          console.error("Error fetching user orders:", err);
          setError("Failed to filter orders. Please try again.");
        } finally {
          setIsLoadingOrders(false);
        }
      } else {
        // If not authenticated, they should see no orders
        setFilteredOrders([]);
      }
      return;
    }
    
    try {
      setIsLoadingOrders(true);
      setError(null);
      
      // Use direct fetch without overrides
      const response = await fetchWithoutOverride(`/api/orders/phone/${phoneFilter}`);
      
      if (response.status === 404) {
        // Not an error, just no orders for this phone
        setFilteredOrders([]);
        setIsLoadingOrders(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders by phone: ${response.status}`);
      }
      
      const data = await response.json();
      const ordersData = Array.isArray(data) ? data : [data];
      
      // Only show orders that exactly match the searched phone number
      const strictPhoneFilteredOrders = ordersData.filter(order => 
        order.phoneNumber === phoneFilter
      );
      
      setFilteredOrders(strictPhoneFilteredOrders);
    } catch (err) {
      console.error("Error fetching orders by phone:", err);
      setError("Failed to filter orders. Please try again.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Apply search and status filters
  useEffect(() => {
    // Skip if we're already filtering by custom phone number
    if (phoneFilter.trim()) return;
    
    let result = orders;
    
    if (searchTerm) {
      result = result.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.packageId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, phoneFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPhoneFilter("");
    
    // Reset to user's orders if authenticated
    if (isAuthenticated) {
      handleUserOrdersReset();
    } else {
      // Regular users should see no orders
      setFilteredOrders([]);
    }
  };

  // Reset to user's own orders
  const handleUserOrdersReset = async () => {
    if (!isAuthenticated || !user?.phoneNumber) {
      setError("You must be signed in to view your orders");
      return;
    }
    
    try {
      setIsLoadingOrders(true);
      setError(null);
      setPhoneFilter("");
      
      // Use direct fetch without overrides
      const response = await fetchWithoutOverride(`/api/orders/phone/${user.phoneNumber}`);
      
      if (response.status === 404) {
        setOrders([]);
        setFilteredOrders([]);
        setIsLoadingOrders(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data = await response.json();
      const ordersData = Array.isArray(data) ? data : [data];
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setIsUserPhoneFiltered(true);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Get all unique statuses
  const uniqueStatuses = Array.from(new Set(orders.map(order => order.status)));

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading || isLoadingOrders) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600 mt-2">
          {isUserPhoneFiltered ? 
            `Viewing orders for phone number: ${user?.phoneNumber}` : 
            "View and track all your previous orders"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col space-y-4 mb-6">
          {/* Search by tracking/order ID */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Search by order ID or package ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!!phoneFilter}
            />
          </div>

          {/* Phone number filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder={user?.phoneNumber ? `Search different phone number...` : `Filter by phone number...`}
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handlePhoneFilter}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              disabled={!phoneFilter.trim() && !isAuthenticated}
            >
              Search
            </button>
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            <select
              className="block border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={!!phoneFilter}
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status ? status.replace(/_/g, ' ') : ''}
                </option>
              ))}
            </select>
            
            {(searchTerm || statusFilter || phoneFilter) && (
              <button 
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAuthenticated ? 
                `No orders found for phone number: ${phoneFilter || (user?.phoneNumber || 'your account')}` : 
                "Try changing your search or filter criteria"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.phoneNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                            order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}
                      >
                        {order.status ? order.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History Details Section - Show when a specific order is selected */}
      {filteredOrders.length === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{filteredOrders[0].orderId}</p>
            </div>
            {filteredOrders[0].packageId && (
              <div>
                <p className="text-sm text-gray-500">Package ID</p>
                <p className="font-medium">{filteredOrders[0].packageId}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{filteredOrders[0].phoneNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{formatDate(filteredOrders[0].createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{filteredOrders[0].status ? filteredOrders[0].status.replace(/_/g, ' ') : 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Shipping Status</p>
              <p className="font-medium">{filteredOrders[0].isShipped ? "Shipped" : "Not Shipped"}</p>
            </div>
            {filteredOrders[0].isDamaged && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Damage Description</p>
                <p className="font-medium text-red-600">{filteredOrders[0].damageDescription || "Item is damaged"}</p>
              </div>
            )}
          </div>
          
          {/* Status History Timeline */}
          {filteredOrders[0].statusHistory && filteredOrders[0].statusHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Order Status History</h3>
              <div className="space-y-4">
                {filteredOrders[0].statusHistory
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((statusItem, index) => (
                    <div key={statusItem.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className={`rounded-full h-4 w-4 ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                        {index !== filteredOrders[0].statusHistory.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-300 my-1" />
                        )}
                      </div>
                      <div className="flex flex-col pb-4">
                        <span className="text-sm font-medium text-gray-900">
                          {statusItem.status ? statusItem.status.replace(/_/g, ' ') : 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(statusItem.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
} 