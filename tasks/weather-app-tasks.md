# Backlog de Implementação — Weather App

Este backlog materializa o plano técnico em unidades pequenas, ordenadas por
dependência e verificáveis isoladamente. As tarefas seguem o fluxo
`Spec -> Plan -> Tasks -> Code -> Test`.

## Entrega 1 — Fundamentos e contratos

### T-01 — Definir os tipos canônicos do domínio

- **Tipo:** Data
- **Descrição:** Criar os tipos compartilhados para localização, clima atual,
  previsão diária, dados meteorológicos, unidade de temperatura e estados da
  busca. Usar Celsius como representação canônica e `null` para campos ausentes.
- **Requisitos:** RF3, RF4, RF5, RF6, BR4, BR6, BR7, NFR6.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Critérios de aceite:**
  - Os tipos representam todos os campos usados pelo contrato de geocoding e
    forecast.
  - `TemperatureUnit` permite somente Celsius e Fahrenheit.
  - Os dados meteorológicos não carregam valores Fahrenheit vindos da API.
  - O tipo de estado contempla `idle`, busca de localidades, seleção,
    carregamento do forecast, sucesso, vazio e erro.

### T-02 — Implementar utilitários puros de temperatura, data e códigos WMO

- **Tipo:** Data
- **Descrição:** Criar funções puras para converter e formatar temperaturas,
  formatar datas em pt-BR e mapear códigos WMO para rótulo, texto
  alternativo, chave de ícone e tom visual.
- **Requisitos:** RF4, RF5, RF6, BR5, BR6, NFR1, NFR3, NFR6.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/utils/temperature.ts`, `src/utils/date.ts`,
  `src/services/weatherCode.ts`.
- **Critérios de aceite:**
  - A conversão Celsius/Fahrenheit e o retorno inverso são matematicamente
    corretos, sem mutar os dados de entrada.
  - Valores `null` são preservados ou formatados como `—`.
  - O arredondamento ocorre apenas na apresentação.
  - Datas ISO válidas são exibidas em pt-BR.
  - Códigos WMO conhecidos retornam condição, texto alternativo, chave de
    ícone e tom visual; códigos desconhecidos retornam fallback legível e tom
    neutro.

### T-03 — Criar fixtures e helpers de teste determinísticos

- **Tipo:** Test
- **Descrição:** Preparar fixtures completas, vazias, incompletas e inválidas
  para geocoding e forecast, além dos helpers de renderização necessários aos
  testes unitários.
- **Requisitos:** AC1, AC2, AC3, AC5, BR6, NFR7.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tests/fixtures/weather.ts`,
  `tests/fixtures/api.ts`, `tests/test-utils.tsx`.
- **Critérios de aceite:**
  - As fixtures cobrem sucesso, nenhum resultado, campos ausentes, JSON
    inválido e payload sem dados necessários.
  - Nenhum helper faz chamada à Open-Meteo.
  - Os helpers podem ser reutilizados por testes de services, hook e
    componentes.

### T-04 — Testar os utilitários de apresentação

- **Tipo:** Test
- **Descrição:** Cobrir conversão, arredondamento, valores nulos, datas e
  mapeamento de códigos meteorológicos com testes unitários.
