// utils/api.ts
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import TokenService from './StorageService';

/**
 * Khi gặp 401 → xóa token + hard redirect sang /login.
 * Tập trung tại đây để slices/components không cần truyền NavigateFunction.
 */
const handleUnauthorized = () => {
  TokenService.logout();
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
): Promise<T> => {
  const config: AxiosRequestConfig = { url: endpoint, method, data: body };
  try {
    console.log(config)
    const response: AxiosResponse<T> = await axiosInstance(config);
    console.log(response)
    return response.data;
  } catch (error: any) {
    console.log(error)
    const status = error.response?.status ?? error.status;
    if (status === 401) handleUnauthorized();
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const apiCallGet = <T>(url: string) => apiCall<T>(url, 'GET');
export const apiCallPost = <T>(url: string, body?: any) => apiCall<T>(url, 'POST', body);
export const apiCallPut = <T>(url: string, body?: any) => apiCall<T>(url, 'PUT', body);
export const apiCallPatch = <T>(url: string, body?: any) => apiCall<T>(url, 'PATCH', body);
export const apiCallDelete = <T>(url: string, body?: any) => apiCall<T>(url, 'DELETE', body);

export const apiUploadImage = async (endpoint: string, formData: FormData): Promise<any> => {
  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status ?? error.status;
    if (status === 401) handleUnauthorized();
    throw new Error(error.message);
  }
};
