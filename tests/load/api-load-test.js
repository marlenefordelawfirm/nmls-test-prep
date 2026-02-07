/**
 * API Endpoint Load Test for NMLS Test Prep
 *
 * Tests API performance under concurrent load
 *
 * Run with:
 * k6 run tests/load/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failureRate = new Rate('failed_requests');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    // Scenario 1: Constant load on read endpoints
    read_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      exec: 'readEndpoints',
    },

    // Scenario 2: Spike test on auth endpoints
    auth_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
      ],
      exec: 'authEndpoints',
      startTime: '30s', // Start after read_load is running
    },

    // Scenario 3: Stress test
    stress: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '30s', target: 50 },  // Ramp up to 50 req/s
        { duration: '1m', target: 50 },   // Hold at 50 req/s
        { duration: '30s', target: 0 },   // Ramp down
      ],
      exec: 'mixedLoad',
      startTime: '1m', // Start after other scenarios
    },
  ],
  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests under 1s
    http_req_failed: ['rate<0.10'],    // Less than 10% errors (rate limiting expected)
    'http_req_duration{endpoint:admin}': ['p(95)<800'],
    'http_req_duration{endpoint:public}': ['p(95)<300'],
  },
};

// Read endpoints test
export function readEndpoints() {
  const responses = http.batch([
    ['GET', `${BASE_URL}/`, null, { tags: { endpoint: 'public' } }],
    ['GET', `${BASE_URL}/login`, null, { tags: { endpoint: 'public' } }],
    ['GET', `${BASE_URL}/register`, null, { tags: { endpoint: 'public' } }],
  ]);

  responses.forEach((response) => {
    check(response, {
      'status is 200': (r) => r.status === 200,
    });
    failureRate.add(response.status !== 200);
  });

  sleep(Math.random() * 2 + 1); // Random sleep 1-3s
}

// Auth endpoints test
export function authEndpoints() {
  const payload = JSON.stringify({
    email: `test_${Date.now()}_${Math.random()}@example.com`,
    password: 'TestPass123!@#',
    name: 'Test User',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth' },
  };

  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);

  check(response, {
    'registration handled': (r) =>
      r.status === 201 || r.status === 400 || r.status === 429,
    'rate limit headers present': (r) =>
      r.headers['X-Ratelimit-Limit'] !== undefined || r.status === 429,
  });

  // Don't count rate limiting as failure - it's expected
  if (response.status !== 429) {
    failureRate.add(response.status !== 201 && response.status !== 400);
  }

  sleep(1);
}

// Mixed load test
export function mixedLoad() {
  const scenarios = [
    () => http.get(`${BASE_URL}/`, { tags: { endpoint: 'public' } }),
    () => http.get(`${BASE_URL}/login`, { tags: { endpoint: 'public' } }),
    () => http.get(`${BASE_URL}/api/admin/thresholds`, { tags: { endpoint: 'admin' } }),
  ];

  // Pick random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const response = scenario();

  check(response, {
    'response received': (r) => r.status !== 0,
  });

  // Admin endpoints should return 401 (unauthenticated) or 429 (rate limited)
  if (response.url.includes('/api/admin/')) {
    check(response, {
      'admin endpoint protected': (r) => r.status === 401 || r.status === 429,
    });
    // These are expected responses, not failures
    if (response.status !== 401 && response.status !== 429) {
      failureRate.add(true);
    }
  } else {
    failureRate.add(response.status !== 200);
  }

  sleep(0.5);
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test: 'API Load Test',
    metrics: {},
  };

  // Extract key metrics
  if (data.metrics.http_req_duration) {
    summary.metrics.response_time = {
      min: data.metrics.http_req_duration.values.min,
      avg: data.metrics.http_req_duration.values.avg,
      max: data.metrics.http_req_duration.values.max,
      p95: data.metrics.http_req_duration.values['p(95)'],
      p99: data.metrics.http_req_duration.values['p(99)'],
    };
  }

  if (data.metrics.http_reqs) {
    summary.metrics.total_requests = data.metrics.http_reqs.values.count;
    summary.metrics.requests_per_second = data.metrics.http_reqs.values.rate;
  }

  if (data.metrics.http_req_failed) {
    summary.metrics.failure_rate = data.metrics.http_req_failed.values.rate * 100;
  }

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'tests/load/results/api-load-test-results.json': JSON.stringify(data, null, 2),
  };
}
