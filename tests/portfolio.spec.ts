import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const url = 'http://127.0.0.1:4173'
const widths = [320, 360, 390, 768, 1440]
const langs = [
  { id: 'fr', button: 'Français', manifest: /images sincères/, book: 'Réserver une séance' },
  { id: 'en', button: 'English', manifest: /Honest images/, book: 'Book a shoot' },
  { id: 'uk', button: 'Українська', manifest: /Щирі кадри/, book: 'Забронювати зйомку' },
  { id: 'ru', button: 'Русский', manifest: /Честные кадры/, book: 'Забронировать съёмку' },
] as const

const noOverflow = async (page: Page) => {
  const sizes = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    view: document.documentElement.clientWidth,
  }))
  expect(sizes.doc).toBeLessThanOrEqual(sizes.view)
}

test.describe('browser locale detection', () => {
  for (const [locale, expected] of [
    ['fr-FR', 'fr'],
    ['uk-UA', 'uk'],
    ['ru-RU', 'ru'],
    ['de-DE', 'en'],
    ['en-US', 'en'],
  ] as const) {
    test.describe(locale, () => {
      test.use({ locale })
      test(`selects ${expected}`, async ({ page }) => {
        await page.goto(url)
        await expect(page.locator('html')).toHaveAttribute('lang', expected)
        await expect(page.getByRole('button', { name: langs.find((l) => l.id === expected)!.button, exact: true })).toHaveAttribute('aria-pressed', 'true')
      })
    })
  }
})

test('manual language choice wins, persists and survives reload', async ({ page }) => {
  await page.goto(url)
  await page.getByRole('button', { name: 'Українська', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
  expect(await page.evaluate(() => localStorage.getItem('hc-lang'))).toBe('uk')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
  await expect(page.getByRole('heading', { level: 2, name: /Щирі кадри/ })).toBeVisible()
})

test.describe('ru browser with manual EN override', () => {
  test.use({ locale: 'ru-RU' })
  test('stored choice has priority over browser locale', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hc-lang', 'en'))
    await page.goto(url)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 2, name: /Honest images/ })).toBeVisible()
  })
})

test('name, structure and typography', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1, name: 'Hanna Chauvat' })).toBeVisible()
  await expect(page.locator('.photo')).toHaveCount(4)
  await expect(page.locator('.shoot-row')).toHaveCount(3)
  await expect(page.getByText(/Alina|Moreau|Jeanna/)).toHaveCount(0)

  const fonts = await page.evaluate(() => {
    const families = new Set<string>()
    document.querySelectorAll('body *').forEach((el) => families.add(getComputedStyle(el).fontFamily))
    return [...families]
  })
  for (const family of fonts) expect(family).not.toMatch(/cormorant|georgia|times|(?<!sans-)serif/i)
})

for (const width of widths) {
  test(`no horizontal overflow at ${width}px in every language`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url)
    for (const lang of langs) {
      await page.getByRole('button', { name: lang.button, exact: true }).click()
      await page.waitForTimeout(150)
      await noOverflow(page)
    }
  })
}

test.describe('booking popup', () => {
  for (const width of [320, 390, 768]) {
    for (const lang of langs) {
      test(`${lang.id} popup fits ${width}px viewport and is accessible`, async ({ page }) => {
        const height = width === 768 ? 1024 : 700
        await page.setViewportSize({ width, height })
        await page.goto(url)
        await page.getByRole('button', { name: lang.button, exact: true }).click()
        await page.getByRole('button', { name: lang.book }).first().click()

        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveAttribute('lang', lang.id)
        await expect(dialog.locator('input[name="name"]')).toBeFocused()

        const box = await dialog.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.y).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        expect(box!.y + box!.height).toBeLessThanOrEqual(height + 0.5)
        const scroll = await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)
        expect(scroll).toBe(true)

        await expect(dialog.getByRole('button', { name: 'Telegram', exact: true })).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
      })
    }
  }

  test('keeps contact data untranslated and traps focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url)
    await page.getByRole('button', { name: 'English', exact: true }).click()
    await page.getByRole('button', { name: 'Book a shoot' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Email', exact: true }).click()
    await dialog.locator('input[name="contact"]').fill('anna@example.com')
    await expect(dialog.locator('input[name="contact"]')).toHaveValue('anna@example.com')

    for (let i = 0; i < 20; i += 1) await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
  })
})