- **Requisitos:** AC2, AC3, AC4, BR5, BR6, NFR6, NFR7.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`,
  `tests/unit/date.test.ts`, `tests/unit/weatherCode.test.ts`.
- **Critérios de aceite:**
  - Os casos Celsius -> Fahrenheit -> Celsius são verificados.
  - Valores nulos e códigos desconhecidos não lançam exceção.
  - A saída formatada usa o fallback definido pelo plano.
  - O descritor visual de códigos WMO retorna chaves semânticas de ícone e
    tons esperados para sol, nuvens, chuva, tempestade, neblina, neve e fallback.

## Entrega 2 — Integração com Open-Meteo

### T-05 — Implementar o service de geocoding

- **Tipo:** Data
- **Descrição:** Encapsular a chamada ao endpoint de geocoding, montar os
  parâmetros definidos no plano e normalizar os resultados para `Location`.
- **Requisitos:** RF1, RF2, RF3, RF8, BR2, NFR4, NFR5.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Critérios de aceite:**
  - A URL usa `encodeURIComponent`, `count=10`, `language=pt` e `format=json`.
  - A resposta é limitada a dez localidades e preserva ordem e contexto
    regional retornados pela API.
  - Ausência de `results` retorna lista vazia.
  - HTTP não-OK, falha de rede, JSON inválido ou localidade sem coordenadas
    geram erro tipado do service.
  - O service não renderiza nem altera estado React.

### T-06 — Implementar o service de forecast

- **Tipo:** Data
- **Descrição:** Encapsular a chamada ao endpoint de previsão, solicitar os
  campos atuais e diários do plano e normalizar a resposta para Celsius.
- **Requisitos:** RF4, RF5, BR3, BR5, BR6, NFR4, NFR5.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Critérios de aceite:**
  - A URL envia as coordenadas, `timezone=auto`, `forecast_days=5` e todos os
    campos current/daily definidos no plano.
  - A requisição não envia `temperature_unit=fahrenheit`.
  - Os arrays diários são combinados por índice e limitados aos cinco primeiros
    dias.
  - Campos ausentes ou nulos viram `null` sem deslocar os demais dias.
  - HTTP não-OK, falha de rede, JSON inválido ou payload meteorológico inválido
    geram erro tipado do service.

### T-07 — Testar os services com fetch mockado

- **Tipo:** Test
- **Descrição:** Validar contratos de URL, normalização e tratamento de falhas
  sem depender da rede ou da disponibilidade da Open-Meteo.
- **Requisitos:** AC1, AC2, AC3, AC5, BR3, BR6, NFR4, NFR7.
- **Dependências:** T-03, T-05, T-06.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`,
  `tests/unit/forecastService.test.ts`.
- **Critérios de aceite:**
  - `fetch` é mockado e suas chamadas são verificadas por método, URL e query.
  - Há testes para sucesso, resposta vazia, HTTP 4xx/5xx, rede, JSON
    inválido e payload incompleto.
  - O forecast normalizado contém no máximo cinco dias e usa Celsius.
  - Os testes não fazem chamadas reais à API.

## Entrega 3 — Orquestração da busca

### T-08 — Implementar o hook de busca e seleção

- **Tipo:** Data
- **Descrição:** Criar `useWeatherSearch` para coordenar geocoding, seleção
  explícita, forecast, estados, limpeza de dados, cancelamento e retry.
- **Requisitos:** RF1, RF2, RF3, RF7, RF9, BR1, BR2, BR7, NFR4.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Critérios de aceite:**
  - Termos com menos de dois caracteres não chamam o geocoding.
  - Nova busca limpa localidades, cidade, forecast e erro anterior antes de
    publicar o novo resultado.
  - Resultado vazio define `empty`; resultado com localidades define
    `selectingLocation` sem seleção automática.
  - Selecionar uma localidade inicia forecast em `loadingForecast` e publica
    `success` apenas após resposta válida.
  - A requisição anterior é abortada e respostas obsoletas não sobrescrevem o
    estado atual.
  - Retry repete exatamente a última busca ou seleção que falhou.
  - Abortos esperados não aparecem como erro para o usuário.

### T-09 — Testar as transições do hook

- **Tipo:** Test
- **Descrição:** Testar o comportamento observável do hook com services
  mockados, incluindo concorrência e retry.
