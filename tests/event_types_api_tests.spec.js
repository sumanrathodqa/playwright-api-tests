const { test, expect } = require('@playwright/test');
require('dotenv').config();
const { getAuthToken } = require('../utils/initialAuth');

// Global variable to store the token
let authToken = '';

test.beforeAll(async () => {
  authToken = await getAuthToken();
  console.log('Auth token fetched');
});

test.describe('Event Type API Tests', () => {

  const baseUrl = process.env.BASE_URL;
  const tenantId = process.env.TENANT_ID;
  const fs = require('fs');

  
  test('GET /event-types - Fetch event types', async ({ request }) => {

    const response = await request.get(`${baseUrl}/work-items/v1/tenants/${tenantId}/tags/examples/event-types`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const expectedEventTypes = JSON.parse(fs.readFileSync('data/eventTypes.json', 'utf8'));

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log('Response from Fetch Event Types:', responseBody);
    expect(responseBody).toEqual(expectedEventTypes);
  });  
  }); 