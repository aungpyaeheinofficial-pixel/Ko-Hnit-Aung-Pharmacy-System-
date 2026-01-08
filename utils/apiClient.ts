export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Debug: Log API base URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', BASE_URL);
  console.log('🔗 VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL || 'not set (using default /api)');
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper function to extract error message from response
const getErrorMessage = async (res: Response): Promise<string> => {
  try {
    // Clone the response to avoid "body stream already read" error
    const clonedRes = res.clone();
    const contentType = res.headers.get('content-type');
    
    // Try to parse as JSON if content-type suggests it
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await clonedRes.json();
        return errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (jsonError) {
        // If JSON parsing fails, fall back to text
      }
    }
    
    // Try to get text response
    try {
      const errorText = await clonedRes.text();
      if (errorText && errorText.trim()) return errorText;
    } catch (textError) {
      // If text parsing also fails, use status text
    }
    
    // Return meaningful status text based on status code
    if (res.status === 401) {
      return 'Invalid email or password';
    } else if (res.status === 403) {
      return 'Access forbidden';
    } else if (res.status === 404) {
      return 'API endpoint not found. Please check backend configuration.';
    } else if (res.status === 500) {
      return 'Server error. Please try again later.';
    } else if (res.status === 503) {
      return 'Service unavailable. Please check database connection.';
    }
    
    return res.statusText || `Request failed with status ${res.status}`;
  } catch (error) {
    return `Failed to read error message: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

// Helper to handle fetch errors (network, CORS, etc.)
const handleFetchError = (error: unknown, endpoint: string): Error => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new Error(
        `Cannot connect to backend API. Please check:\n` +
        `1. Backend server is running\n` +
        `2. API URL is correct (currently: ${BASE_URL})\n` +
        `3. CORS is configured properly\n` +
        `4. Network connectivity`
      );
    }
    if (error.message.includes('CORS')) {
      return new Error('CORS error: Backend server is not allowing requests from this origin.');
    }
  }
  return error instanceof Error ? error : new Error(`Network error: ${String(error)}`);
};

export const api = {
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorMessage = await getErrorMessage(res);
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (error) {
      throw handleFetchError(error, endpoint);
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorMessage = await getErrorMessage(res);
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (error) {
      throw handleFetchError(error, endpoint);
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorMessage = await getErrorMessage(res);
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (error) {
      throw handleFetchError(error, endpoint);
    }
  },

  patch: async (endpoint: string, data: any) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorMessage = await getErrorMessage(res);
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (error) {
      throw handleFetchError(error, endpoint);
    }
  },

  delete: async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorMessage = await getErrorMessage(res);
        throw new Error(errorMessage);
      }
      // Check if response has content before trying to parse
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return res.json();
      }
      return null; // Some DELETEs might return 204 No Content
    } catch (error) {
      throw handleFetchError(error, endpoint);
    }
  },
};
