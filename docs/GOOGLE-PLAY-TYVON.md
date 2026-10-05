# TYVON — guia de cadastro na Google Play Console

Preparado em 5 de outubro de 2026. Versão Android 1.2.0 (código 3). Este documento separa dados confirmados do código de decisões que só o titular da conta pode fornecer. Compilar um AAB não significa aprovação pela Google Play.

## 1. Ao clicar em “Criar app”

| Campo | Preencher |
|---|---|
| Nome do app | TYVON |
| Idioma padrão | Português (Brasil) — pt-BR |
| App ou jogo | App |
| Gratuito ou pago | Gratuito, conforme a versão atual sem cobrança implementada. Confirmar o modelo comercial antes de cadastrar: um app gratuito não pode depois virar um app pago com o mesmo cadastro. |
| Declarações obrigatórias | Ler e aceitar as políticas do programa, os termos aplicáveis e a declaração de exportação dos EUA, quando exibida. Essas declarações são do titular da conta. |

O nome não determina o identificador: o primeiro AAB enviado registra `com.tyvon.intelligence`. Se já existir app na Console, abrir esse app e conferir o package e a chave, em vez de criar outro. Esta entrega usa nova chave de upload para primeira publicação, diferente da antiga assinatura de testes. Uma instalação antiga pode precisar ser desinstalada, perdendo dados locais; a conta no servidor é independente.

## 2. Ficha da loja: textos para copiar

**Nome (até 30 caracteres):** TYVON

**Descrição breve (até 80 caracteres):** Treinos personalizados, sessões guiadas e histórico para acompanhar sua rotina.

**Descrição completa (até 4.000 caracteres):**

TYVON ajuda você a organizar uma rotina de treino e acompanhar sua evolução, respeitando seu ritmo.

Crie seu perfil com objetivo, experiência, frequência de treino e equipamentos disponíveis. O TYVON organiza um plano de exercícios e oferece sessões guiadas para você registrar séries, cargas, repetições e percepção de esforço.

No aplicativo, você pode:
• Consultar seu plano de treino.
• Seguir sessões guiadas e registrar seu desempenho.
• Acompanhar o histórico dos seus treinos.
• Conversar com o assistente TYVON AI sobre sua rotina.
• Atualizar seu perfil e acessar os controles de privacidade.
• Gerar cards com informações do seu progresso.

É necessário ter conexão com a internet e uma conta TYVON. Nesta versão Android, o acesso é por e-mail e senha.

O TYVON é destinado a pessoas com 14 anos ou mais. Adolescentes devem contar com acompanhamento de responsável e profissional qualificado. As respostas de inteligência artificial podem conter erros. O aplicativo não é um dispositivo médico e não oferece diagnóstico, tratamento ou prevenção de doenças. Antes de iniciar atividades físicas, procure orientação profissional, especialmente se houver dor, lesão ou limitação.

**Notas da versão 1.2.0:**
Interface integrada ao Android, abertura com a marca TYVON, navegação pelo botão Voltar, acesso por e-mail e senha e recuperação em falhas de conexão.

**Categoria:** Saúde e fitness.

**Tags sugeridas:** Exercícios / Fitness / Treino, escolhendo apenas as opções equivalentes disponíveis na Console.

**Site:** https://rep-kky9.onrender.com/

**Política de privacidade:** https://rep-kky9.onrender.com/privacidade

**Termos:** https://rep-kky9.onrender.com/termos

**Contato de suporte:** preencher com e-mail real monitorado pelo operador. Telefone é opcional. Não foi localizado endereço de suporte confirmado; não usar endereço inventado.

## 3. Imagens e materiais

- Ícone: PNG 512 × 512, máximo 1 MB. Usar `materiais-loja/icone-512.png`, derivado do símbolo já existente no projeto.
- Gráfico de destaque: PNG/JPEG 1024 × 500, sem transparência. Usar `materiais-loja/destaque-1024x500.png`.
- Capturas: no mínimo duas capturas reais do app para telefone; PNG/JPEG, dimensões entre 320 e 3840 px e lado maior no máximo duas vezes o menor. Para exposição em alguns formatos, preparar quatro capturas com pelo menos 1080 px e proporção 9:16 ou 16:9.
- Capturas web, montagens e ilustrações não comprovam funcionamento Android. As capturas de loja devem mostrar telas reais da versão publicada, sem dados pessoais de clientes e sem promessas de resultado.
- Vídeo promocional é opcional; adicionar apenas se houver vídeo público adequado.

## 4. Conteúdo do app e declarações

### Acesso ao app

