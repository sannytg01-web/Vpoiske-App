import axios from 'axios';


const getBaseUrl = () => {
    // Check if we're on localhost
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:8000';
    }
    // If not on localhost, use the production/tunnel URL
    return 'https://vlubvi-api.loca.lt';
};

export const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true' // localtunnel bypass
    }
});

apiClient.interceptors.request.use(
  (config) => {
    // We would normally get the access token from the auth store, assuming we save it.
    // or through the zustand store directly if added.
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the 401 is due to an expired token, we might try to refresh.
    // Omitting complex rotation logic here for brevity, but returning standard error.
    if (error.response?.status === 401) {
       console.log("Token potentially expired or invalid.");
       // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
