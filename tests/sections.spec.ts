import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const url = 'http://127.0.0.1:4173'

const noOverflow = async (page: Page) => {
  const sizes = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }))
  expect(sizes.doc).toBeLessThanOrEqual(sizes.view)
}

const copy = {
  en: { about: /I photograph how people/, cases: 'Selected projects', outcome: 'What you receive', open: 'Close project', back: 'Back to cases', next: /Next project/ },
  fr: { about: /Je photographie les gens/, cases: 'Projets choisis', outcome: 'Ce que vous recevez', open: 'Fermer le projet', back: 'Retour aux projets', next: /Projet suivant/ },
  uk: { about: /Я фотографую людей/, cases: 'Обрані проєкти', outcome: 'Що ви отримаєте', open: 'Закрити проєкт', back: 'Назад до проєктів', next: /Наступний проєкт/ },
  ru: { about: /Я снимаю людей/, cases: 'Избранные проекты', outcome: 'Что вы получите', open: 'Закрыть проект', back: 'Назад к проектам', next: /Следующий проект/ },
} as const
const buttons = { en: 'English', fr: 'Français', uk: 'Українська', ru: 'Русский' } as const

test.describe('about and cases', () => {
  test('about has portrait, geography, facts, publications and no removed approach block', async ({ page }) => {
    await page.goto(url)
    const about = page.locator('#about')
    await expect(about.getByRole('img', { name: /Hanna Chauvat/ })).toBeVisible()
    await expect(about.getByText('Paris', { exact: true })).toBeVisible()
    await expect(about.getByText('Normandy', { exact: true })).toBeVisible()
    await expect(about.locator('.about-facts dt')).toHaveCount(4)
    await expect(about.locator('.about-press li')).toHaveCount(4)
    await expect(page.getByText(/Approach|Подход|Approche/)).toHaveCount(0)
  })

  test('navigation links lead to about, cases and shoots', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url)
    for (const [name, id] of [['About', 'about'], ['Cases', 'cases'], ['Shoots', 'work']] as const) {
      await page.locator('.desktop-nav').getByRole('link', { name }).click()
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.1 })
    }
  })

  test('four visually different cases with all fields', async ({ page }) => {
    await page.goto(url)
    const cards = page.locator('.case-card')
    await expect(cards).toHaveCount(4)
    for (let i = 0; i < 4; i += 1) {
      await expect(cards.nth(i).locator('h3 button')).not.toBeEmpty()
      await expect(cards.nth(i).locator('.case-meta span')).toHaveCount(3)
      await expect(cards.nth(i).locator('.case-context')).not.toBeEmpty()
    }
    const ratios = await cards.locator('img').evaluateAll((imgs) => imgs.map((img) => getComputedStyle(img).aspectRatio))
    expect(new Set(ratios).size).toBe(4)
  })
})

