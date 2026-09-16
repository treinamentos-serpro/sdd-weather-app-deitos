# Weather App — Especificação de Produto

## Overview

Aplicação web de previsão do tempo voltada a uso rápido e acessível em dispositivos móveis e desktop. O produto permite procurar uma cidade, confirmar a localidade correta quando houver ambiguidade, visualizar o clima atual e a previsão dos próximos cinco dias e alternar entre unidades de temperatura em Celsius e Fahrenheit.

A aplicação deve funcionar sem autenticação, sem chave de API do cliente e com dados obtidos publicamente pela Open-Meteo. A experiência principal é de consulta simples, com foco em clareza, velocidade e confiabilidade em cenários de uso cotidiano.

## Functional Requirements

- **RF1 — Busca de cidade:** o usuário deve poder informar um nome de cidade para iniciar a busca.
- **RF2 — Desambiguação de localização:** quando o nome da cidade for ambíguo, a aplicação deve apresentar opções com contexto suficiente para identificar a localidade correta, como país, estado ou região.
- **RF3 — Resolução de coordenadas:** após a seleção da cidade, o sistema deve identificar as coordenadas geográficas necessárias para consultar a previsão meteorológica.
- **RF4 — Clima atual:** a aplicação deve exibir o clima atual da cidade selecionada com informações relevantes para a decisão do usuário no dia.
- **RF5 — Previsão de cinco dias:** a aplicação deve exibir a previsão meteorológica para o dia atual e os quatro dias seguintes, em formato diário.
- **RF6 — Alternância de unidade:** o usuário deve poder alternar entre Celsius e Fahrenheit e visualizar todas as temperaturas atualizadas imediatamente.
- **RF7 — Estados da interface:** a aplicação deve expor estados claros de carregamento, erro, vazio e ausência de dados, com feedback legível para o usuário.
- **RF8 — Identificação visual da cidade:** a interface deve exibir o nome da cidade selecionada e o contexto geográfico que permita distinguir localidades homônimas.
- **RF9 — Validação de entrada:** buscas vazias ou inválidas não devem disparar consultas nem gerar estados inconsistentes.

## User Stories

- **US1 — Usuário casual:** Como usuário casual, quero consultar o clima da minha cidade para planejar meu dia sem precisar navegar em vários menus.
- **US2 — Turista:** Como turista, quero pesquisar uma cidade de destino para entender o clima dos próximos dias antes de sair para atividades.
- **US3 — Usuário institucional:** Como usuário institucional, quero verificar a previsão em uma localidade específica para apoiar decisões de logística e execução de atividades externas.
- **US4 — Usuário mobile:** Como usuário mobile, quero usar a aplicação em um celular com leitura simples e rápida, sem perder contexto da cidade consultada.
- **US5 — Usuário em rede instável:** Como usuário em rede instável, quero receber mensagens claras de erro e uma opção de nova tentativa quando a consulta falhar.
- **US6 — Usuário que prefere outra unidade:** Como usuário que prefere Fahrenheit, quero alternar a unidade para interpretar as temperaturas na escala que me é mais familiar.

## Acceptance Criteria

### AC1 — Busca e seleção de cidade
- Dado que o usuário digitou um nome de cidade válido, quando clicar em buscar ou confirmar a busca, então a aplicação deve apresentar uma lista de resultados compatíveis com o termo informado.
- Dado que a busca retornar mais de uma cidade com o mesmo nome, quando o usuário visualizar os resultados, então cada opção deve incluir contexto regional como país, estado ou região para facilitar a escolha.
- Dado que o usuário selecionar uma cidade da lista, quando os dados forem carregados, então a aplicação deve exibir o clima atual e a previsão da cidade escolhida.
- Dado que a cidade não existir ou não houver resultados, quando a busca for realizada, então a interface deve mostrar uma mensagem informativa de ausência de resultados sem exibir dados de outra localidade.

### AC2 — Clima atual
- Dada uma cidade válida selecionada, quando os dados forem carregados, então a aplicação deve exibir a temperatura atual, a sensação térmica, a condição climática, a umidade relativa, a velocidade do vento e a precipitação.
- Dado que algum campo de clima atual estiver ausente ou nulo, quando a resposta da API for processada, então a interface deve renderizar um valor neutro e legível, sem quebrar o layout.

### AC3 — Previsão de cinco dias
- Dada uma cidade válida selecionada, quando a previsão for carregada, então a aplicação deve exibir cinco entradas diárias, cobrindo o dia atual e os quatro dias seguintes.
- Cada entrada de previsão deve mostrar a data, a condição climática, a temperatura mínima, a temperatura máxima, a precipitação e a intensidade do vento.
- Dado que a previsão esteja em carregamento, quando a tela estiver pronta para renderizar os dados, então o usuário deve enxergar um indicador visual de carregamento.

