# Load Testing with k6

This directory contains load tests for the NMLS Test Prep application using [k6](https://k6.io/).

## Installation

### macOS
```bash
brew install k6
```

### Windows
```bash
choco install k6
```

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Test Scripts

### 1. Basic Load Test (`basic-load-test.js`)

Tests basic application performance with ramping user load.

**Run:**
```bash
k6 run tests/load/basic-load-test.js
```

**Stages:**
- Ramp up to 10 users (30s)
- Hold at 10 users (1m)
- Ramp up to 50 users (30s)
- Hold at 50 users (2m)
- Ramp down to 0 (30s)

**Thresholds:**
- 95% of requests < 500ms
- Error rate < 5%

---

### 2. API Load Test (`api-load-test.js`)

Tests API endpoints with multiple concurrent scenarios.

**Run:**
```bash
k6 run tests/load/api-load-test.js
```

**Scenarios:**
1. **Read Load:** 20 constant users for 2 minutes
2. **Auth Spike:** Spike to 50 users testing auth endpoints
3. **Stress Test:** Ramp up to 50 req/s

**Thresholds:**
- 99% of requests < 1s
- Admin endpoints: p(95) < 800ms
- Public endpoints: p(95) < 300ms

---

## Running Against Different Environments

### Local Development
```bash
k6 run tests/load/basic-load-test.js
```

### Staging
```bash
BASE_URL=https://staging.nmlstestprep.com k6 run tests/load/basic-load-test.js
```

### Production (WARNING: Only with permission!)
```bash
BASE_URL=https://nmlstestprep.com k6 run tests/load/basic-load-test.js
```

**⚠️ Never run load tests against production without:**
1. Getting explicit permission
2. Notifying the team
3. Monitoring infrastructure during tests
4. Having rollback plan ready

---

## Results

Results are saved to `tests/load/results/` in JSON format.

Example:
```json
{
  "timestamp": "2026-02-06T...",
  "test": "API Load Test",
  "metrics": {
    "response_time": {
      "min": 12.5,
      "avg": 145.3,
      "max": 892.1,
      "p95": 320.5,
      "p99": 450.2
    },
    "total_requests": 5420,
    "requests_per_second": 45.2,
    "failure_rate": 2.1
  }
}
```

---

## Interpreting Results

### Response Times
- **Good:** p(95) < 500ms, p(99) < 1000ms
- **Acceptable:** p(95) < 1000ms, p(99) < 2000ms
- **Poor:** p(95) > 1000ms or p(99) > 2000ms

### Error Rates
- **Excellent:** < 0.1%
- **Good:** < 1%
- **Acceptable:** < 5%
- **Poor:** > 5%

### Rate Limiting
- 429 (Too Many Requests) is EXPECTED and NOT counted as a failure
- Shows rate limiting is working correctly
- Should see rate limit headers in responses

---

## Custom Test Examples

### Quick Smoke Test
```javascript
export const options = {
  vus: 1,
  duration: '30s',
};
```

### Spike Test
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 100 },  // Quick spike
    { duration: '30s', target: 100 },  // Hold
    { duration: '10s', target: 0 },    // Drop
  ],
};
```

### Soak Test (Long Duration)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3h', target: 50 },  // Hold for 3 hours
    { duration: '2m', target: 0 },
  ],
};
```

---

## Monitoring During Tests

While running load tests, monitor:

1. **Application Metrics:**
   - Response times
   - Error rates
   - Database connections
   - Memory usage

2. **Infrastructure:**
   - CPU usage
   - Memory usage
   - Network bandwidth
   - Database query times

3. **k6 Output:**
   ```
   running (0m30.0s), 00/50 VUs
   http_req_duration..........: avg=145ms p(95)=320ms
   http_req_failed............: 2.1%
   http_reqs..................: 5420
   ```

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: Install k6
  run: |
    curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

- name: Run load tests
  run: k6 run tests/load/basic-load-test.js --quiet
```

### Pass/Fail Criteria
```bash
# Exit code 0 if all thresholds pass, 1 if any fail
k6 run tests/load/basic-load-test.js

# Cloud run with results dashboard
k6 cloud tests/load/basic-load-test.js
```

---

## Best Practices

1. **Start Small:** Begin with low load and gradually increase
2. **Test Locally First:** Verify tests work before running against staging/prod
3. **Monitor:** Always monitor infrastructure during tests
4. **Off-Peak Hours:** Run production tests during low-traffic periods
5. **Warm-Up:** Include ramp-up time to avoid cold start issues
6. **Realistic Scenarios:** Model actual user behavior
7. **Regular Testing:** Run load tests weekly or before major releases

---

## Common Issues

### Rate Limiting
**Issue:** Tests fail with 429 errors
**Solution:** This is expected! Rate limiting is working. Adjust test expectations.

### Connection Refused
**Issue:** `connection refused` errors
**Solution:** Ensure app is running: `npm run dev`

### High Failure Rate
**Issue:** > 5% of requests fail
**Solution:**
1. Check application logs
2. Monitor database connections
3. Reduce load or add infrastructure

### Slow Response Times
**Issue:** p(95) > 1000ms
**Solution:**
1. Profile slow endpoints
2. Add caching
3. Optimize database queries
4. Scale infrastructure

---

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)

---

## Next Steps

After load testing:
1. Review results and identify bottlenecks
2. Optimize slow endpoints
3. Add caching where appropriate
4. Consider infrastructure scaling
5. Implement monitoring (Sentry, DataDog, etc.)
6. Set up alerting for performance degradation
