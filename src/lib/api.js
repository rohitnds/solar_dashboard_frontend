import axios from 'axios';
axios.defaults.withCredentials = true;
import Cookies from "js-cookie";
import { fetchCsrfToken } from './csrf';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const APP_URL = import.meta.env.VITE_APP_BASE;

// Helper to generate headers
function buildHeaders({ isFormData = false, additionalHeaders = {} }) {
  return {
    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    ...additionalHeaders,
  };
}

// Error logger
function logError(method, endpoint, error) {
  console.error(`API ${method} Error:`, {
    endpoint,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });
}

// Format full URL
function buildUrl(endpoint) {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
}

// GET
export async function apiGet(endpoint, params = {}, additionalHeaders = {}, returnFullResponse = false) {
  try {
    const response = await axios.get(buildUrl(endpoint), {
      params,
      headers: buildHeaders({ additionalHeaders }),
    });
    return returnFullResponse ? response : response.data;
  } catch (error) {
    if (error.response.status === 401) {
      if (!window.location.href.includes(`${APP_URL}/login`)) {
        window.location.href = `${APP_URL}/login`;
        Cookies.remove("user_auth");
      }
    }
    logError('GET', endpoint, error);
    throw error;
  }
}

// POST
export async function apiPost(endpoint, body, isFormData = false, additionalHeaders = {}, returnFullResponse = false) {
  try {
    const token = await fetchCsrfToken();
    const response = await axios.post(
      buildUrl(endpoint),
      isFormData ? body : JSON.stringify(body),
      { headers: buildHeaders({ isFormData, additionalHeaders : {...additionalHeaders, 'X-CSRF-Token': token} }) }
    );
    return returnFullResponse ? response : response.data;
  } catch (error) {
    logError('POST', endpoint, error);
    if (error.response.status === 401) {
      if (!window.location.href.includes(`${APP_URL}/login`)) {
        window.location.href = `${APP_URL}/login`;
        Cookies.remove("user_auth");
      }
    }
    throw error;
  }
}

// PUT
export async function apiPut(endpoint, body, additionalHeaders = {}, returnFullResponse = false) {
  try {
    const response = await axios.put(
      buildUrl(endpoint),
      JSON.stringify(body),
      { headers: buildHeaders({ additionalHeaders }) }
    );
    return returnFullResponse ? response : response.data;
  } catch (error) {
    logError('PUT', endpoint, error);
    throw error;
  }
}

// DELETE
export async function apiDelete(endpoint, body = null, additionalHeaders = {}, returnFullResponse = false) {
  try {
    const token = await fetchCsrfToken();
    const response = await axios.delete(buildUrl(endpoint), {
      headers: buildHeaders({ additionalHeaders : {...additionalHeaders, 'X-CSRF-Token': token} }),
      data: body ? JSON.stringify(body) : undefined,
    });
    return returnFullResponse ? response : { success: true };
  } catch (error) {
    logError('DELETE', endpoint, error);
    if (error.response.status === 401) {
      if (!window.location.href.includes(`${APP_URL}/login`)) {
        window.location.href = `${APP_URL}/login`;
        Cookies.remove("user_auth");
      }
    }
    throw error;
  }
}

// PATCH
export async function apiPatch(endpoint, body, isFormData = false, additionalHeaders = {}, returnFullResponse = false) {
  try {
    const token = await fetchCsrfToken();
    const response = await axios.patch(
      buildUrl(endpoint),
      isFormData ? body : JSON.stringify(body),
      { headers: buildHeaders({ isFormData, additionalHeaders : {...additionalHeaders, 'X-CSRF-Token': token} }) }
    );
    return returnFullResponse ? response : response.data;
  } catch (error) {
    logError('PATCH', endpoint, error);
    throw error;
  }
}
