import api from './api';
import type { ApiResponse } from '../types/pools';
import type { Pool } from '../types/pools';

export async function fetchPools(): Promise<ReadonlyArray<Pool>> {
  const res = await api.get('/pools') as ApiResponse<ReadonlyArray<Pool>>;
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to fetch pools');
  }
  return res.data;
}