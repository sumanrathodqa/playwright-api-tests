const { request } = require('@playwright/test');
require('dotenv').config();


async function getAuthToken (){
  const loginURL = process.env.LOGIN_URL;
  const requestContext = await request.newContext();

  // Fetch the access token using the credentials stored in .env
  const response = await requestContext.post(`${loginURL}/connect/token`, {
    form: {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.ok()) {
    const data = await response.json();
    await requestContext.dispose();
    return data.access_token;
  } else {
    throw new Error('Failed to fetch the token');
  }
}

module.exports = { getAuthToken };