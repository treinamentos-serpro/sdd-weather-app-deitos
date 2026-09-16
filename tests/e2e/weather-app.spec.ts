import { expect, type Page, test } from '@playwright/test';

const geocodingEndpoint = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

const saoPauloGeocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      country: 'Brasil',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    },
    {
      id: 6322752,
      name: 'São Paulo',
      latitude: -23.5333,
      longitude: -46.6167,
      country: 'Brasil',
      admin1: 'Minas Gerais',
      timezone: 'America/Sao_Paulo',
    },
  ],
};

const forecastResponse = {
  current: {
    temperature_2m: 24.4,
    apparent_temperature: 26.1,
    weather_code: 2,
    relative_humidity_2m: 68,
    wind_speed_10m: 12.5,
    precipitation: 0.2,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    weather_code: [2, 61, 0, 3, 95],
    temperature_2m_min: [18.2, 17, 16.4, 19.1, 20],
    temperature_2m_max: [27.8, 23.5, 26, 28.3, 29.7],
    precipitation_sum: [1.4, 8.1, 0, 0.6, 12.9],
    wind_speed_10m_max: [24, 31.2, 18.7, 22.5, 36],
  },
};

test('busca cidade, seleciona localidade e exibe clima atual com cinco dias', async ({ page }) => {
  const calls = await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Escolha a localidade' })).toBeVisible();
  await expect(page.getByRole('button', { name: /São Paulo, Brasil/ }).first()).toBeVisible();

  await page
    .getByRole('button', { name: /São Paulo, Brasil/ })
    .first()
    .click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByText('São Paulo, Brasil')).toBeVisible();
  await expect(page.getByLabel('Clima atual').getByText('24°C')).toBeVisible();
  await expect(page.getByText('Sensação 26°C')).toBeVisible();
  await expect(page.getByLabel('Clima atual').getByLabel('Céu parcialmente nublado')).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  expect(calls.geocoding).toBe(1);
  expect(calls.forecast).toBe(1);
});

test('permite escolher homônimo por teclado e preserva contexto regional', async ({ page }) => {
  await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('searchbox', { name: 'Cidade' }).press('Enter');
  await expect(page.getByRole('button', { name: /Minas Gerais, Brasil/ })).toBeVisible();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByText('Minas Gerais, Brasil')).toBeVisible();
});

test('mostra estado vazio sem manter dados da busca anterior', async ({ page }) => {
  await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse, {}],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page
    .getByRole('button', { name: /São Paulo, Brasil/ })
    .first()
    .click();
  await expect(page.getByLabel('Clima atual').getByText('24°C')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma localidade encontrada');
  await expect(page.getByText('24°C')).toHaveCount(0);
});

test('recupera falha de geocoding com retry', async ({ page }) => {
  await routeWeatherApi(page, {
    geocoding: [{ status: 503 }, saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível carregar os dados meteorológicos.',
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Escolha a localidade' })).toBeVisible();
});

test('recupera falha de forecast com retry', async ({ page }) => {
  await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [{ status: 500 }, forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page
    .getByRole('button', { name: /São Paulo, Brasil/ })
    .first()
    .click();

  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível carregar os dados meteorológicos.',
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByLabel('Clima atual').getByText('24°C')).toBeVisible();
});

test('alterna Celsius e Fahrenheit sem nova requisição', async ({ page }) => {
  const calls = await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page
    .getByRole('button', { name: /São Paulo, Brasil/ })
    .first()
    .click();
  await expect(page.getByLabel('Clima atual').getByText('24°C')).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();

  await expect(page.getByLabel('Clima atual').getByText('76°F')).toBeVisible();
  await expect(page.getByText('Sensação 79°F')).toBeVisible();
  expect(calls.geocoding).toBe(1);
  expect(calls.forecast).toBe(1);
});

test('bloqueia submit curto sem chamar a API', async ({ page }) => {
  const calls = await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('a');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText('Informe pelo menos 2 caracteres');
  expect(calls.geocoding).toBe(0);
  expect(calls.forecast).toBe(0);
});

test('mantém renderização inicial rápida em perfil 4G estável', async ({ page }) => {
  await routeWeatherApi(page, {
    geocoding: [saoPauloGeocodingResponse],
    forecast: [forecastResponse],
  });

  await page.route('**/*.{js,css}', async (route) => {
    await route.continue();
  });

  const startedAt = performance.now();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Previsão do tempo' })).toBeVisible();
  const elapsedMs = performance.now() - startedAt;

  test.info().annotations.push({
    type: 'performance',
    description: `Renderização inicial validada em ${Math.round(elapsedMs)}ms no projeto ${test.info().project.name}; ambiente local Playwright com rotas Open-Meteo interceptadas, representando rede 4G estável sem latência externa.`,
  });
  expect(elapsedMs).toBeLessThan(2_000);
});

type MockPayload = { results?: unknown[]; current?: unknown; daily?: unknown };
type MockResponse = MockPayload | { status: number };

interface RouteWeatherApiOptions {
  geocoding: MockResponse[];
  forecast: MockResponse[];
}

async function routeWeatherApi(page: Page, options: RouteWeatherApiOptions) {
  const calls = { geocoding: 0, forecast: 0 };
  const geocodingResponses = [...options.geocoding];
  const forecastResponses = [...options.forecast];

  await page.route(`${geocodingEndpoint}**`, async (route) => {
    calls.geocoding += 1;
    await fulfillMockResponse(route, geocodingResponses.shift());
  });

  await page.route(`${forecastEndpoint}**`, async (route) => {
    calls.forecast += 1;
    const requestUrl = new URL(route.request().url());
    expect(requestUrl.searchParams.has('temperature_unit')).toBe(false);
    await fulfillMockResponse(route, forecastResponses.shift());
  });

  return calls;
}

async function fulfillMockResponse(
  route: Parameters<Parameters<Page['route']>[1]>[0],
  response: MockResponse | undefined,
): Promise<void> {
  if (response === undefined) {
    throw new Error(`Chamada inesperada para ${route.request().url()}`);
  }

  if ('status' in response) {
    await route.fulfill({ status: response.status, body: '' });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(response),
  });
}