Selecionar que parte ou toda a funcionalidade exige acesso. Criar uma conta de revisão própria, com e-mail/senha permanentes e perfil preparado. Informar login, senha, passos para acessar treinos/chat e qualquer restrição. Não usar credenciais pessoais nem conta que dependa de código que o revisor não consegue obter.

A validação desta entrega não usou uma conta autenticada fornecida pelo operador. Login real, sincronização, treino completo e exclusão precisam de teste com conta de revisão antes da produção.

### Anúncios

O código revisado não integra SDK de publicidade nem exibe anúncios: selecionar “Não” para esta versão. Reavaliar se a operação passar a mostrar anúncios dentro do conteúdo remoto.

### Público-alvo

O produto declara idade mínima de 14 anos. A Console usa faixas de idade: 13–15, 16–17 e 18+. A faixa 13–15 inclui usuários de 13 anos, que o produto não aceita. O titular deve alinhar público, verificação de idade, conteúdo e política antes de enviar; não marcar público infantil nem declarar exclusivamente adultos se o app continuar atendendo adolescentes. Classificação indicativa não é o mesmo que público-alvo.

### Classificação indicativa (IARC)

Responder o questionário com o conteúdo real. É um app de treino, sem mecânicas de jogo, apostas, violência ou conteúdo sexual identificados. O chat é com IA, não um chat público entre usuários. Informar o recurso de IA nos campos aplicáveis. A classificação final é produzida pelo questionário; não preencher uma classificação presumida.

### Apps de saúde

Declarar os recursos de atividades físicas/fitness e orientação de treino. Não declarar ausência de recursos de saúde: há idade, peso, histórico de exercício e limitações opcionais. Não declarar dispositivo médico nem diagnóstico. Conferir a declaração de apps de saúde e manter o aviso médico na ficha e na experiência.

### IA generativa

O chat produz respostas por IA. Conferir a política de conteúdo gerado por IA e oferecer denúncia/sinalização de conteúdo ofensivo dentro do aplicativo. Não foi identificado controle dedicado de denúncia na versão revisada; implementar e operar o canal antes de produção. O formulário LGPD não substitui esse recurso.

### Recursos especiais

A versão nativa solicita apenas INTERNET e ACCESS_NETWORK_STATE. Não usa localização, câmera, microfone, contatos, SMS, notificações, Advertising ID ou Health Connect. O seletor de arquivos e a gravação de cards não exigem acesso amplo ao armazenamento. O código nativo não inclui bibliotecas `.so`; requisitos de páginas de 16 KB para bibliotecas nativas próprias não se aplicam a este pacote.

## 5. Segurança dos dados — mapa para preencher

O app carrega o sistema web: os dados enviados pelo WebView contam para a declaração. A ausência de SDK de analytics no APK não significa ausência de coleta.

| Categoria da Console | Dados identificados | Finalidade / escolha |
|---|---|---|
| Informações pessoais | E-mail, nome, ID de usuário; idade e dados do perfil | Cadastro, autenticação, gestão da conta e personalização. E-mail/conta são necessários; revisar quais campos do perfil são opcionais. |
| Saúde e fitness | Peso, registros de exercícios, cargas, repetições, limitações/lesões voluntárias | Funcionalidade e personalização. Dados sensíveis opcionais devem ter consentimento adequado. |
| Mensagens / outros conteúdos gerados pelo usuário | Mensagens do chat e conteúdo livre do perfil | Funcionalidade de IA e histórico. Selecionar a categoria exata exibida na Console. |
| Atividade no app | Interações e histórico de treinos | Funcionalidade e histórico. Não declarar analytics sem conferir logs e fornecedores. |
| Diagnóstico / informações do dispositivo | IP e eventos operacionais de segurança podem ser tratados pelo servidor e hospedagem | Segurança e prevenção de abuso; confirmar retenção, campos e classificação com os operadores. |

**Coleta:** sim, dados deixam o aparelho e são persistidos no backend. Não declarar processamento somente local ou efêmero para conta, mensagens e treinos.

**Compartilhamento:** avaliar Render (hospedagem/banco), NVIDIA (IA) e Google (fluxo web opcional/fontes). O backend envia mensagens e partes do perfil ao provedor de IA. A Google Play possui exceções para prestadores de serviço: só declarar que não há compartilhamento depois de verificar contratos, uso próprio do fornecedor e exceções aplicáveis. Não presumir que todo envio a terceiro é isento.

**Criptografia em trânsito:** a navegação e API do app usam HTTPS, com HTTP e conteúdo misto bloqueados. Confirmar também os trajetos backend → banco, IA, e-mail e webhook antes de declarar que TODOS os dados são criptografados em trânsito.