- **Requisitos:** AC1, AC5, BR1, BR2, BR7, NFR4, NFR7.
- **Dependências:** T-03, T-08.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`.
- **Critérios de aceite:**
  - O teste cobre termo curto, busca válida, lista vazia, seleção, sucesso e
    falha em cada etapa.
  - O estado anterior não aparece após uma busca vazia ou nova busca.
  - Retry recupera geocoding e forecast sem criar comportamento diferente da
    operação original.
  - Uma resposta atrasada de uma busca anterior não altera a busca corrente.

## Entrega 4 — Interface de busca e feedback

### T-10 — Construir o formulário de busca acessível

- **Tipo:** UI
- **Descrição:** Criar `SearchForm` controlado, com submit explícito, validação
  de mínimo de dois caracteres, estado de carregamento e mensagem associada ao
  campo.
- **Requisitos:** RF1, RF7, RF9, BR1, AC1, AC5, NFR2, NFR3.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Critérios de aceite:**
  - O campo possui label acessível, `aria-describedby` quando houver erro e
    submissão por Enter ou botão.
  - O termo é aparado antes de ser enviado.
  - Termo vazio ou curto mostra orientação e não chama o callback de busca.
  - O controle comunica loading e evita submissões concorrentes.

### T-11 — Construir resultados de localidades com seleção explícita

- **Tipo:** UI
- **Descrição:** Criar `LocationResults` para exibir nome, região e país e
  selecionar uma localidade por clique ou teclado.
- **Requisitos:** RF2, RF3, RF8, BR2, AC1, AC6, NFR3.
- **Dependências:** T-01, T-08.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`.
- **Critérios de aceite:**
  - Cada opção é um botão real, navegável por Tab, Enter e Espaço.
  - O contexto omite apenas partes ausentes sem ocultar o nome principal.
  - A lista preserva a ordem recebida e não seleciona automaticamente.
  - A seleção emite a `Location` completa uma única vez.

### T-12 — Construir feedback de idle, loading, vazio e erro

- **Tipo:** UI
- **Descrição:** Criar uma apresentação única para orientação inicial,
  carregamento, ausência de resultados e erro com ação de retry.
- **Requisitos:** RF7, BR7, AC1, AC5, NFR3, NFR4.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/components/FeedbackState.tsx`.
- **Critérios de aceite:**
  - Cada estado tem texto legível e não exibe dados de outra localidade.
  - Loading e mudanças dinâmicas usam `aria-live="polite"`.
  - O estado de erro exibe botão acessível que chama retry.
  - A ação de retry mantém foco e não exige recarregar a página.

### T-12A — Padronizar live regions e prioridade de anúncio

- **Tipo:** UI / Hardening
- **Descrição:** Definir um padrão semântico consistente para estados de
  carregamento, progresso e erro, evitando conflito entre `role="alert"` e
  `aria-live` e preservando a leitura com leitores de tela.
- **Requisitos:** NFR3, NFR4, NFR7.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/FeedbackState.tsx`.
- **Critérios de aceite:**
  - Mensagens de progresso e carregamento usam `role="status"` com
    `aria-live="polite"`.
  - Mensagens críticas de erro usam `role="alert"` com prioritização
    assertiva e sem duplicação de anúncio.
  - Não há cenário em que `role="alert"` seja combinado com `aria-live` em
    modo discordante.
  - O comportamento é consistente para busca, erro e retry em todas as telas.

### T-12B — Expor estado ativo/selecionado em controles de escolha

- **Tipo:** UI / Hardening
- **Descrição:** Garantir que os controles de escolha — localidade e unidade —
  exponham seu estado atual de forma semântica e visível para teclado e leitor
  de tela.
