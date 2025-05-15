"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { Package, Filter, X, Phone, Calendar, AlertCircle } from "lucide-react";

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

// Mongolian translation mapping
const statusLabels: Record<string, string> = {
  "DELIVERED": "Хүргэгдсэн",
  "IN_TRANSIT": "Тээвэрлэж байгаа",
  "CANCELLED": "Цуцлагдсан",
  "IN_WAREHOUSE": "Агуулахад байгаа", 
  "IN_UB": "Улаанбаатарт байгаа",
  "OUT_FOR_DELIVERY": "Хүргэж байгаа",
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
        setError("Захиалгыг ачаалж чадсангүй. Дахин оролдоно уу.");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, phoneFromUrl, isLoading]);

  const clearFilters = () => {
    setStatusFilter("");
    
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
      setError("Захиалгаа харахын тулд нэвтэрсэн байх шаардлагатай");
      return;
    }
    
    try {
      setIsLoadingOrders(true);
      setError(null);
      
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
      setError("Таны захиалгыг ачаалж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Apply status filter
  useEffect(() => {
    let result = orders;
    
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter]);

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
        <h1 className="text-3xl font-bold text-gray-800">Миний захиалгууд</h1>
        <p className="text-gray-600 mt-2">
          {isUserPhoneFiltered ? 
            `Утасны дугаар: ${user?.phoneNumber}` : 
            "Өмнөх бүх захиалгаа харах, хянах"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 md:p-6 bg-gray-50 border-b">
          <h2 className="font-medium mb-2">Захиалга шүүх</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Status filter */}
            <div className="flex-grow max-w-xs">
              <label htmlFor="status-filter" className="block text-sm text-gray-500 mb-1">
                Төлөв
              </label>
              <select
                id="status-filter"
                className="w-full block border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary focus:border-primary text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Бүх төлөв</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status] || status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            {statusFilter && (
              <button 
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-[23px]"
              >
                <X className="h-4 w-4 mr-1" />
                Шүүлтүүр арилгах
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Захиалга олдсонгүй</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAuthenticated ? 
                `Утасны дугаар: ${user?.phoneNumber || 'таны бүртгэл'} дээр захиалга алга байна` : 
                "Шүүлтүүр өөрчлөөд дахин харна уу"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop view - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Захиалгын ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Огноо
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Утас
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Төлөв
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
                          {statusLabels[order.status] || order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                    <div className="font-medium text-primary truncate">{order.orderId}</div>
                    <span 
                      className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                    >
                      {statusLabels[order.status] || order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center border-b">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="px-4 py-3 flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{order.phoneNumber || "N/A"}</span>
                  </div>
                  {order.isDamaged && (
                    <div className="px-4 py-3 border-t bg-red-50 flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">
                        {order.damageDescription || "Бараа гэмтэлтэй байна"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order History Details Section - Show when a specific order is selected */}
      {filteredOrders.length === 1 && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Захиалгын Дэлгэрэнгүй</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium">Үндсэн мэдээлэл</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Захиалгын ID</p>
                  <p className="font-medium text-primary">{filteredOrders[0].orderId}</p>
                </div>
                {filteredOrders[0].packageId && (
                  <div>
                    <p className="text-sm text-gray-500">Багцийн ID</p>
                    <p className="font-medium">{filteredOrders[0].packageId}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Утасны дугаар</p>
                    <div className="font-medium flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-1" />
                      {filteredOrders[0].phoneNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Үүсгэсэн огноо</p>
                    <div className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {formatDate(filteredOrders[0].createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                  <div>
                    <p className="text-sm text-gray-500">Төлөв</p>
                    <p className="font-medium">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${filteredOrders[0].status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          filteredOrders[0].status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' : 
                            filteredOrders[0].status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                      >
                        {statusLabels[filteredOrders[0].status] || filteredOrders[0].status.replace(/_/g, ' ')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Тээвэрлэлтийн төлөв</p>
                    <p className="font-medium">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${filteredOrders[0].isShipped ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {filteredOrders[0].isShipped ? "Илгээгдсэн" : "Илгээгдээгүй"}
                      </span>
                    </p>
                  </div>
                </div>
                {filteredOrders[0].isDamaged && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Гэмтлийн тайлбар</p>
                    <div className="mt-1 p-2 bg-red-50 rounded-md border border-red-200">
                      <p className="text-sm text-red-700 flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        {filteredOrders[0].damageDescription || "Бараа гэмтэлтэй байна"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status History Timeline */}
          {filteredOrders[0].statusHistory && filteredOrders[0].statusHistory.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium">Захиалгын Төлөвийн Түүх</h3>
              </div>
              <div className="p-4">
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
                            {statusLabels[statusItem.status] || statusItem.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(statusItem.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
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