**Exclusão:** não declarar exclusão completa implementada com base no botão “apagar perfil”. Ver pendências abaixo.

**Revisão independente de segurança:** não foi realizada certificação independente; não marcar que houve revisão independente apenas porque testes/lint passaram.

Revisar cada tipo de dado, finalidade, obrigatoriedade, coleta, compartilhamento e retenção no formulário. A declaração é responsabilidade do operador e precisa cobrir o site carregado, os provedores e futuras mudanças remotas.

## 6. Exclusão de conta: pendência confirmada

O endpoint DELETE `/api/account` apaga perfil, mensagens e treinos, mas mantém `tyvon_users` e sessões. Portanto, hoje o botão não equivale a excluir a conta completa.

Antes de solicitar produção:
1. Implementar exclusão integral do cadastro e revogação das sessões com confirmação clara, preservando apenas dados cuja retenção tenha base e prazo definidos.
2. Oferecer um caminho visível dentro do aplicativo para essa exclusão.
3. Oferecer URL pública com solicitação de exclusão sem exigir reinstalar o app, identificando TYVON, dados excluídos/retidos e prazos.
4. A central `/privacidade#direitos` já registra pedidos LGPD, mas não explica um processo específico completo de exclusão de conta nem comprova seu atendimento. Adequar a página e a operação antes de usá-la como URL de exclusão na Console.
5. Identificar o controlador e seu contato real na política. A política atual usa descrição genérica do responsável.

## 7. AAB e assinatura

- Package: `com.tyvon.intelligence`.
- Version name: `1.2.0`; version code: `3`.
- Android mínimo: 7.0 / API 24.
- Compile SDK / target SDK: 36 / Android 16.
- AAB: `TYVON-1.2.0.aab`, para envio à Console.
- APK: `TYVON-1.2.0.apk`, para instalação direta e testes; não substitui o AAB na publicação.
- Habilitar Play App Signing. Para primeiro cadastro, permitir à Google gerar a chave de assinatura do app e usar a chave desta entrega como chave de upload.
- Guardar `assinatura-privada` (keystore + configuração) em cofre e backup. Não subir essa pasta para GitHub, Render, Drive público ou anexá-la à Console. O certificado público `upload-certificate.pem` não contém a chave privada.
- Para novas versões, manter o package, usar a mesma chave de upload e aumentar versionCode. Se já houver app, conferir a chave registrada antes do envio; pode ser necessário o processo oficial de troca de chave de upload.

A nova assinatura não atualiza a instalação antiga assinada pela chave de testes. Não afirmar que é a chave definitiva de assinatura distribuída pela Play: com Play App Signing essa chave é administrada pela Google.

## 8. Sequência de lançamento

1. Criar app e completar ficha, contato e imagens.
2. Corrigir exclusão integral, canal de denúncia de IA e política/declarações com o operador.
3. Criar conta de revisão e validar login, cadastro, recuperação de senha, retorno ao app, treino, histórico, cards, logout e exclusão.
4. Enviar o AAB a Teste interno, ativar Play App Signing e conferir avisos de SDK e assinatura.
5. Instalar pela Play em aparelhos Android 7+, 15 e 16; conferir teclado, rotação, Voltar/gestos, reconexão e acessibilidade.
6. Usar o relatório de pré-lançamento para crashes, ANRs e problemas de interface.
7. Se a conta pessoal tiver sido criada após 13/11/2023, cumprir teste fechado com pelo menos 12 testadores inscritos por 14 dias consecutivos e solicitar acesso à produção. O requisito vigente foi confirmado na documentação oficial consultada nesta data; seguir eventuais instruções específicas da Console.
8. Escolher países/regiões e submeter a versão para revisão. Aprovação e prazos dependem da Google.

A Render permanece necessária para servir o sistema. Sem internet ou com servidor indisponível, o app oferece tentativa de reconexão, sem prometer treinos offline.

## 9. Referências oficiais

- Criar e configurar app: https://support.google.com/googleplay/android-developer/answer/9859152?hl=pt-BR
- Segurança dos dados: https://support.google.com/googleplay/android-developer/answer/10787469?hl=pt-BR
- Exclusão de conta: https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR
- Testes para contas pessoais novas: https://support.google.com/googleplay/android-developer/answer/14151465?hl=pt-BR
- Política de saúde: https://support.google.com/googleplay/android-developer/answer/14738291?hl=pt-BR
- Políticas: https://play.google/developer-content-policy/
