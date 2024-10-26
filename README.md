# Playwright API Test Project for Tag Events

## Overview
This project automates API testing for "tag events" using Playwright, focusing on creating, updating, and validating tag entities. These tests ensure that tag events respond correctly, meet expected results, and validate the response body content.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Enviornment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Generating Reports](#generating-reports)

## Prerequisites
Before you begin, ensure you have the following installed on your machine:

1. **Node.js**
   - Ensure you have Node.js (>= 14.x) installed. You can download it from Node.js.

2. **Playwright**
   - Playwright library is used for API testing.


## Installation
1. Clone the repository
git clone <repository-url>

2. Navigate into the project directory
cd <project-directory>

3. Install dependencies
npm install


## Environment Configuration
Copy following values from the test project jsons 'Suman Rathod - QA-Task.json' and 'QA-TASK-ENV.postman_environment.json' into a .env file.
BASE_URL='<replace with URL>'
LOGIN_URL='<replace with URL>'
CLIENT_ID='<replace with client id>'
CLIENT_SECRET='<replace with client secret>'
TENANT_ID='<replace with tenant id>'
ACTOR_ID='<replace with actor id>'

The '.env.sample' can be used for guidance.

## Running Tests
    npx playwright test

    To run a specific test file:
    npx playwright test tests/tag_api_tests.spec.js

## Viewing Reports
Playwright generates a report that you can view after running tests:

    npx playwright show-report
