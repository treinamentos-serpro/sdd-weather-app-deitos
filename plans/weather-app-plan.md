# Plano Técnico — Weather App

## 1. Architecture Overview

O app será uma SPA React client-side, sem autenticação, backend próprio ou segredo no cliente. A UI depende de hooks para orquestrar estado e de services para acessar a Open-Meteo. Os services convertem respostas externas em modelos internos normalizados; componentes não conhecem o formato bruto da API.

```mermaid
flowchart LR
  U[Usuário] --> S[SearchForm]
  S --> H[useWeatherSearch]
  H --> G[geocodingService]
  G --> GM[Open-Meteo Geocoding]
  H --> R[LocationResults]
  R --> H
  H --> F[forecastService]
  F --> FM[Open-Meteo Forecast]
  H --> A[App state]
  A --> C[CurrentWeather]
  A --> D[DailyForecast]
  A --> T[UnitToggle]
```

Responsabilidades:

- `App`: compõe a tela, mantém a unidade selecionada e conecta os estados de busca à UI.
- `SearchForm`: controla somente o texto de entrada, valida antes de enviar e expõe a mensagem de termo inválido.
- `useWeatherSearch`: administra transições de estado, cancelamento de requisições e retry da última intenção do usuário.
- `services`: fazem `fetch`, validam status HTTP e normalizam respostas da Open-Meteo.
- Componentes de apresentação: renderizam dados normalizados, valores neutros e estados de loading, erro e vazio.

## 2. Tech Stack

| Tecnologia | Uso | Justificativa |
| --- | --- | --- |
| TypeScript 6 em modo `strict` | Código e contratos | As configurações já recusam tipos implícitos e código não utilizado. |
| React 19 + React DOM | Componentes e estado local | Dependências já instaladas; o escopo não requer store global. |
| Vite 8 | Desenvolvimento e build | Configurado no projeto, com build estático adequado ao deploy. |
| Tailwind CSS 3 | Estilo responsivo | Segue o tema dark glassmorphism existente e reduz CSS específico. |
| Open-Meteo | Geocoding e previsão | Pública, sem API key, conforme NFR5. |
| Vitest + Testing Library | Testes unitários e de componentes | Ambiente `jsdom` e setup já configurados. |
| Playwright | Fluxos E2E desktop e mobile | Projetos Chromium e iPhone 13 já definidos. |
| Biome | Lint e formatação | Comandos do repositório aplicam qualidade a `src` e `tests`. |

## 3. Project Structure

```text
src/
  components/
    SearchForm.tsx            # entrada, validação e submissão
    LocationResults.tsx       # resultados selecionáveis com contexto regional
    CurrentWeather.tsx        # métricas atuais
    DailyForecast.tsx         # grade dos cinco dias
    ForecastDay.tsx           # uma entrada diária
    UnitToggle.tsx            # controle C/F acessível
    FeedbackState.tsx         # loading, vazio e erro com retry
  hooks/
    useWeatherSearch.ts       # fluxo geocoding -> previsão e retry
  services/
    geocodingService.ts       # contrato do endpoint de localidades
    forecastService.ts        # contrato do endpoint meteorológico
    weatherCode.ts            # mapeamento puro de códigos para rótulo/ícone
  types/
    weather.ts                # tipos internos e tipos de estado
  utils/
    temperature.ts            # conversão e formatação puras
    date.ts                   # formatação pt-BR de datas
  App.tsx
  main.tsx
  index.css                   # diretivas Tailwind e estilos globais mínimos
tests/
  unit/                       # services, utils, hook e componentes
  e2e/                        # jornadas com respostas HTTP interceptadas
```

Cada componente terá um único arquivo e exportação padrão. Serviços não renderizam nem alteram estado React; utilitários não executam I/O.

## 4. Data Model

Os dados canônicos ficam em Celsius, a unidade padrão (BR4). Campos ausentes são opcionais ou `null`; a apresentação os transforma em `—` (BR6).

```ts
type TemperatureUnit = 'celsius' | 'fahrenheit';

interface Location {
  id: number;
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
}

interface CurrentWeather {
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  weatherCode: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
}

interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minimumTemperatureCelsius: number | null;
  maximumTemperatureCelsius: number | null;
  precipitationMm: number | null;
  maximumWindSpeedKmh: number | null;
}

interface WeatherData {
  current: CurrentWeather;
  daily: ForecastDay[];
}

type SearchStatus = 'idle' | 'searchingLocations' | 'selectingLocation' |
  'loadingForecast' | 'success' | 'empty' | 'error';
```