- **Requisitos:** NFR3, NFR7.
- **Dependências:** T-11, T-14.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`,
  `src/components/UnitToggle.tsx`.
- **Critérios de aceite:**
  - A opção ativa de cidade e a unidade selecionada são identificadas por
    atributos semânticos de estado (`aria-pressed`, `aria-current` ou
    equivalente).
  - O destaque visual e o anúncio semântico representam o mesmo estado.
  - Usuários de teclado têm indicação clara de qual item está selecionado.
  - A navegação continua funcional sem depender apenas da cor ou do símbolo.

### T-12C — Validar acessibilidade de teclado e regressão de anúncios

- **Tipo:** Test / Hardening
- **Descrição:** Cobrir o fluxo de busca, seleção e erro com testes de
  comportamentos acessíveis e navegação por teclado.
- **Requisitos:** AC1, AC5, AC6, NFR3, NFR7.
- **Dependências:** T-12A, T-12B.
- **Arquivos prováveis:** `tests/unit/FeedbackState.test.tsx`,
  `tests/unit/LocationResults.test.tsx`, `tests/unit/UnitToggle.test.tsx`,
  `tests/e2e/weather-app.spec.ts`.
- **Critérios de aceite:**
  - Os testes validam que a navegação por teclado funciona em busca,
    seleção de localidade e troca de unidade.
  - Há cenário específico para mensagem de erro anunciada como alerta
    crítico sem conflito de live region.
  - Há cenário para o item selecionado ser exposto por semântica acessível.
  - A regressão de a11y é detectada em testes automatizados antes do merge.

## Entrega 5 — Clima, previsão e unidade

### T-13A — Criar o sistema de iconografia contextual

- **Tipo:** UI / Data
- **Descrição:** Instalar `lucide-react`, criar o mapa semântico de ícones e
  conectar os descritores visuais de condição e métricas ao padrão definido no
  plano, sem SVG manual nos componentes.
- **Requisitos:** RF4, RF5, RF7, RF8, AC2, AC3, AC5, AC6, NFR2, NFR3.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`,
  `src/components/icons.ts`, `src/services/weatherCode.ts`,
  `src/types/weather.ts`.
- **Critérios de aceite:**
  - `lucide-react` está disponível como dependência do projeto e o lockfile é
    atualizado pelo gerenciador de pacotes.
  - `components/icons.ts` expõe mapas semânticos para condições climáticas,
    métricas e ações, usando ícones lucide.
  - Condições WMO mapeiam para ícones esperados: céu limpo, nuvens, neblina,
    chuva, neve, tempestade e fallback neutro.
  - Métricas e ações possuem ícones específicos para busca, localidade,
    temperatura, sensação térmica, umidade, vento, precipitação, retry, erro e
    loading.
  - Ícones decorativos são preparados para `aria-hidden="true"`; condições
    climáticas continuam acompanhadas de rótulo textual ou texto alternativo.
  - Nenhum componente precisa importar SVG local ou decidir manualmente qual
    ícone representa uma condição meteorológica.

### T-13 — Construir apresentação do clima atual e da previsão diária

- **Tipo:** UI
- **Descrição:** Criar os componentes de clima atual, cartão diário e grade de
  cinco dias usando somente dados normalizados, descritores visuais e
  iconografia contextual.
- **Requisitos:** RF4, RF5, RF8, BR3, BR6, AC2, AC3, AC6, NFR2, NFR3.
- **Dependências:** T-02, T-06, T-13A.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`,
  `src/components/ForecastDay.tsx`, `src/components/DailyForecast.tsx`.
- **Critérios de aceite:**
  - O clima atual mostra temperatura, sensação, condição, umidade, vento e
    precipitação.
  - Cada dia mostra data, condição, mínima, máxima, precipitação e vento.
  - A grade renderiza exatamente cinco dias quando o forecast é válido.
  - Campos `null` aparecem como `—` sem quebrar a estrutura.
  - Condições têm ícone, rótulo textual e texto alternativo, sem depender
    apenas de cor ou símbolo.
  - Métricas atuais e diárias usam ícones contextuais estáveis, com rótulo
    textual preservado para leitura e testes acessíveis.

### T-14 — Construir o alternador de unidade sem nova requisição

- **Tipo:** UI
- **Descrição:** Criar `UnitToggle` e conectar a unidade local do `App` aos
  componentes de temperatura, convertendo somente na camada de apresentação.
- **Requisitos:** RF6, BR4, BR5, AC4, NFR1, NFR3.
- **Dependências:** T-02, T-13.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/App.tsx`.
- **Critérios de aceite:**
  - A unidade inicial é Celsius.
  - O controle é um grupo rotulado com `aria-pressed` correto.
  - Alternar C/F atualiza temperatura atual, sensação e mínimas/máximas sem
    mutar o modelo canônico.
  - A troca não chama geocoding nem forecast novamente.
  - A unidade continua consistente ao navegar pela tela e trocar de cidade.

