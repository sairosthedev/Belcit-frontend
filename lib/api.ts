const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://belcit-backend.onrender.com';

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
  
  const fullUrl = `${API_BASE}${path}`;
  console.log('API Fetch:', fullUrl, 'Headers:', headers);
  
  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });
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
      throw new Error('Request timeout - server may be unavailable');
    }
    throw error;
  }
} 