test.describe('shoot accordions', () => {
  test('expand one at a time with aria state and CTA', async ({ page }) => {
    await page.goto(url)
    const portrait = page.locator('#acc-portrait-trigger')
    const wedding = page.locator('#acc-wedding-trigger')
    await expect(portrait).toHaveAttribute('aria-expanded', 'true')
    await expect(wedding).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#acc-wedding-panel')).toBeHidden()

    await wedding.focus()
    await page.keyboard.press('Enter')
    await expect(wedding).toHaveAttribute('aria-expanded', 'true')
    await expect(portrait).toHaveAttribute('aria-expanded', 'false')
    const panel = page.locator('#acc-wedding-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('aria-labelledby', 'acc-wedding-trigger')
    await expect(panel.locator('.acc-details li')).toHaveCount(3)

    await panel.getByRole('button', { name: /wedding date/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Wedding', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')

    await wedding.click()
    await expect(wedding).toHaveAttribute('aria-expanded', 'false')
  })

  for (const width of [320, 390, 1440]) {
    test(`ribbon scrolls by button, keyboard and snaps at ${width}px without page overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(url)
      await page.locator('#acc-commercial-trigger').click()
      const ribbon = page.locator('#acc-commercial-panel .ribbon')
      await expect(ribbon.locator('img')).toHaveCount(5)
      expect(await ribbon.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
      expect(await ribbon.evaluate((el) => getComputedStyle(el).scrollSnapType)).toContain('x')
      await noOverflow(page)

      await page.locator('#acc-commercial-panel').getByRole('button', { name: 'Next photos' }).click()
      await expect.poll(() => ribbon.evaluate((el) => el.scrollLeft)).toBeGreaterThan(20)

      await ribbon.evaluate((el) => el.scrollTo({ left: 0 }))
      await ribbon.focus()
      await page.keyboard.press('ArrowRight')
      await expect.poll(() => ribbon.evaluate((el) => el.scrollLeft)).toBeGreaterThan(20)
      await page.keyboard.press('Home')
      await expect.poll(() => ribbon.evaluate((el) => el.scrollLeft)).toBe(0)
      await noOverflow(page)
    })
  }

  test('ribbon supports mouse drag', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url)
    const ribbon = page.locator('#acc-portrait-panel .ribbon')
    await ribbon.scrollIntoViewIfNeeded()
    const box = (await ribbon.boundingBox())!
    await page.mouse.move(box.x + 600, box.y + 100)
    await page.mouse.down()
    await page.mouse.move(box.x + 300, box.y + 100, { steps: 8 })
    await page.mouse.up()
    expect(await ribbon.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  })

  test.describe('touch', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } })
    test('ribbon scrolls horizontally with touch scroll', async ({ page }) => {
      await page.goto(url)
      const ribbon = page.locator('#acc-portrait-panel .ribbon')
      await ribbon.scrollIntoViewIfNeeded()
      await ribbon.evaluate((el) => el.scrollTo({ left: 300 }))
      await expect.poll(() => ribbon.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
      await noOverflow(page)
    })
  })
})

test.describe('project viewer', () => {
  test('opens full screen in the same tab, traps focus, navigates and restores focus', async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url)
    const trigger = page.locator('.case-card').first().getByRole('button')
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const viewer = page.getByRole('dialog', { name: /Seine, Slowly/ })
    await expect(viewer).toBeVisible()
    expect(context.pages()).toHaveLength(1)
    expect(page.url()).toContain('#case/seine')
    const box = (await viewer.boundingBox())!
    expect(box.width).toBe(1440)
    expect(box.height).toBe(900)
    await expect(viewer.locator('.collage img')).toHaveCount(5)
    await expect(page.locator('.viewer-close')).toBeFocused()
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')

    const grid = await viewer.locator('.collage').evaluate((el) => getComputedStyle(el).display)
    expect(grid).toBe('grid')
    const overlaps = await viewer.locator('.collage figure').evaluateAll((figs) => {
      const rects = figs.map((f) => f.getBoundingClientRect())
      return rects.some((a, i) => rects.some((b, j) => i < j && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom))
    })
    expect(overlaps).toBe(true)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await viewer.hover()
    await page.mouse.wheel(0, 900)
    await expect.poll(() => viewer.evaluate((el) => el.scrollTop)).toBeGreaterThan(300)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)

    for (let i = 0; i < 30; i += 1) await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('.viewer'))).toBe(true)

    await viewer.getByRole('button', { name: /Next project/ }).click()
    await expect(page.getByRole('dialog', { name: /Étretat/ })).toBeVisible()
    expect(page.url()).toContain('#case/etretat')
    expect(await page.locator('.viewer').evaluate((el) => el.scrollTop)).toBe(0)
    await page.getByRole('button', { name: /Previous project/ }).click()
    await expect(page.getByRole('dialog', { name: /Seine/ })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.viewer')).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(page.url()).not.toContain('#case')
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
  })

  test('deep link opens the viewer and browser back closes it', async ({ page }) => {
    await page.goto(`${url}/#case/rouge`)
    await expect(page.getByRole('dialog', { name: /Maison Rouge/ })).toBeVisible()
    await page.getByRole('button', { name: 'Close project' }).click()
    await expect(page.locator('.viewer')).toHaveCount(0)

    await page.goto(url)
    await page.locator('.case-card').nth(3).getByRole('button').click()
    await expect(page.getByRole('dialog', { name: /Quai/ })).toBeVisible()
    await page.goBack()
    await expect(page.locator('.viewer')).toHaveCount(0)
  })

  test('close button and CTA hand over to the booking popup', async ({ page }) => {
    await page.goto(`${url}/#case/orsay`)
    await page.getByRole('button', { name: /Book a similar shoot/ }).click()
    await expect(page.locator('.viewer')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  for (const width of [320, 390, 768]) {
    test(`collage becomes a readable single-column feed at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(`${url}/#case/etretat`)
      const viewer = page.locator('.viewer')
      await expect(viewer).toBeVisible()
      expect(await viewer.locator('.collage').evaluate((el) => getComputedStyle(el).flexDirection)).toBe('column')
      const lefts = await viewer.locator('.collage figure').evaluateAll((figs) => figs.map((f) => f.getBoundingClientRect()))
      for (const rect of lefts) {
        expect(rect.left).toBeGreaterThanOrEqual(0)
        expect(rect.right).toBeLessThanOrEqual(width)
      }
      const overlapFree = lefts.every((a, i) => lefts.every((b, j) => i >= j || a.bottom <= b.top + 1 || b.bottom <= a.top + 1))
      expect(overlapFree).toBe(true)
      expect(await viewer.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      await viewer.evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
      await expect(viewer.locator('.viewer-nav')).toBeInViewport()
    })
  }
})

test.describe('localization of new sections', () => {
  for (const lang of ['en', 'fr', 'uk', 'ru'] as const) {
    test(`${lang}: about, cases, accordion and viewer are translated`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(url)
      await page.getByRole('button', { name: buttons[lang], exact: true }).click()
      const c = copy[lang]
      await expect(page.locator('#about .about-title')).toContainText(c.about)
      await expect(page.locator('#cases .section-title')).toHaveText(c.cases)
      await expect(page.locator('#acc-portrait-panel .acc-copy .label')).toHaveText(c.outcome)
      await expect(page.locator('#acc-portrait-panel .ribbon')).toHaveAttribute('aria-label', /.+/)

      await page.locator('.case-card').first().getByRole('button').click()
      const viewer = page.getByRole('dialog')
      await expect(viewer.getByRole('button', { name: c.open })).toBeVisible()
      await expect(viewer.getByRole('button', { name: c.back })).toBeVisible()
      await expect(viewer.getByRole('button', { name: c.next })).toBeVisible()
      await expect(viewer.locator('.viewer-info p').first()).not.toBeEmpty()
      if (lang !== 'en') {
        const text = await viewer.innerText()
        expect(text).not.toMatch(/Context|Result|Delivered|Back to cases/)
      }
      await noOverflow(page)
    })
  }

  for (const width of [320, 360, 390, 768, 1440]) {
    test(`no horizontal overflow at ${width}px with viewer in every language`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(url)
      for (const lang of ['fr', 'uk', 'ru', 'en'] as const) {
        await page.getByRole('button', { name: buttons[lang], exact: true }).click()
        await noOverflow(page)
      }
      await page.goto(`${url}/#case/seine`)
      const viewer = page.locator('.viewer')
      expect(await viewer.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    })
  }
})
