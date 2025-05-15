'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Database, Key, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';
import { getAuthHeaders, getAuthToken } from '@/utils/auth-helpers';

export default function DebugPage() {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    testDatabase();
    checkToken();
  }, []);

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/db-test');
      const data = await response.json();
      setDbInfo(data);
    } catch (error) {
      console.error('Database test error:', error);
      setDbInfo({ success: false, error: 'Failed to fetch database info' });
    } finally {
      setLoading(false);
    }
  };

  const checkToken = async () => {
    setTokenLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setTokenInfo({ success: false, error: 'No token found' });
        setTokenLoading(false);
        return;
      }

      const response = await fetch('/api/auth/token-debug', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setTokenInfo(data);
    } catch (error) {
      console.error('Token check error:', error);
      setTokenInfo({ success: false, error: 'Failed to check token' });
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Status
            </CardTitle>
            <CardDescription>
              Check database connection and user information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Testing database...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant={dbInfo?.success ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>
                    {dbInfo?.success ? 'Connected' : 'Connection Failed'}
                  </AlertTitle>
                  <AlertDescription>
                    {dbInfo?.success 
                      ? `Found ${dbInfo.diagnostics?.userCount || 0} users in database` 
                      : dbInfo?.error || 'Unknown error'}
                  </AlertDescription>
                </Alert>

                {dbInfo?.success && dbInfo.diagnostics?.users?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Sample Users:</h3>
                    <div className="space-y-2">
                      {dbInfo.diagnostics.users.map((user: any, index: number) => (
                        <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                          <p><strong>ID:</strong> {user.id}</p>
                          <p><strong>Name:</strong> {user.name}</p>
                          <p><strong>Has Email:</strong> {user.hasEmail ? 'Yes' : 'No'}</p>
                          <p><strong>Has Phone:</strong> {user.hasPhone ? 'Yes' : 'No'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button size="sm" onClick={testDatabase}>
                    Refresh Data
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Authentication Status
            </CardTitle>
            <CardDescription>
              Check current authentication token
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokenLoading ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Checking token...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant={tokenInfo?.success ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>
                    {tokenInfo?.success ? 'Token Valid' : 'Token Invalid'}
                  </AlertTitle>
                  <AlertDescription>
                    {tokenInfo?.success 
                      ? `Token is valid for user: ${tokenInfo.user?.name || 'Unknown'}` 
                      : tokenInfo?.error || 'Unknown error'}
                  </AlertDescription>
                </Alert>

                {tokenInfo?.success && tokenInfo.decodedToken && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Token Information:</h3>
                    <div className="text-xs p-2 bg-gray-50 rounded">
                      <p><strong>User ID:</strong> {tokenInfo.decodedToken.id}</p>
                      <p><strong>Name:</strong> {tokenInfo.decodedToken.name}</p>
                      <p><strong>Email:</strong> {tokenInfo.decodedToken.email}</p>
                      <p><strong>Role:</strong> {tokenInfo.decodedToken.role}</p>
                      <p><strong>Expires:</strong> {new Date(tokenInfo.decodedToken.exp * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={checkToken}>
                    Refresh Token
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      window.open('/api/auth/bypass-login', '_blank');
                    }}
                  >
                    Auto Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Return to profile */}
      <div className="mt-8 text-center">
        <Link href="/profile">
          <Button variant="ghost">
            <User className="h-4 w-4 mr-2" />
            <span>Return to Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 