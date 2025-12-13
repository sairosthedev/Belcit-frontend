const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://belcit-backend.onrender.com').replace(/\/$/, '');

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// IMPORTANT: Always use the /api/ prefix in your path, e.g. apiFetch("/api/products")
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure path starts with / and API_BASE doesn't end with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API_BASE}${normalizedPath}`;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A';
  const isSunmi = typeof navigator !== 'undefined' && /sunmi/i.test(userAgent);
  
  console.log('API Request:', fullUrl);
  console.log('User Agent:', userAgent);
  console.log('Is Sunmi Device:', isSunmi);
  
  // Sunmi-specific: Add extra headers if needed
  if (isSunmi) {
    console.warn('Sunmi device detected - using enhanced error handling');
  }
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    // Sunmi-specific: Try with different fetch options if first attempt fails
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
      mode: 'cors', // Explicitly allow CORS
      credentials: 'omit', // Don't send cookies for cross-origin requests
      cache: 'no-cache', // Sunmi browsers sometimes cache incorrectly
    };
    
    console.log('Fetch options:', { 
      url: fullUrl, 
      mode: fetchOptions.mode, 
      hasSignal: !!fetchOptions.signal,
      isSunmi 
    });
    
    const res = await fetch(fullUrl, fetchOptions);
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      const error = new Error(errorData.message || errorText);
      // Attach the full error data to the error object
      Object.assign(error, errorData);
      throw error;
    }
    return res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('API Request Timeout:', fullUrl);
      throw new Error('Request timeout - Please check your internet connection');
    }
    // Log network errors for debugging
    if (error.message && error.message.includes('Failed to fetch')) {
      console.error('Network Error - Failed to fetch:', fullUrl);
      console.error('This might be a CORS issue or network connectivity problem');
      throw new Error('Network error - Unable to connect to server. Please check your internet connection.');
    }
    console.error('API Error:', error);
    throw error;
  }
} 