`Location.id`, quando disponível, é a chave estável da lista. O contexto exibido deriva de `admin1` e `country`, omitindo apenas partes indisponíveis sem ocultar o nome principal da cidade (RF8).

## 5. Data Flow

1. `SearchForm` faz `trim` do termo no submit. Menos de dois caracteres não chama o service e mostra a orientação local (RF1, RF9, BR1).
2. `useWeatherSearch` define `searchingLocations`, chama o geocoding e substitui a lista anterior pelo resultado atual.
3. Sem resultados, o hook limpa cidade e previsão selecionadas e define `empty` (AC1, BR7). Com resultados, define `selectingLocation` e exibe todas as opções.
4. O clique ou acionamento por teclado em uma opção define a cidade selecionada e inicia uma consulta de forecast em `loadingForecast` (RF2, RF3).
5. `forecastService` normaliza `current` e arrays `daily`, limita a lista aos cinco primeiros itens e o hook publica `success` somente com uma resposta válida.
6. `App` passa os valores canônicos e `TemperatureUnit` aos componentes. A troca de unidade recalcula somente valores de renderização, sem fetch (RF6, BR5).
7. Uma nova busca aborta a requisição anterior com `AbortController`; respostas abortadas ou obsoletas não alteram o estado atual.

Decisão de UX: a busca ocorre somente por submit explícito (Enter ou botão). Resultados são exibidos na ordem retornada pela Open-Meteo, limitados a dez opções; não há seleção automática, mesmo com uma correspondência. Isso mantém a confirmação explícita exigida por BR2 e evita homônimos inesperados.

## 6. External APIs

### Geocoding

`GET https://geocoding-api.open-meteo.com/v1/search`

Parâmetros: `name={encodeURIComponent(query)}`, `count=10`, `language=pt` e `format=json`. O service aceita a ausência de `results` como lista vazia e extrai `id`, `name`, `country`, `admin1`, `latitude`, `longitude` e `timezone`.

### Forecast

`GET https://api.open-meteo.com/v1/forecast`

Parâmetros:

```text
latitude={latitude}&longitude={longitude}&timezone=auto&forecast_days=5
&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation
&daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,wind_speed_10m_max
```

Não enviar `temperature_unit=fahrenheit`: a API sempre retorna Celsius, preservando o modelo canônico e garantindo a conversão local imediata. `weather_code` será mapeado pela tabela WMO da Open-Meteo para rótulos pt-BR e ícones com texto alternativo.

Para ambos endpoints, `response.ok === false`, falha de rede, JSON inválido e estrutura sem coordenadas ou dados meteorológicos necessários se tornam erros tipados do service.

## 7. State Management

Estado local em `App` e `useWeatherSearch`, sem Context ou biblioteca externa:

| Estado | Dono | Valor inicial | Transições relevantes |
| --- | --- | --- | --- |
| `unit` | `App` | `celsius` | Alternância C/F; não dispara fetch. |
| `query` | `SearchForm` | `''` | Controlado durante digitação. |
| `locations` | `useWeatherSearch` | `[]` | Preenchido pelo geocoding; limpo em nova busca. |
| `selectedLocation` | `useWeatherSearch` | `null` | Definido por seleção; limpo em busca vazia/sem resultado. |
| `weather` | `useWeatherSearch` | `null` | Definido após forecast; limpo antes de nova busca. |
| `status` e `error` | `useWeatherSearch` | `idle` e `null` | Fonte de verdade para feedback. |
| `retryAction` | `useWeatherSearch` | `null` | Registra busca ou cidade que falhou. |

Ao iniciar nova busca, limpar previsão e cidade anterior evita vazamento de contexto (BR7). A unidade permanece na sessão, inclusive ao trocar de cidade, mas não é persistida entre recargas (fora de escopo).

## 8. Error Handling Strategy

| Cenário | Estado/UI | Ação |
| --- | --- | --- |
| Inicial | `idle`, orientação de busca | Sem requisição. |
| Termo vazio ou com menos de dois caracteres | Mensagem associada ao campo | Bloquear submit e preservar estado consistente. |
| Geocoding em curso | `searchingLocations` | Indicador acessível no formulário. |
| Sem localidades | `empty` | Mensagem específica; cidade e previsão permanecem limpas. |
| Escolha de local | `selectingLocation` | Lista de botões com nome e contexto. |
| Forecast em curso | `loadingForecast` | Indicador visual e anúncio por `aria-live`. |
| HTTP, rede, JSON inválido ou payload inválido | `error` | Texto compreensível e botão “Tentar novamente”. |
| Campo individual ausente | `success` | Exibir `—`; os demais campos continuam disponíveis. |

