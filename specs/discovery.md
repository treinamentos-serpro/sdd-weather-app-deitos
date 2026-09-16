# Discovery — Weather App

## Contexto

Aplicação web para consultar rapidamente as condições meteorológicas de uma
cidade e planejar os próximos dias. A experiência deve funcionar bem em
dispositivos móveis, com uma interface visual em tema dark glassmorphism.

## Objetivo

Permitir que uma pessoa busque uma cidade, consulte o clima atual e veja a
previsão dos próximos cinco dias, escolhendo entre Celsius e Fahrenheit sem
precisar de cadastro ou chave de API.

## Requisitos Funcionais

- **RF1 — Buscar cidade:** permitir a busca de cidades por nome.
- **RF2 — Resolver localização:** usar o resultado da busca para identificar a
  cidade e suas coordenadas geográficas antes de consultar a previsão.
- **RF3 — Exibir clima atual:** apresentar a condição atual da cidade selecionada
  e os dados meteorológicos definidos na especificação detalhada.
- **RF4 — Exibir previsão:** apresentar a previsão meteorológica de cinco dias
  para a cidade selecionada.
- **RF5 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit,
  atualizando os valores de temperatura exibidos.
- **RF6 — Tratar estados da interface:** representar os estados inicial/vazio,
  carregando e erro, incluindo uma ação de nova tentativa quando aplicável.
- **RF7 — Identificar a cidade:** exibir o nome da cidade selecionada e contexto
  suficiente para diferenciá-la de cidades homônimas.

## Requisitos Não Funcionais

- **RNF1 — Responsividade:** adotar abordagem mobile-first e manter a interface
  utilizável em telas pequenas e desktop.
- **RNF2 — Acessibilidade:** oferecer navegação por teclado, labels semânticos,
  foco visível e contraste adequado.
- **RNF3 — Aparência:** aplicar tema dark glassmorphism de forma consistente,
  sem comprometer legibilidade ou interação.
- **RNF4 — Performance:** exibir feedback imediato durante buscas e carregamento
  dos dados, evitando bloquear a interface.
- **RNF5 — Resiliência:** lidar com falhas de rede, respostas inválidas e
  indisponibilidade da API com mensagens compreensíveis.
- **RNF6 — Segurança operacional:** não expor nem exigir chave de API no
  cliente, usando a Open-Meteo como fonte pública.
- **RNF7 — Qualidade:** cobrir regras de apresentação e transformação de dados
  com Vitest e validar os fluxos principais com Playwright.

## Integrações Conhecidas

- Open-Meteo, sem API key, para geocoding e dados de previsão meteorológica.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação inicial |
| --- | --- | --- | --- |
| Cidade com nome ambíguo ou homônimo | Alta | Alto | Exibir país/região nas opções de resultado e exigir uma seleção clara. |
| Open-Meteo indisponível ou limitando requisições | Média | Alto | Tratar erro, oferecer retry e evitar requisições redundantes. |
| Usuário busca um nome inexistente | Média | Médio | Exibir estado vazio específico, sem apresentar dados de outra cidade. |
| Conversão Celsius/Fahrenheit incorreta | Baixa | Alto | Centralizar a conversão em função pura e cobri-la com testes unitários. |
| Interface glassmorphism com baixo contraste | Média | Alto | Validar contraste, foco e legibilidade em diferentes tamanhos de tela. |
| Previsão de cinco dias interpretada de formas diferentes | Média | Médio | Definir explicitamente no contrato se o dia atual está incluído. |
| Rede lenta ou instável em dispositivos móveis | Média | Médio | Mostrar loading, preservar contexto da cidade e permitir nova tentativa. |

## Decisões de Produto para v1

- **D1 — Fonte de dados:** usar Open-Meteo como única fonte, com geocoding e
  previsão meteorológica, sem exigir chave de API do cliente.
- **D2 — Definição de “5 dias”:** a previsão cobre o dia atual mais os quatro
  dias seguintes, mantendo a consistência com a API e com a narrativa da UI.
- **D3 — Unidade padrão:** a aplicação inicia em Celsius e permite alternar para
  Fahrenheit sem exigir qualquer configuração prévia do usuário.
- **D4 — Busca e desambiguação:** a busca ocorre em resposta ao envio da
  consulta ou ao debounce de entrada; enquanto o usuário digita, a interface pode
  sugerir resultados, mas a cidade correta só fica confirmada após seleção
  explícita em caso de homônimos.
- **D5 — Estado persistente:** a primeira versão não mantém histórico, favoritos
  nem a última cidade entre sessões; a experiência é funcional e simples.
- **D6 — Geolocalização automática:** opcional e não obrigatória para a v1; a
  busca manual é o caminho principal.