### T-15 — Integrar App, layout responsivo e estilos globais

- **Tipo:** UI
- **Descrição:** Compor o fluxo completo no `App`, integrar hook e componentes
  e aplicar o layout mobile-first em Tailwind conforme o plano.
- **Requisitos:** RF1-RF9, BR1-BR7, AC1-AC6, NFR2, NFR3, NFR5.
- **Dependências:** T-10, T-11, T-12, T-13, T-14.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`, `src/index.css`.
- **Critérios de aceite:**
  - O fluxo visual é idle -> busca -> resultados -> seleção -> forecast.
  - O nome e contexto da cidade permanecem visíveis junto ao forecast.
  - A UI usa elementos semânticos, foco visível e contraste legível em mobile
    e desktop.
  - A previsão usa layout responsivo com cinco cartões estáveis.
  - Nenhuma chave ou segredo é necessário no bundle do cliente.

### T-15A — Refinar direção visual e hierarquia da interface

- **Tipo:** UI
- **Descrição:** Modernizar a apresentação com linguagem atmosférica suave,
  superfícies glass menos genéricas, hierarquia mais sofisticada e paleta com
  acentos contextuais para clima, métricas e estados.
- **Requisitos:** RF4, RF5, RF7, RF8, US1, US4, AC2, AC3, AC5, AC6, NFR2,
  NFR3.
- **Dependências:** T-13, T-14, T-15.
- **Arquivos prováveis:** `src/App.tsx`, `src/index.css`,
  `tailwind.config.js`, `src/components/CurrentWeather.tsx`,
  `src/components/ForecastDay.tsx`, `src/components/DailyForecast.tsx`,
  `src/components/SearchForm.tsx`, `src/components/LocationResults.tsx`,
  `src/components/FeedbackState.tsx`, `src/components/UnitToggle.tsx`.
- **Critérios de aceite:**
  - A primeira dobra em mobile e desktop comunica ação de busca, cidade quando
    selecionada, temperatura e condição sem sobreposição.
  - O cartão de clima atual tem maior peso visual que previsão e métricas
    secundárias, sem parecer uma landing page.
  - A previsão mantém cartões de tamanho estável em `grid` responsivo e leitura
    rápida dos cinco dias.
  - A paleta mantém base escura com acentos contextuais de ciano, âmbar e
    verde-água, evitando aparência monocromática.
  - Textos essenciais e foco visível preservam contraste AA em superfícies
    translúcidas.
  - Cartões e painéis respeitam raio de até 8px, salvo exceção justificada pelo
    sistema visual existente.

### T-15B — Aplicar iconografia funcional nos fluxos principais

- **Tipo:** UI
- **Descrição:** Incorporar os ícones do sistema visual em busca, resultados,
  clima atual, previsão, alternância de unidade e estados de feedback, mantendo
  rótulos textuais e semântica acessível.
- **Requisitos:** RF1, RF2, RF4, RF5, RF6, RF7, RF8, AC1-AC6, NFR2, NFR3.
- **Dependências:** T-13A, T-15A.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`,
  `src/components/LocationResults.tsx`, `src/components/CurrentWeather.tsx`,
  `src/components/ForecastDay.tsx`, `src/components/FeedbackState.tsx`,
  `src/components/UnitToggle.tsx`.
- **Critérios de aceite:**
  - Botão de busca usa `Search`; loading usa `LoaderCircle`; retry usa
    `RefreshCcw`; erro usa `AlertCircle`.
  - Resultados de localidade usam `MapPin` e mantêm país/região em hierarquia
    secundária legível.
  - Clima atual e previsão exibem ícone de condição junto ao rótulo textual.
  - Temperatura, sensação térmica, umidade, vento e precipitação usam ícones
    específicos sem substituir seus rótulos.
  - Ícones puramente decorativos ficam com `aria-hidden="true"` e não criam
    anúncios duplicados.
  - Nenhum controle fica dependente apenas de ícone para comunicar ação ou
    estado.

