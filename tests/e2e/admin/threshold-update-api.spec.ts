import { test, expect } from '@playwright/test';

test.describe('Threshold Update API', () => {
  test('GET /api/admin/thresholds should return all thresholds', async ({ request }) => {
    const response = await request.get('/api/admin/thresholds');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.thresholds)).toBe(true);
    expect(data.thresholds.length).toBeGreaterThan(0);

    // Check threshold structure
    const threshold = data.thresholds[0];
    expect(threshold).toHaveProperty('id');
    expect(threshold).toHaveProperty('key');
    expect(threshold).toHaveProperty('value');
    expect(threshold).toHaveProperty('year');
    expect(threshold).toHaveProperty('source');
    expect(threshold).toHaveProperty('lastUpdated');
    expect(threshold).toHaveProperty('isActive');
  });

  test('GET /api/admin/thresholds/update should return update status', async ({ request }) => {
    const response = await request.get('/api/admin/thresholds/update');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('lastUpdate');
    expect(data).toHaveProperty('shouldCheckToday');
    expect(data).toHaveProperty('recommendedSchedule');
    expect(data).toHaveProperty('message');
  });

  test('POST /api/admin/thresholds/update should trigger update check', async ({ request }) => {
    const response = await request.post('/api/admin/thresholds/update');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('updatesFound');
    expect(data).toHaveProperty('updatesApplied');
    expect(Array.isArray(data.updates)).toBe(true);
    expect(Array.isArray(data.errors)).toBe(true);
  });

  test('PATCH /api/admin/thresholds/[id] should update threshold value', async ({ request }) => {
    // First, get a threshold to update
    const getResponse = await request.get('/api/admin/thresholds');
    const getData = await getResponse.json();
    const threshold = getData.thresholds[0];

    const originalValue = threshold.value;
    const newValue = originalValue + 1000; // Add $1000 for testing

    // Update the threshold
    const patchResponse = await request.patch(`/api/admin/thresholds/${threshold.id}`, {
      data: { value: newValue }
    });

    expect(patchResponse.ok()).toBeTruthy();

    const patchData = await patchResponse.json();
    expect(patchData.success).toBe(true);
    expect(patchData.threshold.value).toBe(newValue);

    // Verify the update persisted
    const verifyResponse = await request.get('/api/admin/thresholds');
    const verifyData = await verifyResponse.json();
    const updatedThreshold = verifyData.thresholds.find((t: any) => t.id === threshold.id);
    expect(updatedThreshold.value).toBe(newValue);

    // Restore original value
    await request.patch(`/api/admin/thresholds/${threshold.id}`, {
      data: { value: originalValue }
    });
  });

  test('PATCH /api/admin/thresholds/[id] should reject invalid value', async ({ request }) => {
    const getResponse = await request.get('/api/admin/thresholds');
    const getData = await getResponse.json();
    const threshold = getData.thresholds[0];

    // Try to update with invalid value (string instead of number)
    const patchResponse = await request.patch(`/api/admin/thresholds/${threshold.id}`, {
      data: { value: 'invalid' }
    });

    expect(patchResponse.status()).toBe(400);

    const patchData = await patchResponse.json();
    expect(patchData.success).toBe(false);
    expect(patchData.error).toContain('must be a number');
  });

  test('GET /api/admin/thresholds/[id] should return specific threshold', async ({ request }) => {
    // Get all thresholds first
    const getAllResponse = await request.get('/api/admin/thresholds');
    const getAllData = await getAllResponse.json();
    const thresholdId = getAllData.thresholds[0].id;

    // Get specific threshold
    const getResponse = await request.get(`/api/admin/thresholds/${thresholdId}`);

    expect(getResponse.ok()).toBeTruthy();

    const data = await getResponse.json();
    expect(data.success).toBe(true);
    expect(data.threshold.id).toBe(thresholdId);
  });

  test('GET /api/admin/thresholds/[id] should return 404 for non-existent threshold', async ({ request }) => {
    const response = await request.get('/api/admin/thresholds/non-existent-id');

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('not found');
  });

  test('thresholds should be ordered by year desc, then key asc', async ({ request }) => {
    const response = await request.get('/api/admin/thresholds');
    const data = await response.json();

    const thresholds = data.thresholds;
    expect(thresholds.length).toBeGreaterThan(1);

    // Check ordering
    for (let i = 0; i < thresholds.length - 1; i++) {
      const current = thresholds[i];
      const next = thresholds[i + 1];

      if (current.year === next.year) {
        // If same year, should be alphabetically ordered by key
        expect(current.key.localeCompare(next.key)).toBeLessThanOrEqual(0);
      } else {
        // Should be descending by year
        expect(current.year).toBeGreaterThanOrEqual(next.year);
      }
    }
  });
});