- **D7 — Idioma da interface:** a experiência é entregue em pt-BR como padrão;
  suporte adicional para outros idiomas é considerado melhoria futura.
- **D8 — Compatibilidade:** foco em navegadores modernos e em dispositivos
  móveis/desktop atuais, sem requisito de suporte retroativo para versões muito
  antigas.

Essas decisões resolvem as ambiguidades de produto mais relevantes para a
implementação inicial, especialmente a definição do contrato de previsão, a
unidade padrão e o fluxo para cidades ambíguas.

## Perguntas em Aberto e Decisões

1. **Quais métricas devem aparecer no clima atual e na previsão diária?**
   - **Decisão:** no clima atual, exibir temperatura atual, sensação térmica,
     condição climática, umidade, velocidade do vento e precipitação.
   - Na previsão diária, exibir data, condição, temperatura mínima e máxima,
     precipitação e intensidade do vento.
   - **Justificativa:** essas métricas cobrem a necessidade básica de planejar o
     dia e decidir roupas, deslocamentos e atividades sem sobrecarregar a tela.

2. **O produto precisa de suporte a localização automática por geolocalização do
   navegador?**
   - **Decisão:** não é requisito do MVP; a busca manual será o caminho principal.
   - **Justificativa:** há mais valor em reduzir complexidade e acelerar o
     lançamento do produto, deixando a geolocalização como melhoria futura.

3. **Há necessidade de persistência local leve, como a última cidade consultada?**
   - **Decisão:** não haverá persistência no MVP.
   - **Justificativa:** a versão inicial prioriza simplicidade e rapidez de uso;
     a última cidade consultada e preferências de unidade podem entrar em uma
     evolução posterior.

4. **O app deve ser expandido para i18n em uma fase seguinte?**
   - **Decisão:** foco em pt-BR na v1; suporte a outros idiomas fica como
     etapa posterior, dependendo de demanda e validação do mercado.
   - **Justificativa:** a aplicação é orientada ao público local do treinamento,
     e o foco deve estar na experiência principal e na qualidade da entrega.

## Personas

### 1) Usuário casual
- **Perfil:** pessoa que quer saber rapidamente o clima da sua cidade para
  planejar o dia e decidir o que vestir.
- **Contexto de uso:** majoritariamente mobile, em momentos curtos e repetidos,
  como ao sair de casa ou no caminho para o trabalho.
- **Objetivo principal:** consultar clima atual e previsão curta com baixa
  fricção, sem precisar configurar nada.
- **Critério de sucesso:** encontrar a cidade em que está localizado em poucos segundos,
  entender rapidamente a condição do clima e alternar unidade quando necessário.

### 2) Turista
- **Perfil:** viajante que deseja saber como será o clima em uma cidade que
  pretende visitar ou na qual já está hospedado.
- **Contexto de uso:** busca por cidades diferentes, em mobile e em desktop,
  especialmente antes da viagem ou ao planejar atividades diárias.
- **Objetivo principal:** comparar clima de destino com a realidade local,
  entender a previsão dos próximos dias e tomar decisões de passeio.
- **Critério de sucesso:** localizar a cidade destino com precisão, ver a
  previsão dos próximos dias e distinguir claramente o contexto regional da
  cidade buscada.

### 3) Usuário institucional
- **Perfil:** profissional de uma organização que precisa saber o clima em uma
  localidade para planejar atividades externas, logística ou operações de campo.
- **Contexto de uso:** pode usar o produto em desktop durante o planejamento,
  olhando para um local específico com atenção à previsão e às condições mais
  relevantes para a operação.
- **Objetivo principal:** verificar rapidamente as condições climáticas de um
  local e decidir se a atividade pode ocorrer como planejado.
- **Critério de sucesso:** ter confiança na cidade selecionada, ver a previsão
  de forma clara e utilizar as informações para apoiar uma decisão operacional.

## Suposições Iniciais

- O uso é anônimo e não exige autenticação.
- A aplicação depende de conexão com a internet para obter dados atualizados.
- A Open-Meteo fornece os endpoints de geocoding e forecast necessários sem
  proxy ou backend próprio na primeira versão.
- A primeira versão terá uma cidade selecionada por vez.
- O foco da primeira versão é consulta, sem favoritos, alertas ou histórico.
- O idioma principal da interface será pt-BR, salvo decisão posterior de
  internacionalização.

## Critério de Pronto para a Próxima Fase

As decisões principais do produto já foram fechadas e não devem bloquear a
especificação detalhada: definição de “5 dias”, unidade padrão, métricas
exibidas, fluxo de cidades homônimas, ausência de geolocalização e de
persistência no MVP e idioma principal em pt-BR. A próxima etapa pode avançar
com segurança para a criação da especificação funcional e dos critérios de
aceite.