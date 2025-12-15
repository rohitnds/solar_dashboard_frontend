import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchCsrfToken() {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/csrf-token`); // Adjust to your backend
    const token = response.data.csrfToken || response.data._csrf || null;

    if (!token) throw new Error('CSRF token missing from response');

    return token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}
