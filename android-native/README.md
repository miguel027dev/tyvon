# TYVON Iron — Android nativo

Cliente Android em Java/Views, sem WebView, com identidade de musculação e API compartilhada com o TYVON.

## Abrir e compilar

`ANDROID_HOME=/caminho/sdk ./build.sh` (JDK 17; Android SDK 35; build-tools 35.0.0). A saída é `build/TYVON-Iron-2.0-native.apk`. O script usa certificado de validação local por padrão. Para distribuição, forneça `TYVON_KEYSTORE`, `TYVON_KEY_ALIAS` e `TYVON_KEYSTORE_PASSWORD`; a chave não entra no repositório.

Pacote separado `com.tyvon.iron` para instalar ao lado do WebView anterior. Android 8+ (API 26), alvo 35. Nenhuma chave NVIDIA ou senha do banco entra no cliente.

## Implementado

- Login/cadastro por e-mail, CSRF e cookies HTTPS; armazenamento cifrado AES-GCM com Android Keystore.
- Perfil e ficha do motor Python pelo contrato `/api/native/v1/bootstrap`.
- Registro de carga/repetições/RIR opcional; prancha em segundos.
- Rascunho cifrado por conta; descanso por prazo absoluto; preservação ao fechar o app.
- Finalização com revisão If-Match; falhas preservam o rascunho; retry usa o mesmo ID.
- Histórico real e card PNG compartilhado sem dados corporais, e-mail ou conversa.
- Chat via JSON ou SSE; termos e solicitações de privacidade.
- Insets de sistema/recorte/teclado, formulários roláveis, largura de conteúdo limitada.

## Pendências de lançamento

- Login Google no cliente nativo requer fluxo OAuth completo e teste de troca de sessão; hoje abre explicitamente o web.
- Recuperação e redefinição de senha usam o web; precisam teste real de entrega SMTP.
- APK usa assinatura de validação; não é artefato aprovado para publicar na Play Store. AAB/assinatura de distribuição ainda precisam ser definidos.
- Não há cache offline da conta/ficha: o rascunho local preserva séries, mas o app precisa autenticar/carregar dados para retomar após abertura fria.
- Alertas de restrição não são adaptação clínica. Não há sugestão automática de carga neste cliente, apenas último registro.
- Sem alegação de validação universal em todos os fabricantes/dispositivos. Ver relatório de validação desta entrega.
