# TYVON — auditoria da identidade visual e prescrição de treinos

**Data:** 8 de outubro de 2026. **Escopo:** inspeção estática da branch `main` de `miguel027dev/tyvon`; não inclui execução autenticada no Render nem análise de dados pessoais dos usuários.

## Identidade visual

- `public/brand/tyvon-logo.png` tem extensão PNG, mas o conteúdo original é JPEG (1536 × 1536), com fundo preto incorporado e muita margem. A antiga interface usava `mix-blend-mode: screen` para esconder o retângulo preto — resultado frágil sobre superfícies cinza e glass.
- A correção desta branch adiciona `public/brand/tyvon-logo-transparent.svg`, que preserva os pixels/contornos do wordmark original, aplica transparência baseada na luminância do original e recorta as margens. `Logo.jsx`, guia de marca e CSS passam a usar esse recurso, sem `mix-blend-mode`.
- `public/brand/tyvon-mark.svg` já utiliza SVG vetorial sem fundo. `public/brand/tyvon-bot-poster.png` é PNG RGBA, mas o canal alfa precisa ser confirmado por inspeção visual em fundos contrastantes antes de afirmar ausência total de preto. O mascote 3D usa WebGL com `alpha: true`.
- `public/gym.jpg` é foto de ambientação da entrada, não um logo recortável: não remover o fundo da imagem hero indiscriminadamente. Cards compartilhados geram suas próprias composições e os fundos são deliberados.
- **Validação pendente:** inspecionar a nova assinatura sobre fundo preto, grafite e glass; testar em Chromium/WebView Android e em telas pequenas.

## Motor de treino — comportamento efetivo

| Entrada | O que altera hoje | Lacuna |
| --- | --- | --- |
| Idade | Usuários de 14–17 anos: até 3 sessões full body, menor número de séries e margem de repetições maior; progressão automática desligada | A idade deve ser verificada de ponta a ponta para garantir essas salvaguardas |
| Dias/semana | Adultos 2: full body A/B; 3: Push/Pull/Pernas; 4: Upper/Lower A/B; 5: P/P/L/Upper/Lower | README dizia que 3 dias eram full body; documentação corrigida nesta branch |
| Objetivo | Muda principalmente faixas de repetições e intervalos | Pouca diferenciação na seleção de movimentos |
| Experiência | Muda séries, RIR e disponibilidade de sugestão de carga | Não há seleção estruturada de microciclos nem gestão individual de fadiga |
| Equipamentos | Seleciona alternativas existentes na biblioteca local | Substituição para máquina ocupada durante sessão ainda não é um fluxo próprio |
| Tempo disponível | Limita número de exercícios (5–9 para adultos; 5–6 para menores) | Duração exibida não calcula tempo real de séries, aquecimento e descanso |
| Altura/peso | Persistidos e encaminhados como contexto à IA | Não entram no algoritmo determinístico de ficha |
| Restrições | Adiciona alerta e desativa progressão em alguns casos | Não remove ou substitui movimentos automaticamente; requer validação profissional |

Fonte: `shared/workouts.js`, `backend/workouts.py`, `src/logic.js`, `backend/chat.py`.

### Prioridades para corrigir antes de análises de treino mais avançadas

**P0 — integridade de séries no treino guiado:** Em `src/WorkoutSession.jsx`, `toggle()` aceita repetições vazias e escreve o alvo planejado como repetições realizadas. `buildLog()` também possui fallback ao alvo. Adicionalmente, `previousSetDefaults()` preenche repetições anteriores, o que pode ser confundido com execução atual. **Aceite:** concluir uma série deve exigir confirmação explícita do valor efetivamente realizado, diferenciar valores sugeridos de valores confirmados, e nunca gerar dados de desempenho sintéticos. Testar repetição/tempo, histórico antigo, campos limpos e persistência.

**P1 — limitações e lesões:** Informar uma restrição não altera seleção de exercícios. **Aceite:** quando houver risco ou informação insuficiente, não prescrever substituições específicas automaticamente; exibir aviso e oferecer edição guiada com orientação profissional.

**P1 — duração realista:** `minutes = min(sessionMinutes, max(35, exercises.length*7))`. **Aceite:** estimar usando aquecimento, séries, descansos e transições, e permitir um plano que de fato caiba no tempo.

**P1 — adaptação verdadeira:** `suggestedLoadForExercise()` sugere carga para certos adultos com pelo menos duas séries comparáveis e RIR registrado, mas o split e a seleção não mudam com o histórico. **Aceite:** separar adaptação da ficha de sugestões de carga; trabalhar apenas com registros confirmados, permitir ignorar sugestões, considerar recuperação e preservação de restrições; não automatizar progressão para menores.

**P2 — consistência entre motores:** motor duplicado em JS e Python. **Aceite:** testes de paridade automatizados cobrindo frequência, nível, equipamento, tempo, objetivo, idade e restrições.

**P2 — IA vs motor:** `backend/chat.py` resolve pedidos de treino por palavras-chave via motor determinístico; outras perguntas usam NVIDIA LLM. Isso garante plano-base, mas não configura planejamento individual por um treinador autônomo. **Aceite:** diferenciar respostas explicativas de alterações reais de ficha e nunca indicar persistência sem resposta bem-sucedida da API.

## Limites desta auditoria

A inspeção cobriu o código e os ativos do GitHub, não a distribuição estatística de fichas de usuários reais, logs de treino nem uma execução ponta-a-ponta autenticada. Não houve alteração da prescrição ou dos registros existentes nesta branch: isso requer correções e testes funcionais específicos antes de publicar.
