import { expect, test } from '@playwright/test'

test('guest home renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Здесь мои проекты/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible()
  await expect(page.getByText('ЛИЧНОЕ ПРОСТРАНСТВО')).toBeVisible()
})

test('about page renders public content', async ({ page }) => {
  await page.goto('/#/about')
  await expect(page.getByRole('heading', { name: /Я разработчик/ })).toBeVisible()
  await expect(page.getByText('ИНСТРУМЕНТЫ')).toBeVisible()
})

test('login page renders owner form', async ({ page }) => {
  await page.goto('/#/login')
  await expect(page.getByRole('heading', { name: /Только для владельца/ })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Пароль')).toBeVisible()
})

test('notes route redirects a guest to login', async ({ page }) => {
  await page.goto('/#/notes')
  await expect(page.getByRole('heading', { name: /Только для владельца/ })).toBeVisible()
})

test('login form validates empty fields', async ({ page }) => {
  await page.goto('/#/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByText('Заполните email и пароль.')).toBeVisible()
})
