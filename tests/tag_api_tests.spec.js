const { test, expect } = require('@playwright/test');
require('dotenv').config();
const { getAuthToken } = require('../utils/initialAuth');
const { v4: uuidv4 } = require('uuid');

// Global variable to store the token
let authToken = '';

test.beforeAll(async () => {
  authToken = await getAuthToken();
  console.log('Auth token fetched');
});

test.describe.serial('Tag API Tests', () => {

  const baseUrl = process.env.BASE_URL;
  const tenantId = process.env.TENANT_ID;
  const fs = require('fs');
  let previousEventHash;
  let createdTagId;
  let retrievedChangedByActorId;
  let eventId;
  const staticDataToCreateTag = JSON.parse(fs.readFileSync('data/createTag.json', 'utf-8'));
  test('Create a new tag', async ({ request }) => {
    // Generate a unique GUIDs for EventId and Tag ID
    eventId = uuidv4();  // Assign to the global variable
    console.log('Unique Event Id generated:', eventId);

    const dynamicId = uuidv4();
    console.log('Unique ID generated for POST request:', dynamicId);

    // Create payload for the POST request
    const payload = {
      ...staticDataToCreateTag.createTag,
      eventId: eventId,
      id: dynamicId
    };

    const finalUrl = `${baseUrl}/work-items/v1/tenants/${tenantId}/tags`;
    console.log('Final Request URL:', finalUrl);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await request.post(finalUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: payload,
    });

    console.log('Response Status:', response.status());
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(201);

    // Capture necessary fields for other tests
    previousEventHash = responseBody.latestEventHash;
    retrievedChangedByActorId = responseBody.createdById;
    createdTagId = dynamicId;  // Assign to the global variable

    console.log('Generated - Previous Event Hash:', previousEventHash);
    console.log('Retrieved - Changed by actor Id:', retrievedChangedByActorId);

    expect(responseBody).toMatchObject({
      title: payload.title,
      description: payload.description,
      color: payload.color,
      image: payload.image,
      id: dynamicId,
    });
  });

  test('GET - Returns the specified tag item', async ({ request }) => {
    const response = await request.get(`${baseUrl}/work-items/v1/tenants/${tenantId}/tags/${createdTagId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log('Response from GET Tag details:', responseBody);

    // Basic Property Assertions
    expect(responseBody.id).toBe(createdTagId);
    expect(responseBody.tenantId).toBe(tenantId);
    expect(responseBody.title).toBe("Sample Tag Title");
    expect(responseBody.description).toBe("Sample description for the tag");
    expect(responseBody.color).toBe("#FF5733");
    expect(responseBody.image).toBe("http://example.com/image.png");

    // Event-Related Assertions
    expect(responseBody.latestEventHash).toBe(previousEventHash);
    expect(responseBody.latestEventId).toBe(eventId);  // Now uses the global variable
    expect(responseBody.latestEventNumber).toBe(1);

    // Creation Metadata Assertions
    expect(responseBody.createdOnOffset).toBe("1967-06-19T17:03:13.567+00:00");
    expect(responseBody.changedOnOffset).toBe("1967-06-19T17:03:13.567+00:00");
    expect(responseBody.createdById).toBe("28886b9e-5d93-82c9-d6f6-384923748692");
    expect(responseBody.changedById).toBe("28886b9e-5d93-82c9-d6f6-384923748692");

    // Null Field Assertions
    expect(responseBody.parentId).toBeNull();
    expect(responseBody.removedReason).toBeNull();
    expect(responseBody.removedOnOffset).toBeNull();
    expect(responseBody.removedById).toBeNull();
    expect(responseBody.archivedOnOffset).toBeNull();
    expect(responseBody.archivedById).toBeNull();
  });

  test('Update event type in an existing tag', async ({ request }) => {
    const eventId = uuidv4();
    console.log('Unique Event Id generated for PUT request:', eventId);

    const timeOfFactOffset = new Date().toISOString();

    const eventData = JSON.stringify({
      Color: "My string",
      PreviousEventHash: previousEventHash,
      EventId: eventId,
      ChangedByActorId: retrievedChangedByActorId,
      TimeOfFactOffset: timeOfFactOffset
    });

    const payload = {
      type: "ColorChanged",
      eventData: eventData,
    };

    const finalUrl = `${baseUrl}/work-items/v1/tenants/${tenantId}/tags/${createdTagId}/event`;
    console.log('Final Request URL for PUT:', finalUrl);
    console.log('Request Payload for PUT:', JSON.stringify(payload, null, 2));

    const response = await request.put(finalUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: payload,
    });

    console.log('Response Status for PUT:', response.status());

    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      const responseBody = await response.json();
      console.log('Response Body for PUT:', JSON.stringify(responseBody, null, 2));

      expect(response.status()).toBe(200);

      expect(responseBody).toHaveProperty('eventHash');
      expect(responseBody.eventHash).not.toBe(previousEventHash);
      previousEventHash = responseBody.eventHash;

      expect(responseBody.conflictState).toBe(0);  
      expect(responseBody.indexSaved).toBe(true); 

      console.log('New Event Hash after PUT:', previousEventHash);
      console.log('Event type updated for Tag Id:', createdTagId);

    } else {
      const responseText = await response.text();
      console.error('Non-JSON Response Body:', responseText);
      throw new Error(`PUT request failed with non-JSON response: ${responseText}`);
    }
  });
});