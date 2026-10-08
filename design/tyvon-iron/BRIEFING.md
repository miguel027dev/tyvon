# TYVON — Iron / briefing de produto

8 de outubro de 2026. Direção: musculação e bodybuilding old school.

## Promessa
Seu treino. Cada série conta. Um caderno de treino contemporâneo: abrir a ficha, executar, registrar e comparar o próprio desempenho. O treinador é apoio contextual, não a porta de entrada obrigatória.

## Identidade
Símbolo: pessoa no supino, barra com anilhas, banco e apoios. Não usar corredores, raios ou robôs como marca principal. As marcações numéricas remetem à ficha de academia; uma linha cobre indica a ação corrente. Grafite fosco, papel quente e cobre; sem vidro translúcido como base da interface.

## Linguagem
Direta, técnica e respeitosa. “Começar treino”, “Registrar série”, “Séries válidas”, “Última carga”. Nunca humilhar iniciantes, prometer resultados corporais ou impor falha muscular universal. Old school é identidade visual e foco, não licença para prescrição imprudente.

## Paleta
| Papel | Cor |
|---|---|
| Ferro / fundo | #10110F |
| Superfície | #1B1D19 |
| Linha | #363A32 |
| Papel / texto | #F2EEE5 |
| Secundário | #BABCB2 |
| Cobre / ação | #D99564 |
| Confirmação | #B1C78F |
| Atenção | #F2BB86 |

## Tipografia
Interface: sans-serif de sistema (Android sans-serif; web system-ui). Cabeçalhos: sans-serif-condensed no Android; sans-serif pesada no web, sem dependência remota. Números: tabulares/monoespaçados. Hierarquia 32/24/18/16/14 sp; texto auxiliar nunca deve ser a única forma de entender uma ação. Títulos de marca não substituem rótulos acessíveis.

## Dispositivos
Espaçamento 4/8/12/16/24/32. Margem de conteúdo 20 dp em telefone; conteúdo centralizado com máximo 720 dp no Android e painéis em colunas no web largo. Alvos de toque mínimos 48 dp. Bordas de cards 12–18 dp. Respeitar status bar, recorte, navegação por gestos e teclado. Fonte ampliada deve aumentar linhas e altura, sem truncar comandos essenciais. Treino e formulários devem rolar em aparelhos pequenos e orientação horizontal.

## Fluxos essenciais
Conta → perfil → ficha → sessão → série → descanso → conclusão confirmada pelo servidor → evolução → compartilhamento voluntário. Login por e-mail no cliente nativo; Google segue disponível no web. Recuperação abre o fluxo web de forma explícita.

## Metodologia observada no código
Motor determinístico Python/JavaScript. Idade define política conservadora de 14–17 anos; objetivo define faixa de repetições; experiência define séries/RIR; equipamentos definem seleção; dias definem divisão; duração limita número de movimentos. Peso/altura são contexto, não cálculo de carga. Restrições geram alertas, não uma seleção clínica de exercícios. A ficha não é criada por uma LLM. O chat chama o motor em pedidos de ficha e o provedor NVIDIA em dúvidas gerais.

Adultos: 2 dias corpo inteiro; 3 Push/Pull/Pernas; 4 superiores/inferiores; 5 PPL + superiores/inferiores. O README anterior afirmava corpo inteiro em 3 dias, divergindo do motor; corrigir documentação. Não é uma implementação de Heavy Duty ou programa de baixo volume puro.

Progressão web: histórico real de pelo menos duas séries comparáveis, topo da faixa e RIR suficiente; somente adultos intermediários/avançados sem restrição. Não extrapolar recordes, usar peso corporal para adivinhar carga ou preencher esforço desconhecido.

## Produção / critérios
Persistência com revisão If-Match; 409 exige reconciliar dados antes de regravar. Conclusão não confirma antes do servidor. Rascunho deve sobreviver a fechamento. Sem segredos do provedor no APK. Sessão nativa protegida por Android Keystore; HTTPS obrigatório, backup desativado. Compartilhamento não inclui e-mail, idade, peso, restrições ou conversa.

## Limites a validar
Cronometragem estimada do motor é simplificada: não modela todo descanso/aquecimento. Restrições não tornam a ficha terapeuticamente personalizada. Snapshot de conta ainda tem limite de 500 logs/1 MB. Aprovação de produção exige percurso autenticado real, teste em aparelhos, recuperação de e-mail e assinatura de distribuição definida. Não declarar certificação médica, pentest ou desempenho medido sem evidência.
