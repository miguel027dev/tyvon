# TYVON como aplicativo — experiência inicial e treino acompanhado

## Entrega implementada

- Registro apresenta personalização como caminho para a primeira ficha; conversar com a IA deixa de ser requisito do onboarding.
- Personalização em cards: nome, idade, dados corporais opcionais, objetivo, experiência, equipamentos, dias, duração e restrições. Voltar, editar e revisar antes de concluir.
- “Pular dados corporais” preserva altura/peso como ausentes (`null`). O backend aceita perfil completo sem esses dados e continua validando os valores informados. Idade mínima e proteção de menores permanecem.
- Ao concluir, abre o Início com o treino em destaque, sem uma segunda apresentação bloqueando o primeiro treino.
- Fichas e sessão compartilham detalhes de equipamento, aquecimento, execução, séries principais, repetições/tempo, descanso, esforço RIR e orientação de registro. A dica técnica continua vindo da biblioteca de exercícios existente; não foram inventadas prescrições por IA.
- Chat acompanha exercício e série. “Estou na série 2” seleciona sem concluir; “fiz 2ª série com20kg10reps” registra. Carga e repetições precisam ser informadas, sem preencher automaticamente um desempenho real com o alvo planejado.
- Correção substitui a série correspondente; desfazer remove a última; nomes ambíguos pedem identificação. Progresso, descanso e registro anterior aparecem em card contextual.
- Exercícios por tempo gravam unidade `seconds`, inclusive no banco, em vez de tratar duração como repetições. Migration010 adiciona a unidade e identifica pranchas históricas; valores que já foram truncados em versões anteriores não podem ser recuperados.
- Retentativa de salvamento mantém o ID e atualiza o conteúdo corrigido, sem duplicar treino ou reutilizar dados de outra sessão.
- Rascunho em andamento continua persistido por conta/aparelho. O treino do chat não começa uma segunda sessão enquanto uma ficha guiada está em andamento.
- Ajustes para teclado e telas pequenas: composição de texto não envia prematuramente, viewport com safe areas e controles de toque maiores. O chat usa a altura do viewport visível.

## Validação

34 testes JavaScript e 36 testes Python aprovados (70 no total), build de produção aprovado, compilação Python e `git diff --check` aprovados. Os dez passos do onboarding renderizados via React SSR com altura/peso ausentes. Os testes cobrem seleção sem conclusão, carga/reps explícitas, correção, desfazer, ambiguidade, segundos, finalização completa e retentativa com registro atualizado.

Limites: não houve teste autenticado ponta a ponta em dispositivo Android físico nesta entrega. O bundle principal continua acima de 500 kB; divisão adicional de código é uma melhoria de desempenho pendente. O rascunho local expira após 24 horas e não sincroniza sessão em andamento entre aparelhos. A conversa aceita os comandos testados e exemplos exibidos; não interpreta toda forma possível de linguagem natural.

## Próxima etapa para Play Store

O repositório contém um projeto Android baseado em WebView. Esta entrega melhora a aplicação que ele carrega; não gera AAB assinado nem publica na Play Store.

| Prioridade | Verificação necessária no pacote Android |
| --- | --- |
| P0 | Login Google: o projeto atual permite navegação Google dentro da WebView. Implementar e testar um fluxo de autenticação suportado, com retorno e sessão corretos. |
| P0 | Android 15/SDK35: validar edge-to-edge, teclado, barras do sistema e controles em aparelhos pequenos. O CSS web sozinho não valida os insets nativos. |
| P0 | Testar retomada após bloquear tela, voltar de outro app e encerramento do processo; conferir séries, descanso e salvamento. |
| P1 | Conferir exclusão de conta e dados pelo app e pelo recurso web, incluindo sessão revogada e perfil não restaurado. |
| P1 | Gerar build release assinado, testar instalação/atualização e preencher informações da loja de acordo com as funcionalidades reais. |

Fontes oficiais para essa etapa:

- Android: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Estado e processo: https://developer.android.com/topic/libraries/architecture/saving-states
- Google Identity: https://developers.google.com/identity/siwg/best-practices
- Google Play, exclusão: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en

O objetivo de produto é diminuir o esforço até o primeiro treino e dar motivos concretos para voltar: ficha clara, registro confiável e progresso pessoal visível. Viralidade e retenção precisam ser medidas; não são garantidas por uma interface ou por uma lista de recursos.
