# Validação Android TYVON 1.2.0 — 5 de outubro de 2026

## Artefatos

Package `com.tyvon.intelligence`, versionCode 3, minSdk 24, targetSdk 36. APK e AAB release otimizados por R8, sem debuggable, assinados com nova chave de upload RSA 4096. Segredos mantidos fora do repositório.

## Checks concluídos

- `assembleRelease`, `bundleRelease`, `lintRelease`: passaram na versão final.
- Android lint: zero erros, cinco avisos (versão mais recente de Gradle, JavaScript necessário ao React, dois ícones sem variante monocromática e texto ainda não extraído para recursos de tradução).
- `bundletool 1.18.3 validate`: AAB válido.
- `apksigner verify`: assinatura APK válida, esquema v2, compatível com API24+.
- `zipalign -c -P 16 -v 4`: passou. O APK não tem bibliotecas nativas próprias.
- `jarsigner -verify`: AAB verificado. Avisos de certificado autoassinado/sem timestamp são esperados para a chave Android de upload; isso não é um certificado TLS público. O verificador JDK também emite aviso de ordem do manifest no ZIP gerado por AGP; bundletool aceitou o AAB.
- `npm run build`: passou, incluindo 34 testes frontend e 36 testes backend. Vite emitiu aviso de tamanho de chunks acima de 500 KB.
- Navegador Chromium móvel 412 × 915: site HTTP200, título TYVON, sem erros de JavaScript capturados, largura do conteúdo igual à viewport (sem overflow horizontal), tela de login com e-mail/senha, termos e privacidade HTTP200.
- `git diff --check`: passou.
- GitHub Actions no PR #11: CI web e Android validation passaram; Android remoto executou assembleDebug e lintDebug.
- Readiness pública `/api/health/ready`: HTTP200, serviço e banco prontos.

## Limites

A inspeção do código e os checks de artefatos não substituem teste funcional Android. Um emulador API36 foi preparado sem aceleração (não há `/dev/kvm` neste ambiente), mas não concluiu o boot em cerca de dez minutos. A instalação foi recusada pelo Android com “device is still booting”; não houve teste funcional dentro da WebView nem captura Android válida. O emulador foi encerrado. Não foi fornecida uma conta de revisão, portanto não houve validação autenticada de login, sincronização, treino completo, cards ou exclusão real. Não houve teste em aparelho físico nem envio à Google Play.

Capturas na pasta `validacao-web` são evidência do site no navegador, não capturas Android para a loja.

O app usa e-mail/senha. A sessão Google do navegador não é importada na WebView; o botão Google é ocultado dentro da tela Android. Sem internet, o app mostra falha/reconexão, sem funcionar offline.

## Revisão para produção

Antes do envio público, resolver os pontos do [guia da Google Play](GOOGLE-PLAY-TYVON.md): exclusão integral do cadastro (hoje só o perfil é apagado), denúncia de conteúdo IA, identificação/contato do operador, declaração de dados e validação com conta de revisão. Alterações remotas do sistema podem mudar os dados coletados e devem ser refletidas na Console.
