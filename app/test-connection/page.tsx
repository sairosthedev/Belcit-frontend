"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestConnectionPage() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://belcit-backend.onrender.com';

  const testConnection = async (endpoint: string, name: string) => {
    setTesting(true);
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          duration: `${duration}ms`,
          message: response.ok ? 'Connected successfully' : `Error: ${response.status} ${response.statusText}`,
        }
      }));
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          duration: `${duration}ms`,
          message: error.name === 'AbortError' 
            ? 'Request timeout (10 seconds)' 
            : `Error: ${error.message}`,
        }
      }));
    } finally {
      setTesting(false);
    }
  };

  const testAll = async () => {
    setResults({});
    await testConnection('/api/health', 'Health Check');
    await testConnection('/api/auth/me', 'Auth Endpoint');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Network Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Backend URL: <code className="bg-muted px-2 py-1 rounded">{API_BASE}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              User Agent: <code className="bg-muted px-2 py-1 rounded text-xs">{typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</code>
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={testAll} disabled={testing}>
              {testing ? 'Testing...' : 'Test All Connections'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testConnection('/api/health', 'Health Check')}
              disabled={testing}
            >
              Test Health
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testConnection('/api/auth/me', 'Auth Endpoint')}
              disabled={testing}
            >
              Test Auth
            </Button>
          </div>

          <div className="space-y-2">
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <div
                key={name}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.status === 'success'
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {result.status === 'success' ? '✓ Success' : '✗ Failed'}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {result.message}
                </p>
                {result.statusCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: {result.statusCode} | Duration: {result.duration}
                  </p>
                )}
                {!result.statusCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {result.duration}
                  </p>
                )}
              </div>
            ))}
          </div>

          {Object.keys(results).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Click "Test All Connections" to diagnose network issues
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

