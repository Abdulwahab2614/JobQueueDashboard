import axios, { AxiosError } from 'axios';
import type { CreateJobPayload, Job, JobStatus } from '../types/job';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL });

export class ApiError extends Error {
  status?: number;
  isConflict: boolean;
  isNetworkError: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.isConflict = status === 409;
    this.isNetworkError = status === undefined;
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string | string[] }>;
    const status = err.response?.status;
    const data = err.response?.data;
    const rawMessage = Array.isArray(data?.message)
      ? data?.message.join(', ')
      : data?.message;

    if (!err.response) {
      return new ApiError(
        'Network error: could not reach the server. Check your connection or try again.',
        undefined,
      );
    }
    if (status === 404) {
      return new ApiError(rawMessage || 'The requested job could not be found.', 404);
    }
    if (status === 409) {
      return new ApiError(
        rawMessage ||
          'This job was updated by another user. Refreshing the latest state.',
        409,
      );
    }
    if (status === 400) {
      return new ApiError(rawMessage || 'Invalid request. Please check the form and try again.', 400);
    }
    return new ApiError(rawMessage || 'Something went wrong. Please try again.', status);
  }
  return new ApiError('Something went wrong. Please try again.');
}

export const jobsApi = {
  async getJobs(): Promise<Job[]> {
    try {
      const res = await client.get<Job[]>('/jobs');
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async createJob(payload: CreateJobPayload): Promise<Job> {
    try {
      const res = await client.post<Job>('/jobs', payload);
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      const res = await client.patch<Job>(`/jobs/${id}/status`, { status });
      return res.data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async deleteJob(id: string): Promise<void> {
    try {
      await client.delete(`/jobs/${id}`);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
