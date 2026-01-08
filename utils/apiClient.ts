export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper function to extract error message from response
const getErrorMessage = async (res: Response): Promise<string> => {
  // Clone the response to avoid "body stream already read" error
  const clonedRes = res.clone();
  const contentType = res.headers.get('content-type');
  
  // Try to parse as JSON if content-type suggests it
  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await clonedRes.json();
      return errorData.message || errorData.error || JSON.stringify(errorData);
    } catch {
      // If JSON parsing fails, fall back to text
    }
  }
  
  // Try to get text response
  try {
    const errorText = await clonedRes.text();
    if (errorText) return errorText;
  } catch {
    // If text parsing also fails, use status text
  }
  
  return res.statusText || 'Unknown error';
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const errorMessage = await getErrorMessage(res);
      throw new Error(errorMessage);
    }
    return res.json();
  },

  post: async (endpoint: string, data: any) => {
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
  },

  put: async (endpoint: string, data: any) => {
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
  },

  patch: async (endpoint: string, data: any) => {
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
  },

  delete: async (endpoint: string) => {
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
  },
};
