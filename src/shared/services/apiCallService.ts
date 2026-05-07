// utils/api.ts
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import TokenService from './StorageService';

const handleUnauthorized = (navigate?: NavigateFunction) => {
  // Xóa token trước khi redirect — tránh vòng lặp login ↔ dashboard
  TokenService.logout();
  navigate?.('/login', { replace: true } as any);
};

const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  const config: AxiosRequestConfig = { url: endpoint, method, data: body };
  console.log(config)

  try {
    const response: AxiosResponse<T> = await axiosInstance(config);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status ?? error.status;
    console.log(error)

    if (status === 401) {
      handleUnauthorized(navigate);
    }
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
export const apiCallGet = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'GET', body, navigate);

export const apiCallPost = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'POST', body, navigate);

export const apiCallPut = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'PUT', body, navigate);

export const apiCallDelete = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'DELETE', body, navigate);

export const apiCallPatch = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'PATCH', body, navigate);

export const apiUploadImage = async (
  endpoint: string,
  formData: FormData,
  navigate?: NavigateFunction,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 && navigate) {
      navigate('/login');
    }
    console.error('Upload image error:', error);
    throw new Error(error.message);
  }
};