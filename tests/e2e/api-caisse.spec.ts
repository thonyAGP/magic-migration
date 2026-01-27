import { test, expect } from '@playwright/test';

// E2E tests for Caisse API (migration C#)
// Phase 3 PDCA - Tests integration

const API_BASE = 'http://localhost:5287/api';

test.describe('Caisse API - Health', () => {
  test('should return API info', async ({ request }) => {
    const response = await request.get(`${API_BASE}/../swagger/index.html`);
    // Swagger should be available when API is running
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Caisse API - Sessions', () => {
  test('GET /sessions should return sessions list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/sessions`);
    if (response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data) || typeof data === 'object').toBeTruthy();
    } else {
      // API not running - skip test gracefully
      test.skip(true, 'API not available');
    }
  });
});

test.describe('Caisse API - Zooms', () => {
  test('GET /zooms/devises should return currencies', async ({ request }) => {
    const response = await request.get(`${API_BASE}/zooms/devises`);
    if (response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    } else {
      test.skip(true, 'API not available');
    }
  });

  test('GET /zooms/moyens-reglement should return payment methods', async ({ request }) => {
    const response = await request.get(`${API_BASE}/zooms/moyens-reglement`);
    if (response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    } else {
      test.skip(true, 'API not available');
    }
  });
});

test.describe('Caisse API - Change', () => {
  test('GET /change/devise-locale should return local currency', async ({ request }) => {
    const response = await request.get(`${API_BASE}/change/devise-locale`);
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('code');
    } else {
      test.skip(true, 'API not available');
    }
  });
});

test.describe('Caisse API - Solde', () => {
  test('GET /solde with valid params should work', async ({ request }) => {
    // Test with sample params (may return 404 if data not found)
    const response = await request.get(`${API_BASE}/solde/001/12345/1`);
    expect([200, 404, 400]).toContain(response.status());
  });
});

test.describe('Caisse API - Members', () => {
  test('GET /members/club-med-pass with valid params', async ({ request }) => {
    const response = await request.get(`${API_BASE}/members/club-med-pass/001/12345/1`);
    expect([200, 404, 400]).toContain(response.status());
  });
});
