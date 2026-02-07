import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set for tests');
}

const pool = new Pool({
  connectionString: DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

test.describe('Financial Thresholds', () => {
  test.beforeAll(async () => {
    // Ensure thresholds exist
    const count = await prisma.financialThreshold.count();
    expect(count).toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  test('should have seeded 2026 conforming loan limit', async () => {
    const threshold = await prisma.financialThreshold.findUnique({
      where: { key: 'CONFORMING_LOAN_LIMIT_2026_SINGLE_FAMILY' }
    });

    expect(threshold).toBeTruthy();
    expect(threshold?.value).toBe(806500);
    expect(threshold?.year).toBe(2026);
    expect(threshold?.source).toContain('FHFA');
    expect(threshold?.isActive).toBe(true);
  });

  test('should have seeded FHA loan limits', async () => {
    const lowCost = await prisma.financialThreshold.findUnique({
      where: { key: 'FHA_LOAN_LIMIT_2026_LOW_COST' }
    });

    const highCost = await prisma.financialThreshold.findUnique({
      where: { key: 'FHA_LOAN_LIMIT_2026_HIGH_COST' }
    });

    expect(lowCost).toBeTruthy();
    expect(lowCost?.value).toBe(498257);
    expect(lowCost?.source).toContain('HUD');

    expect(highCost).toBeTruthy();
    expect(highCost?.value).toBe(1209750);
  });

  test('should have seeded HPML APR thresholds', async () => {
    const firstLien = await prisma.financialThreshold.findUnique({
      where: { key: 'HPML_APR_THRESHOLD_FIRST_LIEN' }
    });

    const subordinate = await prisma.financialThreshold.findUnique({
      where: { key: 'HPML_APR_THRESHOLD_SUBORDINATE_LIEN' }
    });

    expect(firstLien?.value).toBe(1.5);
    expect(subordinate?.value).toBe(3.5);
    expect(firstLien?.source).toContain('CFPB');
  });

  test('should have seeded QM DTI threshold', async () => {
    const qmDti = await prisma.financialThreshold.findUnique({
      where: { key: 'QM_DTI_THRESHOLD' }
    });

    expect(qmDti).toBeTruthy();
    expect(qmDti?.value).toBe(43);
    expect(qmDti?.year).toBe(2026);
    expect(qmDti?.source).toContain('CFPB');
  });

  test('should have seeded VA loan limit', async () => {
    const vaLimit = await prisma.financialThreshold.findUnique({
      where: { key: 'VA_LOAN_LIMIT_2026' }
    });

    expect(vaLimit).toBeTruthy();
    expect(vaLimit?.value).toBe(806500);
    expect(vaLimit?.source).toContain('VA');
  });

  test('should have seeded FHA MIP rates', async () => {
    const upfront = await prisma.financialThreshold.findUnique({
      where: { key: 'FHA_UPFRONT_MIP_RATE' }
    });

    const annual = await prisma.financialThreshold.findUnique({
      where: { key: 'FHA_ANNUAL_MIP_RATE_LTV_95_PLUS' }
    });

    expect(upfront?.value).toBe(1.75);
    expect(annual?.value).toBe(0.85);
  });

  test('should have all thresholds active by default', async () => {
    const thresholds = await prisma.financialThreshold.findMany({
      where: { year: 2026 }
    });

    const allActive = thresholds.every(t => t.isActive === true);
    expect(allActive).toBe(true);
  });

  test('should have proper source attribution', async () => {
    const thresholds = await prisma.financialThreshold.findMany();

    const sources = thresholds.map(t => t.source);
    expect(sources.some(s => s.includes('FHFA'))).toBe(true);
    expect(sources.some(s => s.includes('HUD'))).toBe(true);
    expect(sources.some(s => s.includes('CFPB'))).toBe(true);
    expect(sources.some(s => s.includes('VA'))).toBe(true);
  });

  test('should have lastUpdated timestamps', async () => {
    const thresholds = await prisma.financialThreshold.findMany();

    thresholds.forEach(threshold => {
      expect(threshold.lastUpdated).toBeInstanceOf(Date);
      expect(threshold.lastUpdated.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  test('should have unique keys', async () => {
    const thresholds = await prisma.financialThreshold.findMany();
    const keys = thresholds.map(t => t.key);
    const uniqueKeys = new Set(keys);

    expect(keys.length).toBe(uniqueKeys.size);
  });
});
