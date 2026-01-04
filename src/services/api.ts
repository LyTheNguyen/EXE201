const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const authAPI = {
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.',
      };
    }
  },

  signIn: async (data: SignInData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.',
      };
    }
  },
};

export const upgradeAPI = {
  requestUpgrade: async () => {
    try {
      const response = await fetch(`${API_URL}/upgrade/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },

  getStatus: async () => {
    try {
      const response = await fetch(`${API_URL}/upgrade/status`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },
};

export const adminAPI = {
  getUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },

  getUpgradeRequests: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/upgrade-requests`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },

  grantMapAccess: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/grant-map-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },

  revokeMapAccess: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/revoke-map-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return {
          success: false,
          message: errorData.message || `Server error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến server.',
      };
    }
  },
};