### T-15C — Implementar suavidade visual e motion acessível

- **Tipo:** UI / Hardening
- **Descrição:** Adicionar microinterações discretas para hover, foco,
  carregamento, entrada de painéis e troca de unidade, respeitando
  `prefers-reduced-motion` e evitando deslocamento de layout.
- **Requisitos:** RF6, RF7, AC4, AC5, NFR1, NFR2, NFR3.
- **Dependências:** T-15A, T-15B.
- **Arquivos prováveis:** `src/index.css`, `tailwind.config.js`,
  `src/components/SearchForm.tsx`, `src/components/FeedbackState.tsx`,
  `src/components/UnitToggle.tsx`, `src/components/CurrentWeather.tsx`,
  `src/components/ForecastDay.tsx`.
- **Critérios de aceite:**
  - Hover, focus, entrada de painéis e troca de unidade usam transições entre
    150ms e 220ms.
  - Loading pode usar rotação apenas quando `prefers-reduced-motion` permitir.
  - Com redução de movimento ativa, não há translação nem rotação contínua.
  - A troca C/F não altera dimensões dos cartões nem provoca salto visual dos
    valores de temperatura.
  - Estados dinâmicos continuam anunciados pelas live regions definidas nas
    tarefas de acessibilidade.

### T-16 — Testar componentes e integração de apresentação

- **Tipo:** Test
- **Descrição:** Cobrir componentes com Testing Library usando queries
  acessíveis e services/hook mockados.
- **Requisitos:** RF2, RF4, RF5, RF6, RF7, RF8, RF9, AC1-AC6, NFR3, NFR7.
- **Dependências:** T-10, T-11, T-12, T-13, T-14, T-15, T-15A, T-15B,
  T-15C.
- **Arquivos prováveis:** `tests/unit/SearchForm.test.tsx`,
  `tests/unit/LocationResults.test.tsx`, `tests/unit/WeatherDisplay.test.tsx`,
  `tests/unit/FeedbackState.test.tsx`, `tests/unit/UnitToggle.test.tsx`.
- **Critérios de aceite:**
  - Há cobertura de loading, vazio, erro, sucesso e campos ausentes.
  - A seleção de homônimos exibe região/país e funciona por teclado.
  - O clima atual e os cinco dias aparecem com labels esperados.
  - O alternador muda os valores exibidos sem nova chamada mockada.
  - Os testes usam roles e labels, não classes CSS ou detalhes internos.
  - Ícones funcionais não removem labels acessíveis nem criam anúncios
    duplicados para condições, métricas e estados.

### T-16A — Validar critérios UX visuais e responsivos

- **Tipo:** Test / Review
- **Descrição:** Verificar manualmente e por testes automatizados os critérios
  UX da modernização visual em desktop e mobile, incluindo primeira dobra,
  contraste, estabilidade de layout e redução de movimento.
- **Requisitos:** US1, US4, RF4, RF5, RF7, RF8, AC2-AC6, NFR1, NFR2, NFR3,
  NFR7.
- **Dependências:** T-16, T-17.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, documentação de
  validação no resultado da tarefa ou checklist de revisão.
- **Critérios de aceite:**
  - Desktop e mobile mostram cidade, temperatura, condição e ação principal na
    primeira dobra, sem texto ou elementos sobrepostos.
  - Toda métrica meteorológica relevante tem ícone contextual e rótulo textual.
  - Loading, erro, vazio e seleção são distinguíveis por texto, ícone e
    hierarquia visual.
  - A troca C/F não dispara nova requisição, não desloca cartões e mantém
    largura visual estável para temperaturas.
  - A verificação registra evidência de contraste, foco visível e comportamento
    com `prefers-reduced-motion`.

## Entrega 6 — Fluxos E2E e hardening

### T-17 — Criar cenários E2E com interceptação da Open-Meteo

