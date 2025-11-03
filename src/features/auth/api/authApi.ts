import { apiClient } from '@/shared/api/apiClient';
import type { ILoginRequest, IAuthResponse } from '../model/types';

export const login = async (data: ILoginRequest): Promise<IAuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};