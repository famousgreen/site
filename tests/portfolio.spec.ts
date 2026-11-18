import { expect, test } from '@playwright/test'

const url = 'http://127.0.0.1:4173'

test('desktop layout shows three shoots and has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(url)

  await expect(page.getByRole('heading', { name: 'Alina Moreau' })).toBeVisible()
  await expect(page.locator('.shoot')).toHaveCount(3)

  const sizes = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth)
})

test('booking dialog stays inside a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(url)
  await page.getByRole('button', { name: 'Выбрать дату' }).first().click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByPlaceholder('Ваше имя')).toBeVisible()

  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(390)
  expect(box!.y + box!.height).toBeLessThanOrEqual(844)
})

for (const width of [320, 360, 390, 768]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url)
    await page.waitForTimeout(1300)
    const sizes = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }))
    expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth)
  })
}
