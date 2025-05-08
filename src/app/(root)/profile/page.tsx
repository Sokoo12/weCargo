"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, ChevronRight, Package, Mail, Save, X, Box, Truck, CheckCircle } from 'lucide-react';
import useAuthProtection from '@/hooks/useAuthProtection';
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    image?: string;
  };
  orderStats: OrderStats;
}

export default function Profile() {
  // Add a simple console log to show the page is loading
  console.log("Profile page rendering");
  
  // Log window origin for debugging port issues
  if (typeof window !== 'undefined') {
    console.log("Current origin:", window.location.origin);
  }
  
  const { user, isAuthenticated, isLoading, isReady, updateUser } = useAuthProtection();
  const router = useRouter();
  console.log("Auth state:", { isAuthenticated, isLoading, isReady, hasUser: !!user });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: ""
  });
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    console.log("Profile page - User data:", { 
      hasUser: !!user,
      isReady
    });
  
    if (isReady && user) {
      console.log("Setting form data from user");
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || ""
      });
      
      // Fetch user profile data from API
      fetchProfileData();
    }
  }, [user, isReady]);

  // Test API health check
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/health`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("API health check:", data);
        } else {
          console.error("API health check failed:", response.status);
        }
      } catch (error) {
        console.error("Error checking API health:", error);
      }
    };
    
    const checkAuthDebug = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/debug/auth`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Auth debug check:", data);
        } else {
          console.error("Auth debug check failed:", response.status);
        }
      } catch (error) {
        console.error("Error checking auth debug:", error);
      }
    };
    
    checkApiHealth();
    checkAuthDebug();
  }, []);

  // Fetch profile data from API
  const fetchProfileData = async (retryCount = 0) => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem("userToken");
      
      // Use window.location.origin to get the current base URL including port
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        } : {},
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle invalid user ID format specifically - likely a test user
        if (response.status === 400 && errorData.error && errorData.error.includes('Invalid user ID format')) {
          setProfileError('Your authentication token contains an invalid user ID. Please log out and sign in again with a valid account.');
          return;
        }
        
        // If there's an auth error, we'll just use the user from context
        if (response.status === 401) {
          console.log("Unauthorized, using context user data");
          return;
        }
        
        throw new Error(errorData.error || `Failed to fetch profile data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched profile data:", data);
      
      setProfileData(data);
      
      // Update form data with the latest user info from the database
      if (data.user) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || ""
        });
      }
      
      // Update order stats
      if (data.orderStats) {
        setOrderStats(data.orderStats);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      
      // Try again if it's a network error (up to 3 retries)
      if (retryCount < 3) {
        console.log(`Retrying profile fetch (${retryCount + 1}/3)...`);
        setTimeout(() => fetchProfileData(retryCount + 1), 1000);
        return;
      }
      
      setProfileError(error instanceof Error ? error.message : 'Failed to load your profile data. Please try again later.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!user?.phoneNumber) return;
      
      try {
        setIsLoadingProfile(true);
        
        if (user.phoneNumber) {
          // Use window.location.origin to get the current base URL including port
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const response = await fetch(`${baseUrl}/api/orders/phone/${encodeURIComponent(user.phoneNumber)}`);
          
          if (response.ok) {
            const data = await response.json();
            const orders = Array.isArray(data) ? data : [data];
            
            const totalOrders = orders.length;
            const pendingOrders = orders.filter(order => 
              order.status === 'IN_WAREHOUSE' || order.status === 'PENDING'
            ).length;
            const inTransitOrders = orders.filter(order => 
              order.status === 'IN_TRANSIT' || 
              order.status === 'IN_UB' || 
              order.status === 'OUT_FOR_DELIVERY'
            ).length;
            const deliveredOrders = orders.filter(order => 
              order.status === 'DELIVERED'
            ).length;
            
            setOrderStats({
              totalOrders,
              pendingOrders,
              inTransitOrders,
              deliveredOrders
            });
          }
        }
      } catch (err) {
        console.error("Error fetching order stats:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    // No need to fetch order stats separately if we're getting it in profile data
    // fetchOrderStats();
  }, [user, isReady]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate form data
      if (!formData.name || !formData.email) {
        setProfileError('Name and email are required');
        setIsSaving(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setProfileError('Please enter a valid email address');
        setIsSaving(false);
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem("userToken");
      
      // Use window.location.origin to get the current base URL including port
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Send the updated profile data to the API
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          } : {})
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      console.log('Profile updated:', data);
      
      // Update local user data
      if (data.user) {
        // Update context with latest user data
        if (user) {
          updateUser(data.user);
          
          // Refresh profile data to get updated order stats too
          fetchProfileData();
        }
      }
      
      setIsEditing(false);
      
      // Show success message
      setProfileError(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(error instanceof Error ? error.message : 'Failed to update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || ""
      });
    }
    setIsEditing(false);
  };

  // Add logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    
    // Redirect to sign in
    router.push('/sign-in');
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show a different loading state for profile data fetching
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Loading your profile information...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3">Fetching your latest data...</p>
        </div>
      </div>
    );
  }

  // Use data from profileData if available, otherwise fall back to user from context
  const userData = profileData?.user || user;

  // User data is null or undefined
  if (!userData) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">
            No user profile found. Please try signing in again.
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/sign-in">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              Go to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (profileError && profileError.includes('Invalid user ID format')) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invalid Authentication</h1>
          <p className="text-gray-600 mt-2">
            Your authentication token contains an invalid user ID.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{profileError}</p>
        </div>
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Log Out & Return to Sign-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">
          View and manage your account information
        </p>
      </div>

      {profileError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{profileError}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {userData.image ? (
              <img 
                src={userData.image} 
                alt={userData.name || "User"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">
              {userData.name || "User"}
            </h2>
            <p className="text-gray-500">{userData.email}</p>
            {userData.phoneNumber && (
              <p className="text-sm mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Phone size={14} className="text-gray-400" />
                <span>{userData.phoneNumber}</span>
              </p>
            )}
            {userData.createdAt && (
              <p className="text-xs text-gray-400 mt-2">
                Account created on {new Date(userData.createdAt || "").toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {userData.phoneNumber && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Your Order Summary</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{orderStats.totalOrders}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <Box className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold">{orderStats.pendingOrders}</p>
              <p className="text-xs text-gray-500">In Warehouse</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{orderStats.inTransitOrders}</p>
              <p className="text-xs text-gray-500">In Transit</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{orderStats.deliveredOrders}</p>
              <p className="text-xs text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className={`block w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-primary' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary ${!isEditing && 'bg-gray-50'}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`block w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-primary' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary ${!isEditing && 'bg-gray-50'}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  className={`block w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-primary' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary focus:border-primary ${!isEditing && 'bg-gray-50'}`}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your phone number"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This phone number will be used for order notifications and tracking
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-t-transparent border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 max-w-2xl">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          <Link href="/orders" className="flex items-center justify-between p-4 hover:bg-gray-50 transition duration-150">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">My Orders</h3>
                <p className="text-xs text-gray-500">View your order history and track packages</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          
          <Link 
            href={user?.phoneNumber ? `/orders?phone=${encodeURIComponent(user.phoneNumber)}` : "/orders"} 
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition duration-150"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">Track by Phone</h3>
                <p className="text-xs text-gray-500">Find orders using your phone number</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="h-16 md:h-0 w-full"></div>
    </div>
  );
} 