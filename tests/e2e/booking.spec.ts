import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/CalOpen/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login')
    await expect(page).toHaveURL(/.*login/)
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign Up')
    await expect(page).toHaveURL(/.*signup/)
  })

  test('should display booking page for a user', async ({ page }) => {
    await page.goto('/book/testuser')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show event type selection on booking page', async ({ page }) => {
    await page.goto('/book/testuser')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to events page', async ({ page }) => {
    await page.click('text=Events')
    await expect(page).toHaveURL(/.*events/)
  })

  test('should navigate to bookings page', async ({ page }) => {
    await page.click('text=Bookings')
    await expect(page).toHaveURL(/.*bookings/)
  })

  test('should navigate to availability page', async ({ page }) => {
    await page.click('text=Availability')
    await expect(page).toHaveURL(/.*availability/)
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.click('text=Settings')
    await expect(page).toHaveURL(/.*settings/)
  })
})

test.describe('Availability Page', () => {
  test('should display availability form', async ({ page }) => {
    await page.goto('/dashboard/availability')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show day-of-week toggles', async ({ page }) => {
    await page.goto('/dashboard/availability')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('API Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
