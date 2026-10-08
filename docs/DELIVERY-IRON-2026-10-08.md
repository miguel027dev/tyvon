# TYVON Iron — entrega e validação

## Resultado
Identidade de musculação old school, camada visual web, cliente Android nativo Java/Views e contrato versionado para consumir o motor de fichas do servidor. Materiais de marca em `design/tyvon-iron`. O cliente antigo WebView fica separado, preservando o projeto existente.

## Verificado
- 34 testes JavaScript e 38 testes Python passaram.
- Build Vite aprovado; permanece aviso de bundle principal acima de 500 kB.
- APK Java compilado com SDK 35/JDK 17; DEX gerado; zipalign; apksigner v2/v3 aprovado.
- Manifesto: pacote com.tyvon.iron, minSdk 26, targetSdk 35, backup desativado e cleartext proibido.
- Cliente novo sem WebView; sessão/rascunho cifrados com Keystore; sem segredos do servidor no código.
- Antes do deploy: readiness pública 200/database=true e IA configurada.
- Testes do contrato nativo verificam rejeição anônima e equivalência ao plano canônico com revisão preservada.

## Limites reais
Chrome encerrou com SIGSEGV e o emulador não ficou acessível por ADB neste runtime. As tentativas não constituem teste visual nem teste em aparelho. Não houve login autenticado real, entrega SMTP ou execução de treino completo no Android. É necessário validar instalação, login, perfil, série, falha de rede, retomada, conflito entre aparelhos, chat e compartilhamento em dispositivo real.

Assinatura do APK é de validação; AAB e assinatura definitiva de distribuição pendentes. Google nativo ainda abre explicitamente a experiência web. APK não deve ser descrito como pronto para Play Store. O pacote novo instala ao lado do aplicativo anterior.

O motor considera idade, objetivo, experiência, equipamento, dias e tempo. Peso/altura são contexto; restrições geram alertas e não adaptação clínica. O tempo é estimativo e o armazenamento de conta ainda usa snapshots limitados a 500 logs/1 MB. A versão nativa mostra cargas anteriores sem progressão automática.

## Publicação
Commit inicial: efbf8484a5225d70564dadd7356c91cbb63f86c4. Revisão: https://github.com/miguel027dev/tyvon/pull/12. Serviço: https://rep-kky9.onrender.com. Confirmar resultado do deploy no status final da entrega.
