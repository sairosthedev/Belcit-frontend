"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestConnectionPage() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://belcit-backend.onrender.com').replace(/\/$/, '');
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setConsoleLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  };

  const testConnection = async (endpoint: string, name: string) => {
    const testUrl = `${API_BASE}${endpoint}`;
    addLog(`Starting test: ${name} → ${testUrl}`);
    
    setTesting(true);
    const startTime = Date.now();
    
    // Update UI immediately
    setResults(prev => ({
      ...prev,
      [name]: {
        status: 'testing',
        message: 'Testing connection...',
      }
    }));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        addLog(`Timeout for ${name} after 10 seconds`);
        controller.abort();
      }, 10000);
      
      addLog(`Making fetch request to: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((fetchError) => {
        addLog(`Fetch error for ${name}: ${fetchError.message || fetchError.toString()}`);
        throw fetchError;
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      addLog(`Response for ${name}: ${response.status} ${response.statusText} (${duration}ms)`);
      
      let responseText = '';
      try {
        responseText = await response.text();
        addLog(`Response body preview: ${responseText.substring(0, 100)}`);
      } catch (e: any) {
        addLog(`Error reading response: ${e.message}`);
      }
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          message: response.ok 
            ? `Connected successfully (${response.status})` 
            : `Error: ${response.status} ${response.statusText}`,
          responsePreview: responseText.substring(0, 100),
        }
      }));
      
      addLog(`${name} test completed: ${response.ok ? 'SUCCESS' : 'FAILED'}`);
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      addLog(`Error testing ${name}: ${error.name} - ${error.message}`);
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          duration: `${duration}ms`,
          message: error.name === 'AbortError' 
            ? 'Request timeout (10 seconds) - Backend not responding'
            : error.message?.includes('Failed to fetch')
            ? 'Failed to fetch - Check internet connection and CORS settings'
            : error.message?.includes('NetworkError')
            ? 'Network error - Check internet connection'
            : `Error: ${error.message || error.toString()}`,
          errorName: error.name,
          errorStack: error.stack?.substring(0, 200),
        }
      }));
      
      addLog(`${name} test failed`);
    } finally {
      setTesting(false);
    }
  };

  const testAll = async () => {
    addLog('=== Starting all connection tests ===');
    setResults({});
    setConsoleLogs([]);
    setTesting(true);
    
    try {
      // Test basic connectivity first
      await testConnection('', 'Backend Root');
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then test specific endpoints
      await testConnection('/api/health', 'Health Check');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testConnection('/api/auth/me', 'Auth Endpoint');
    } finally {
      setTesting(false);
      addLog('=== All tests completed ===');
    }
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
                    : result.status === 'testing'
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.status === 'success'
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : result.status === 'testing'
                      ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                      : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {result.status === 'success' ? '✓ Success' : result.status === 'testing' ? '⏳ Testing...' : '✗ Failed'}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {result.message}
                </p>
                {result.statusCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: {result.statusCode} {result.statusText || ''} | Duration: {result.duration}
                  </p>
                )}
                {!result.statusCode && result.duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {result.duration}
                  </p>
                )}
                {result.errorName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Error Type: {result.errorName}
                  </p>
                )}
                {result.responsePreview && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Response: {result.responsePreview}...
                  </p>
                )}
              </div>
            ))}
          </div>

          {Object.keys(results).length === 0 && !testing && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Click "Test All Connections" to diagnose network issues
            </p>
          )}

          {/* Console Logs */}
          {consoleLogs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Debug Logs:</h3>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs font-mono">
                  {consoleLogs.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

