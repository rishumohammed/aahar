import { test, expect } from '@playwright/test';

test('test select dropdown', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  await page.goto('http://localhost:3001');
  
  // Wait for load
  await page.waitForTimeout(1000);
  
  // Click the Select Trigger
  await page.click('button[data-slot="select-trigger"]');
  await page.waitForTimeout(500);
  
  // Click the "Eat" item
  await page.click('div[data-slot="select-item"][value="Eat"]');

  console.log('Logs captured:', logs);
  
  // Wait a bit to ensure updates
  await page.waitForTimeout(500);

  // Check the trigger text
  const triggerText = await page.textContent('button[data-slot="select-trigger"]');
  console.log('Trigger text after click:', triggerText);
});
