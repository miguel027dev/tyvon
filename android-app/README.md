# TYVON Android 1.2.0

WebView Android integrada ao sistema em https://rep-kky9.onrender.com/, package `com.tyvon.intelligence`, versionCode 3, Android 7.0+ (min 24), target 36.

Sem barra extra de navegador, menus duplicados ou linha de progresso. Abertura com a marca, erros nativos com nova tentativa, respeito a barras do sistema/teclado e navegação Voltar integrada ao React. HTTPS obrigatório, cookies persistentes, seletor Android para uploads/cards, sem permissões amplas de arquivos.

Acesso autenticado dentro do app por e-mail e senha. Google abre externamente e não transfere a sessão do navegador à WebView. O sistema remoto continua dependendo de internet e da Render. Mudanças web são servidas pelo site; mudanças nativas exigem novo artefato.

## Compilar

JDK 17 completo, SDK 36 e Build Tools 36. Configurar `ANDROID_HOME` ou `local.properties`. Usar o Gradle Wrapper 8.13 incluído:

```bash
./gradlew :app:assembleDebug :app:lintDebug
```

Release requer as variáveis `TYVON_KEYSTORE_PATH`, `TYVON_KEYSTORE_PASSWORD`, `TYVON_KEY_ALIAS`, `TYVON_KEY_PASSWORD`, usando uma chave de upload privada. Não gravar valores no repositório.

```bash
./gradlew :app:assembleRelease :app:bundleRelease :app:lintRelease
```

Saídas: `app/build/outputs/apk/release/app-release.apk` e `app/build/outputs/bundle/release/app-release.aab`. A assinatura de upload desta entrega é nova, diferente da chave de testes anterior. Guardar o backup privado para próximas versões.

Consulte [guia completo da Google Play](../docs/GOOGLE-PLAY-TYVON.md), incluindo pendências de exclusão de conta, declaração de dados, IA e testes reais antes da produção.