### AC4 — Alternância de unidade
- Dado que a aplicação esteja exibindo temperaturas em Celsius, quando o usuário clicar na alternância para Fahrenheit, então todas as temperaturas de clima atual e previsão devem ser convertidas imediatamente sem nova consulta à API.
- Dado que a aplicação esteja exibindo temperaturas em Fahrenheit, quando o usuário alternar para Celsius, então todas as temperaturas devem ser convertidas de volta na mesma lógica.
- Dado que a conversão for aplicada, quando o usuário navegue em outros elementos da interface, então o valor exibido deve permanecer consistente com a unidade atualmente selecionada.

### AC5 — Estados de interface
- Dado que a busca esteja em andamento, quando o usuário enviar a consulta, então a aplicação deve mostrar um estado de carregamento explícito.
- Dado que a busca falhar por erro de rede ou indisponibilidade da API, quando a resposta for processada, então a aplicação deve mostrar uma mensagem de erro clara e uma ação de nova tentativa.
- Dado que o usuário limpar ou deixar o campo de busca vazio, quando a interação for disparada, então a aplicação não deve iniciar uma consulta e deve avisar visualmente que a busca precisa de um termo válido.

### AC6 — Cidade e contexto geográfico
- Dada uma cidade selecionada, quando a informação for exibida na interface, então o nome da cidade deve ser apresentado com o contexto regional adequado, especialmente quando houver homônimos.
- Dado que a cidade escolhida seja um caso ambíguo, quando o usuário confirmar a seleção, então a aplicação deve manter esse contexto explícito na interface até a próxima busca.

## Non-Functional Requirements

- **NFR1 — Performance:** a interface deve responder rapidamente às ações do usuário, com carregamento percebido como imediato e sem congelamento visual durante buscas ou conversões.
- **NFR2 — Responsividade:** a aplicação deve ser mobile-first e funcionar corretamente em pequenas telas, além de manter usabilidade em desktop.
- **NFR3 — Acessibilidade:** o produto deve oferecer navegação por teclado, labels semânticos, foco visível, contraste legível e estrutura semântica adequada para leitores de tela.
- **NFR4 — Resiliência:** em caso de falha de rede, retorno inválido da API ou indisponibilidade do serviço, a aplicação deve preservar a experiência do usuário e apresentar mensagens compreensíveis.
- **NFR5 — Segurança operacional:** a aplicação não deve exigir chave de API do cliente nem expor segredos de infraestrutura em front-end.
- **NFR6 — Manutenibilidade:** regras de conversão de temperatura e renderização devem ser centralizadas em funções puras e testáveis, reduzindo duplicidade e erros.
- **NFR7 — Qualidade:** a aplicação deve ser validada por testes unitários para regras de apresentação e conversão, e por testes end-to-end para os fluxos principais de busca e erro.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Campo de busca vazio | Não deve disparar consulta; deve orientar o usuário a informar um termo válido. |
| Cidade inexistente | Exibir estado vazio específico sem mostrar qualquer dado de outra cidade. |
| Cidade com homônimos | Exibir lista com contexto regional para permitir identificação correta. |
| Falha de rede | Mostrar erro amigável com ação de nova tentativa. |
| API indisponível | Manter a UI estável e comunicar o problema sem travar a experiência. |
| Resposta incompleta da API | Exibir valores em branco ou indicadores neutros sem quebrar o layout. |
| Busca com acentos ou caracteres especiais | Aceitar entradas normais e manter a busca funcional. |
| Troca de unidade durante carregamento | Manter consistência visual após o carregamento dos dados. |

## Assumptions

- O uso do produto é anônimo e não exige autenticação.
- A aplicação depende de conexão com a internet para obter dados atualizados.
- A Open-Meteo fornece os endpoints de geocoding e forecast necessários para a versão inicial.
- A versão inicial trabalha com uma cidade selecionada por vez, sem histórico persistente e sem favoritos.
- A aplicação será entregue em português do Brasil como idioma principal.
- A geolocalização automática não é requisito da primeira entrega.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Cidade ambígua ou com homônimos | Alta | Alto | Exibir contexto regional e exigir seleção explícita. |
| API indisponível ou com limite de requisições | Média | Alto | Mensagens de erro, retry e evitar chamadas redundantes. |
| Conversão de unidade incorreta | Baixa | Alto | Centralizar conversão em função pura e cobrí-la com testes. |
| Falha de rede no celular | Média | Médio | Mostrar estado de erro limpo e permitir nova tentativa. |
| Interface visual pouco legível em tema glassmorphism | Média | Alto | Validar contraste, foco e escalabilidade da UI. |
| Interpretação inconsistente de “5 dias” | Média | Médio | Definir o contrato de previsão como dia atual + quatro dias seguintes. |

## Out of Scope

- Autenticação e contas de usuário.
- Favoritos, histórico persistente e preferências salvas entre sessões.
- Geolocalização automática por navegador.
- Internacionalização para idiomas além de pt-BR.
- Alertas meteorológicos, notificações push ou planos premium.
- Integração com backend próprio ou infraestrutura de dados customizada.

## Open Questions

- Nenhuma questão bloqueante permanece após as decisões do discovery; as exigências principais do MVP foram fechadas e podem ser convertidas em especificação detalhada.
