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

## Perguntas em Aberto

1. A previsão de cinco dias inclui o dia atual ou representa os cinco dias
   seguintes?
2. Quais métricas devem aparecer no clima atual: apenas temperatura e condição,
   ou também umidade, vento, pressão e precipitação?
3. Quais métricas devem aparecer em cada dia da previsão, além das temperaturas
   mínima e máxima?
4. A unidade padrão inicial deve ser Celsius ou deve seguir a preferência do
   navegador/usuário?
5. A busca deve consultar a API a cada digitação ou somente após submissão,
   usando sugestões enquanto o usuário escreve?
6. Como o usuário escolhe entre cidades homônimas: lista de sugestões,
   confirmação ou outro fluxo?
7. A interface deve oferecer localização automática pelo navegador?
8. A aplicação precisa manter a última cidade ou unidade selecionada entre
   sessões?
9. Quais idiomas, além de pt-BR, precisam ser suportados?
10. Há requisitos de compatibilidade com navegadores ou versões mínimas de
    dispositivos?

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

Antes de produzir a especificação detalhada, devem ser decididas as perguntas
que alteram o contrato da API ou o comportamento principal da interface,
especialmente a inclusão do dia atual, as métricas exibidas, a unidade inicial
e o fluxo para cidades ambíguas.