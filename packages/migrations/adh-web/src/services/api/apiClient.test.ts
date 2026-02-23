// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders } from 'axios';
import { apiClient } from './apiClient';

type InterceptorHandler<T> = {
  fulfilled?: (value: T) => T | Promise<T>;
  rejected?: (error: unknown) => unknown;
};

type InterceptorManager<T> = {
  handlers: InterceptorHandler<T>[];
};

describe('apiClient', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
        },
        writable: true,
        configurable: true,
      });
    }
    localStorage.clear();
  });

  describe('client configuration', () => {
    it('should be configured with /api base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('/api');
    });

    it('should have 30s timeout', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });

    it('should set Content-Type to application/json', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('request interceptor', () => {
    it('should add Bearer token from localStorage when present', () => {
      localStorage.setItem('auth_token', 'my-jwt-token');

      const reqInterceptors = apiClient.interceptors.request as unknown as InterceptorManager<Record<string, unknown>>;
      const interceptor = reqInterceptors.handlers[0];

      const headers = new AxiosHeaders();
      const result = interceptor.fulfilled!({ headers, url: '/test' });

      expect((result.headers as Record<string, string>).Authorization).toBe('Bearer my-jwt-token');
    });

    it('should not add Authorization header when no token exists', () => {
      const reqInterceptors = apiClient.interceptors.request as unknown as InterceptorManager<Record<string, unknown>>;
      const interceptor = reqInterceptors.handlers[0];

      const headers = new AxiosHeaders();
      const result = interceptor.fulfilled!({ headers, url: '/test' });

      expect((result.headers as Record<string, string>).Authorization).toBeUndefined();
    });
  });

  describe('response interceptor - error handling', () => {
    it('should normalize API error response into ApiError format', async () => {
      const resInterceptors = apiClient.interceptors.response as unknown as InterceptorManager<unknown>;
      const interceptor = resInterceptors.handlers[1];

      const mockError = {
        response: {
          status: 404,
          data: { code: 'NOT_FOUND', message: 'Resource not found' },
        },
        message: 'Request failed',
        isAxiosError: true,
      };

      if (!interceptor.rejected) {
        throw new Error('Response interceptor rejected handler not found');
      }

      try {
        await interceptor.rejected(mockError);
        throw new Error('Expected rejection');
      } catch (error) {
        expect(error).toEqual({
          status: 404,
          code: 'NOT_FOUND',
          message: 'Resource not found',
        });
      }
    });

    it('should return NETWORK_ERROR when no response and online', async () => {
      const resInterceptors = apiClient.interceptors.response as unknown as InterceptorManager<unknown>;
      const interceptor = resInterceptors.handlers[1];

      if (typeof globalThis.navigator === 'undefined') {
        Object.defineProperty(globalThis, 'navigator', {
          value: { onLine: true },
          writable: true,
          configurable: true,
        });
      } else {
        Object.defineProperty(navigator, 'onLine', {
          value: true,
          writable: true,
          configurable: true,
        });
      }

      const mockError = {
        message: 'timeout of 30000ms exceeded',
        isAxiosError: true,
      };

      if (!interceptor.rejected) {
        throw new Error('Response interceptor rejected handler not found');
      }

      try {
        await interceptor.rejected(mockError);
        throw new Error('Expected rejection');
      } catch (error) {
        expect(error).toEqual({
          status: 0,
          code: 'NETWORK_ERROR',
          message: 'timeout of 30000ms exceeded',
        });
      }
    });

    it('should return OFFLINE error when navigator is offline', async () => {
      const resInterceptors = apiClient.interceptors.response as unknown as InterceptorManager<unknown>;
      const interceptor = resInterceptors.handlers[1];

      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        writable: true,
        configurable: true,
      });

      const mockError = {
        message: 'Network Error',
        isAxiosError: true,
      };

      if (!interceptor.rejected) {
        throw new Error('Response interceptor rejected handler not found');
      }

      try {
        await interceptor.rejected(mockError);
        throw new Error('Expected rejection');
      } catch (error) {
        expect(error).toEqual({
          status: 0,
          code: 'OFFLINE',
          message: 'No network connection',
        });
      }

      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: true },
        writable: true,
        configurable: true,
      });
    });
  });
});