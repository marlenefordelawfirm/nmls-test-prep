/**
 * Basic Load Test for NMLS Test Prep
 *
 * Tests basic application performance under load
 *
 * Run with:
 * k6 run tests/load/basic-load-test.js
 *
 * Install k6:
 * brew install k6 (macOS)
 * choco install k6 (Windows)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const failureRate = new Rate('failed_requests');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users over 30s
    { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
    { duration: '30s', target: 50 },  // Ramp up to 50 users over 30s
    { duration: '2m', target: 50 },   // Stay at 50 users for 2 minutes
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
    failed_requests: ['rate<0.05'],   // Custom failure rate below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Load homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 500ms': (r) => r.timings.duration < 500,
  });

  failureRate.add(response.status !== 200);
  sleep(1);

  // 2. Load login page
  response = http.get(`${BASE_URL}/login`);
  check(response, {
    'login page status is 200': (r) => r.status === 200,
  });

  failureRate.add(response.status !== 200);
  sleep(1);

  // 3. Attempt login (will fail, but tests auth endpoint)
  const loginStart = Date.now();
  response = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    email: `loadtest_${Date.now()}_${Math.random()}@example.com`,
    password: 'LoadTest123!@#',
    name: 'Load Test User',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  loginDuration.add(Date.now() - loginStart);

  check(response, {
    'registration endpoint responds': (r) => r.status === 201 || r.status === 400 || r.status === 429,
  });

  // If rate limited (429), that's expected under load
  if (response.status !== 429) {
    failureRate.add(response.status !== 201 && response.status !== 400);
  }

  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load/results/basic-load-test-summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}Test Summary:\n`;
  summary += `${indent}  Scenarios: ${data.metrics.scenarios ? Object.keys(data.metrics.scenarios).length : 0}\n`;
  summary += `${indent}  Requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0}\n`;
  summary += `${indent}  Duration: ${data.state ? data.state.testRunDurationMs / 1000 : 0}s\n\n`;

  if (data.metrics.http_req_duration) {
    summary += `${indent}Response Time:\n`;
    summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  P(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  }

  if (data.metrics.http_req_failed) {
    const failRate = data.metrics.http_req_failed.values.rate * 100;
    summary += `${indent}Failure Rate: ${failRate.toFixed(2)}%\n`;
  }

  return summary;
}