O retry repete a última operação falha: geocoding com o termo submetido ou forecast com a `Location` selecionada. Erros de aborto não são exibidos. Mensagens dinâmicas usam `aria-live="polite"`; o foco continua no controle iniciado pelo usuário, exceto quando for necessário focar uma mensagem de erro acionável.

## 9. UI and Accessibility Decisions

- Aplicar layout mobile-first em Tailwind, com fundo `night-900`, superfícies glass (`bg-white/5`, `backdrop-blur-md`, bordas sutis) e contraste de texto claro.
- Usar `main`, `header`, `form`, `section`, `article`, listas e botões reais. Resultados de localização são botões navegáveis por Tab, Enter e Espaço.
- O input tem `label` visível ou acessível, `aria-describedby` para validação e submit por Enter. O alternador de unidade é um grupo rotulado de botões com estado atual em `aria-pressed`.
- Exibir previsão em `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, com cinco cartões de tamanho estável e foco visível.
- Formatar datas por `Intl.DateTimeFormat('pt-BR', ...)`. Exibir ícone e rótulo textual da condição, sem depender apenas de cor ou símbolo.

## 10. Testing Strategy

### Unitários e componentes (Vitest + Testing Library)

- `temperature`: conversão C/F, arredondamento de exibição, valores nulos e ausência de nova chamada ao service após trocar a unidade (AC4, NFR6).
- `geocodingService` e `forecastService`: URL e parâmetros, normalização, arrays de cinco dias, HTTP não-OK, rede, JSON/payload inválido e campos ausentes (AC1-AC3).
- `useWeatherSearch`: mínimo de dois caracteres, limpeza de dados anteriores, estados, seleção explícita, retry e proteção contra resposta obsoleta (AC1, AC5).
- Componentes: contexto de homônimos, métricas atuais, fallback `—`, cinco previsões, loading, vazio, erro, rótulos e acionamento por teclado (AC1-AC6, NFR3).

Mockar `fetch` nos testes de services/hook; não depender da Open-Meteo em testes automatizados. Criar fixtures completas, vazias, incompletas e com erro.

### E2E (Playwright)

- Busca válida -> resultados -> seleção -> clima atual e exatamente cinco dias.
- Cidade homônima -> escolha com região e país preservados no cabeçalho.
- Busca inexistente -> estado vazio, sem dados da busca anterior.
- Falha do geocoding e do forecast -> mensagem e retry recuperando o fluxo.
- Alternância C/F -> todas as temperaturas mudam sem nova requisição interceptada.
- Submissão vazia/curta -> mensagem de validação e nenhuma requisição.
- Executar os fluxos nos projetos `chromium` e `mobile`; validar teclado no fluxo de busca e seleção.

## 11. Implementation Sequence

1. Criar tipos internos, fixtures e utilitários puros de temperatura, data e códigos WMO; cobrir conversão e fallbacks unitariamente.
2. Implementar `geocodingService` e `forecastService` com normalização, erros tipados e testes com respostas mockadas.
3. Implementar `useWeatherSearch` com máquina de estados simples, cancelamento e retry; validar transições em teste.
4. Construir `SearchForm` e `LocationResults`, incluindo validação, seleção explícita e acessibilidade de teclado.
5. Construir `CurrentWeather`, `ForecastDay`, `DailyForecast` e `UnitToggle`; integrar em `App` com layout Tailwind responsivo.
6. Adicionar feedback para todos os estados e executar testes E2E com rotas da API interceptadas.
7. Executar `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` antes da revisão.

## 12. Risks & Trade-offs

| Risco ou decisão | Impacto | Mitigação ou justificativa |
| --- | --- | --- |
| Homônimos e resultados similares | Consulta da cidade errada | Sempre solicitar seleção explícita e exibir região/país. |
| Requisições concorrentes | Dados antigos sobrescrevem a tela | Abortar a anterior e ignorar respostas obsoletas. |
| Resposta Open-Meteo incompleta | Falha visual ou lógica | Normalizar campos como nulos e renderizar fallback por métrica. |
| Ausência de cache/persistência | Mais consultas entre sessões | Fora de escopo; reduz complexidade e risco de dados defasados. |
| Estado local em vez de store global | Escala limitada | Suficiente para uma tela e uma cidade; migrar apenas se surgirem fluxos compartilhados. |
| Conversão local, não na API | Arredondamentos consistentes | Centralizar cálculo e arredondar apenas na exibição; atende BR5 e NFR1. |
| Dependência de API pública | Indisponibilidade eventual | Mensagem clara, retry e testes com mocks; não há fallback de dados no MVP. |