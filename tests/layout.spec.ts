import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const url = 'http://127.0.0.1:4173'
const buttons = { en: 'English', fr: 'Français', uk: 'Українська', ru: 'Русский' } as const

const noOverflow = async (page: Page) => {
  const sizes = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }))
  expect(sizes.doc).toBeLessThanOrEqual(sizes.view)
}

test('sections are ordered About, Shoots, Cases', async ({ page }) => {
  await page.goto(url)
  const tops = await page.evaluate(() =>
    ['about', 'work', 'cases'].map((id) => document.getElementById(id)!.getBoundingClientRect().top + window.scrollY),
  )
  expect(tops[0]).toBeLessThan(tops[1])
  expect(tops[1]).toBeLessThan(tops[2])
  const links = await page.locator('.desktop-nav a').allTextContents()
  expect(links).toEqual(['About', 'Shoots', 'Cases'])
})

for (const width of [768, 1024, 1440]) {
  test(`four hero photos share one row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(url)
    await page.waitForTimeout(1500)
    const rects = await page.locator('.photo').evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))
    expect(rects).toHaveLength(4)
    for (let i = 1; i < 4; i += 1) expect(rects[i].left).toBeGreaterThanOrEqual(rects[i - 1].right - 0.5)
    const firstTop = Math.min(...rects.map((r) => r.top))
    const lastTop = Math.max(...rects.map((r) => r.top))
    const shortestHeight = Math.min(...rects.map((r) => r.height))
    expect(lastTop - firstTop).toBeLessThan(shortestHeight)
    for (const r of rects) expect(r.right).toBeLessThanOrEqual(width)
    expect(new Set(rects.map((r) => Math.round(r.width))).size).toBe(4)
    await noOverflow(page)
  })
}

for (const width of [320, 360, 390]) {
  test(`hero photos form a snap rail at ${width}px without page overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url)
    const rail = page.locator('.photo-grid')
    await expect(rail.locator('.photo')).toHaveCount(4)
    expect(await rail.evaluate((el) => getComputedStyle(el).scrollSnapType)).toContain('x')
    expect(await rail.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
    const second = (await page.locator('.photo').nth(1).boundingBox())!
    expect(second.x).toBeLessThan(width)
    await rail.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    await expect(page.locator('.photo').nth(3)).toBeInViewport()
    await expect(page.locator('.photo-n').nth(3)).toHaveText('04 / 04')
    await noOverflow(page)
  })
}

test.describe('year 2027', () => {
  for (const lang of ['en', 'fr', 'uk', 'ru'] as const) {
    test(`${lang}: UI shows 2027 and never 2026`, async ({ page }) => {
      await page.goto(url)
      await page.getByRole('button', { name: buttons[lang], exact: true }).click()
      const text = await page.locator('body').innerText()
      expect(text).toContain('2027')
      expect(text).not.toContain('2026')
      expect(await page.title()).not.toContain('2026')
      expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toContain('2026')
      await page.locator('.case-card').first().getByRole('button').click()
      expect(await page.locator('.viewer').innerText()).not.toContain('2026')
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: /^(Book|Réserver|Забронювати|Забронировать)/ }).first().click()
      expect(await page.locator('input[name="date"]').getAttribute('min')! >= '2027-01-01').toBe(true)
    })
  }
})

test.describe('desktop header', () => {
  for (const width of [980, 1280, 1440]) {
    test(`nav is centred, languages at far right, Book is white at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(url)
      const nav = (await page.locator('.desktop-nav').boundingBox())!
      const lang = (await page.locator('.lang-switch').boundingBox())!
      const mark = (await page.locator('.wordmark').boundingBox())!
      expect(Math.abs(nav.x + nav.width / 2 - width / 2)).toBeLessThanOrEqual(1)
      expect(Math.abs(lang.x + lang.width - (width - 40))).toBeLessThanOrEqual(1)
      expect(lang.x).toBeGreaterThan(nav.x + nav.width)
      expect(mark.x + mark.width).toBeLessThan(nav.x)

      const book = page.locator('.desktop-nav button')
      const style = await book.evaluate((el) => {
        const s = getComputedStyle(el)
        return { bg: s.backgroundColor, weight: Number(s.fontWeight), radius: parseFloat(s.borderTopLeftRadius) }
      })
      expect(style.bg).toBe('rgb(255, 255, 255)')
      expect(style.weight).toBeGreaterThanOrEqual(700)
      expect(style.radius).toBeGreaterThan(0)
      expect(style.radius).toBeLessThanOrEqual(8)
      await noOverflow(page)
    })
  }

  test('mobile menu still works with four languages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto(url)
    await expect(page.locator('.desktop-nav')).toBeHidden()
    await expect(page.locator('.lang-switch button')).toHaveCount(4)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.locator('#mobile-menu a')).toHaveText(['About', 'Shoots', 'Cases'])
    await noOverflow(page)
  })
})
