# TYVON Android — WebView

URL: `https://rep-kky9.onrender.com/`. Android 7.0 (API24) ou posterior; versão1.2.0, código3.

## Comportamento

- Barra nativa com Voltar e menu: Início, Perfil e ajustes, Recarregar, Abrir no navegador e Sobre.
- Voltar conversa com a navegação React antes de usar histórico da WebView ou confirmar saída. Sair de uma sessão guiada pela barra preserva seu rascunho local.
- Cookies e armazenamento local mantêm a sessão no aparelho; logout continua nas opções da conta no site. A validade da sessão é determinada pelo servidor.
- Layout respeita barras do sistema e teclado; orientação livre.
- HTTPS obrigatório, acesso a arquivos locais desabilitado e links externos no navegador.
- Erros de conexão/servidor têm botão Tentar novamente.
- Uploads usam o seletor do Android. Cards PNG gerados pela aplicação podem ser salvos via seletor de destino, sem permissão ampla de armazenamento.
- Ponte de download limitada a PNG, até8MiB, com nonce de uma única solicitação e origem principal TYVON. Nenhuma credencial é exposta pela ponte.

**Login Google:** abre o fluxo no navegador, onde a conta funciona. A sessão do navegador é separada da WebView. Para autenticar dentro deste APK, use e-mail/senha. Integrar Google nativo ou retorno seguro de autenticação requer uma etapa própria; este APK não afirma oferecer isso.

## Compilar

JDK17, Android SDK API35, Build Tools35 e Gradle8.9. Na pasta `android-app`:

```bash
gradle --no-daemon :app:assembleDebug :app:lintDebug
```

APK debug instalável assinado para testes: `app/build/outputs/apk/debug/app-debug.apk`. Não é um AAB assinado com chave definitiva para publicação na loja. A assinatura de testes precisa ser mantida para atualizar a mesma instalação.

As funcionalidades web carregadas do servidor recebem as atualizações de deploy. Alterações do código nativo exigem novo APK.

## APK entregue

`TYVON-1.1.0.apk` foi gerado com `assembleRelease`, otimizado pelo R8, alinhamento conferido com zipalign e assinado com apksigner usando a chave Android de testes. A variante de release desativa debuggable. `lintRelease` passou sem erros. Não houve teste em aparelho físico nesta entrega.

A interface web passou nos 70 testes e build de produção. O servidor precisa da atualização de `src/main.jsx` para receber os eventos nativos de Voltar e Perfil.


## WebViewer 1.2.0
- A interface permanece no servidor Render e inclui uma camada de polimento apenas quando executada pelo Android TYVON WebViewer.
- Cabeçalho nativo compacto, alvos de toque de 48 dp, safe areas do sistema e teclado, barra de status escura e haptics Android.
- Voltar ou abrir Perfil durante uma sessão orientada abre confirmação de saída na interface, mantendo o rascunho.
- Compatibilidade com gesto Android Voltar (API 33+) e rolagem sem rebote no WebView.
- O APK compilado pelo GitHub Actions é uma **versão debug para testes**; não equivale a release assinado para Google Play.
- Google login permanece no navegador externo; para entrar na WebView use e-mail e senha.