- **Tipo:** Test
- **Descrição:** Implementar jornadas determinísticas de busca, seleção,
  forecast, erro, retry, unidade e validação nos projetos desktop e mobile.
- **Requisitos:** RF1-RF9, BR1-BR7, AC1-AC6, NFR2, NFR3, NFR4, NFR7.
- **Dependências:** T-15C, T-16.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`,
  `playwright.config.ts` se necessário.
- **Critérios de aceite:**
  - O fluxo feliz valida resultados, cidade selecionada, clima atual e
    exatamente cinco dias.
  - O fluxo de homônimos valida região/país no resultado e no cabeçalho.
  - Busca inexistente não exibe dados da busca anterior.
  - Falhas de geocoding e forecast exibem erro e retry recupera o fluxo.
  - C/F altera as temperaturas sem nova requisição interceptada.
  - Submit vazio/curto não dispara rota de API.
  - Há validação de teclado e pelo menos um cenário no viewport mobile.
  - O cenário mobile valida que a modernização visual não causa sobreposição na
    primeira dobra nem perda de rótulos acessíveis.

### T-18 — Executar hardening de qualidade e compatibilidade

- **Tipo:** Infra
- **Descrição:** Verificar acessibilidade básica, concorrência, responsividade,
  contratos de build e ausência de segredos antes da entrega.
- **Requisitos:** NFR1, NFR2, NFR3, NFR4, NFR5, NFR6, NFR7.
- **Dependências:** T-04, T-07, T-09, T-16, T-16A, T-17.
- **Arquivos prováveis:** `src/**`, `tests/**`, configurações somente quando
  um erro reproduzível exigir ajuste.
- **Critérios de aceite:**
  - `pnpm lint` conclui sem erros.
  - `pnpm build` conclui em modo strict sem erros de TypeScript.
  - `pnpm test` conclui com todos os testes unitários e de componentes.
  - `pnpm test:e2e` conclui nos projetos configurados ou registra claramente
    uma limitação ambiental reproduzível.
  - O fluxo de busca e renderização inicial é medido em condição de rede
    4G estável e atende ao limite de 2 segundos definido em NFR1; a medição e
    o ambiente usado ficam registrados no resultado da validação.
  - A conversão de unidade é verificada sem nova chamada de rede e sem
    mutação dos dados canônicos.
  - Não há chamadas reais à Open-Meteo nos testes automatizados.
  - Uma nova busca não permite que resposta obsoleta sobrescreva a tela.
  - A camada visual final preserva contraste, foco visível, responsividade,
    iconografia textualizada e redução de movimento.

### T-19 — Consolidar documentação operacional da entrega

- **Tipo:** Infra
- **Descrição:** Atualizar a documentação mínima para explicar como executar,
  testar e entender os limites do MVP implementado.
- **Requisitos:** NFR4, NFR5, NFR7, Out of Scope.
- **Dependências:** T-18.
- **Arquivos prováveis:** `README.md`.
- **Critérios de aceite:**
  - O README documenta `pnpm install`, desenvolvimento, build e testes.
  - O uso da Open-Meteo e a ausência de API key são explícitos.
  - O documento registra que não há autenticação, persistência, favoritos ou
    geolocalização automática no MVP.
  - O README não descreve comportamento diferente do código e do plano.

## Ordem de execução resumida

```text
T-01 -> T-02 -> T-03 -> T-04
T-01 -> T-05 -> T-06 -> T-07
T-05 + T-06 -> T-08 -> T-09
T-08 -> T-10 + T-11 + T-12
T-12 -> T-12A + T-12B + T-12C
T-02 + T-04 -> T-13A
T-02 + T-06 + T-13A -> T-13 -> T-14
T-10 + T-11 + T-12 + T-12A + T-12B + T-12C + T-13 + T-14 -> T-15
T-15 -> T-15A -> T-15B -> T-15C -> T-16
T-15C + T-16 -> T-17 -> T-16A
T-04 + T-07 + T-09 + T-16 + T-17 + T-16A -> T-18 -> T-19
```