package com.tyvon.intelligence;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import java.io.OutputStream;
import java.util.UUID;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String TYVON_URL = "https://rep-kky9.onrender.com/";
    private static final String TYVON_HOST = "rep-kky9.onrender.com";
    private static final int FILE_PICK = 701;
    private static final int FILE_SAVE = 702;
    private WebView webView;
    private ProgressBar progress;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingDownload;
    private String downloadNonce;
    private boolean backing;
    private OnBackInvokedCallback predictiveBack;
    private LinearLayout nativeToolbar;

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setTheme(R.style.Theme_Tyvon);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        if (Build.VERSION.SDK_INT >= 29) {
            getWindow().setNavigationBarContrastEnforced(false);
            getWindow().setStatusBarContrastEnforced(false);
        }
        getWindow().getDecorView().setSystemUiVisibility(0);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.setBackgroundColor(Color.BLACK);
        LinearLayout toolbar = new LinearLayout(this);
        nativeToolbar = toolbar;
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setBackgroundColor(Color.rgb(9, 9, 9));
        toolbar.setPadding(dp(8),0,dp(8),0);
        Button back = toolbarButton("‹", "Voltar");
        back.setOnClickListener(v -> navigateBack());
        toolbar.addView(back, new LinearLayout.LayoutParams(dp(52), dp(48)));
        TextView title = new TextView(this);
        title.setText("TYVON"); title.setTextColor(Color.WHITE); title.setTextSize(15);
        title.setLetterSpacing(0.07f);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, dp(48), 1));
        title.setGravity(Gravity.CENTER_VERTICAL);
        Button menu = toolbarButton("⋮", "Opções do aplicativo");
        menu.setOnClickListener(this::showOptions);
        toolbar.addView(menu, new LinearLayout.LayoutParams(dp(52), dp(48)));
        shell.addView(toolbar, new LinearLayout.LayoutParams(-1,dp(48)));
        View hairline = new View(this);
        hairline.setBackgroundColor(Color.rgb(31,31,33));
        shell.addView(hairline, new LinearLayout.LayoutParams(-1,dp(1)));
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));
        shell.addView(progress, new LinearLayout.LayoutParams(-1, dp(2)));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        shell.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(shell);
        if (Build.VERSION.SDK_INT >= 30) {
            shell.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets keyboard = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, keyboard.bottom));
                return WindowInsets.CONSUMED;
            });
        } else {
            shell.setFitsSystemWindows(true);
        }
        configureWebView();
        if (Build.VERSION.SDK_INT >= 33) {
            predictiveBack = () -> navigateBack();
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, predictiveBack);
        }
        if (state == null || webView.restoreState(state) == null) webView.loadUrl(TYVON_URL);
    }

    private Button toolbarButton(String text, String description) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(text); button.setTextSize(24); button.setTextColor(Color.rgb(235,235,235));
        button.setContentDescription(description); button.setBackgroundColor(Color.TRANSPARENT);
        button.setPadding(0, 0, 0, 0); button.setMinWidth(0); button.setMinimumWidth(0);
        return button;
    }

    private boolean trusted(Uri uri) {
        return "https".equals(uri.getScheme()) && TYVON_HOST.equals(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private boolean onTrustedPage() {
        return webView != null && webView.getUrl() != null && trusted(Uri.parse(webView.getUrl()));
    }
    private void external(Uri uri) {
        String scheme = uri.getScheme();
        if (!"https".equals(scheme) && !"http".equals(scheme) && !"mailto".equals(scheme) && !"tel".equals(scheme)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException error) { toast("Não há aplicativo disponível para abrir este link."); }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportZoom(false); settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUserAgentString(settings.getUserAgentString() + " TYVON-Android/1.2.0");
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.addJavascriptInterface(new DownloadBridge(), "TyvonDownloads");
        webView.setDownloadListener((url, agent, disposition, mime, length) -> {
            if (onTrustedPage() && url.startsWith("blob:https://" + TYVON_HOST + "/")) {
                downloadNonce = UUID.randomUUID().toString();
                String script = "fetch(" + JSONObject.quote(url) + ").then(r=>r.blob()).then(b=>{if(b.size>8388608)throw Error('size');const r=new FileReader();r.onload=()=>TyvonDownloads.save(" + JSONObject.quote(downloadNonce) + ",String(r.result));r.readAsDataURL(b)}).catch(()=>TyvonDownloads.save(" + JSONObject.quote(downloadNonce) + ",'error'));";
                webView.evaluateJavascript(script, null);
            } else external(Uri.parse(url));
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value); progress.setVisibility(value < 100 ? View.VISIBLE : View.GONE);
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (!onTrustedPage()) return false;
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), FILE_PICK); }
                catch (ActivityNotFoundException error) { fileCallback.onReceiveValue(null); fileCallback = null; toast("Não foi possível abrir seus arquivos."); }
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (trusted(uri)) {
                    if ("/api/auth/google".equals(uri.getPath())) {
                        toast("Login Google abre no navegador. No app, use o acesso por e-mail e senha.");
                        external(uri); return true;
                    }
                    return false;
                }
                if (request.isForMainFrame()) external(uri);
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) { CookieManager.getInstance().flush(); }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showError("Não conseguimos abrir o TYVON. Confira a conexão e tente novamente.");
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 500) showError("O servidor está indisponível agora. Seus dados da conta continuam no TYVON.");
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                webView = null; view.destroy(); recreate(); return true;
            }
        });
    }

    private void showOptions(View anchor) {
        PopupMenu menu = new PopupMenu(this, anchor);
        menu.getMenu().add(0, 1, 0, "Início");
        menu.getMenu().add(0, 2, 1, "Perfil e ajustes");
        menu.getMenu().add(0, 3, 2, "Recarregar");
        menu.getMenu().add(0, 4, 3, "Abrir no navegador");
        menu.getMenu().add(0, 5, 4, "Sobre este aplicativo");
        menu.setOnMenuItemClickListener(item -> {
            switch (item.getItemId()) {
                case 1: navigateTo("overview"); break;
                case 2: navigateTo("profile"); break;
                case 3: new AlertDialog.Builder(this).setTitle("Recarregar TYVON?").setMessage("A sessão da conta é mantida. O rascunho do treino salvo neste aparelho será retomado pela aplicação.").setNegativeButton("Cancelar", null).setPositiveButton("Recarregar", (d, w) -> webView.reload()).show(); break;
                case 4: external(Uri.parse(onTrustedPage() ? webView.getUrl() : TYVON_URL)); break;
                case 5: new AlertDialog.Builder(this).setTitle("TYVON 1.2").setMessage("Aplicativo WebView conectado ao TYVON. Requer internet. Conta, perfil, histórico e saída da sessão ficam nas opções do TYVON. Login Google utiliza o navegador; a sessão do navegador é separada da sessão do aplicativo.").setPositiveButton("Entendi", null).show(); break;
            }
            return true;
        });
        menu.show();
    }
    private void navigateTo(String route) {
        if (!onTrustedPage()) { webView.loadUrl(TYVON_URL); return; }
        String js = "(()=>{const e=new CustomEvent('tyvon:native-navigate',{cancelable:true,detail:{route:" + JSONObject.quote(route) + "}});window.dispatchEvent(e);return e.defaultPrevented})()";
        webView.evaluateJavascript(js, result -> { if (!"true".equals(result)) webView.loadUrl(TYVON_URL); });
    }
    private void navigateBack() {
        if (backing || webView == null) return;
        if (webView.canGoBack() && !onTrustedPage()) { webView.goBack(); return; }
        backing = true;
        String js = "(()=>{const e=new Event('tyvon:native-back',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()";
        webView.evaluateJavascript(js, result -> {
            backing = false;
            if ("true".equals(result)) return;
            if (webView.canGoBack()) webView.goBack();
            else new AlertDialog.Builder(this).setTitle("Sair do TYVON?").setMessage("Sua sessão fica salva neste aparelho. Você pode voltar depois.").setNegativeButton("Continuar", null).setPositiveButton("Sair", (d, w) -> finish()).show();
        });
    }
    @Override public void onBackPressed() { navigateBack(); }

    private void showError(String message) {
        progress.setVisibility(View.GONE);
        String html = "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{margin:0;min-height:100vh;background:#090909;color:#eee;font:16px sans-serif;display:grid;place-items:center}main{padding:28px;max-width:420px;text-align:center}h1{font-size:34px}p{line-height:1.6;color:#aaa}a{display:block;padding:18px;background:#eee;color:#111;border-radius:16px;text-decoration:none;font-weight:bold}</style><main><b>TYVON</b><h1>Vamos tentar de novo.</h1><p>" + message + "</p><a href='" + TYVON_URL + "'>Tentar novamente</a></main>";
        webView.loadDataWithBaseURL(TYVON_URL, html, "text/html", "UTF-8", null);
    }
    private void toast(String message) { Toast.makeText(this, message, Toast.LENGTH_LONG).show(); }

    public class DownloadBridge {
        @JavascriptInterface public void save(String nonce, String data) {
            runOnUiThread(() -> {
                if (!onTrustedPage() || downloadNonce == null || !downloadNonce.equals(nonce)) return;
                downloadNonce = null;
                if (data == null || data.length() > 12000000 || !data.startsWith("data:image/png;base64,")) { toast("Não foi possível salvar o card. Tente pelo navegador."); return; }
                try {
                    byte[] bytes = Base64.decode(data.substring(data.indexOf(',') + 1), Base64.DEFAULT);
                    if (bytes.length < 8 || bytes.length > 8388608 || bytes[0] != (byte)137 || bytes[1] != 80 || bytes[2] != 78 || bytes[3] != 71) throw new IllegalArgumentException();
                    pendingDownload = bytes;
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("image/png");
                    intent.putExtra(Intent.EXTRA_TITLE, "TYVON-card.png");
                    startActivityForResult(intent, FILE_SAVE);
                } catch (Exception error) { pendingDownload = null; toast("Não foi possível salvar o card."); }
            });
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == FILE_PICK && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data)); fileCallback = null;
        } else if (request == FILE_SAVE) {
            if (result == RESULT_OK && data != null && data.getData() != null && pendingDownload != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out == null) throw new IllegalStateException();
                    out.write(pendingDownload); toast("Card salvo.");
                } catch (Exception error) { toast("Não foi possível gravar o card."); }
            }
            pendingDownload = null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle state) { if (webView != null) webView.saveState(state); super.onSaveInstanceState(state); }
    @Override protected void onPause() { CookieManager.getInstance().flush(); super.onPause(); }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        pendingDownload = null; downloadNonce = null;
        if (Build.VERSION.SDK_INT >= 33 && predictiveBack != null) {
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(predictiveBack);
            predictiveBack = null;
        }
        if (webView != null) { webView.stopLoading(); webView.removeJavascriptInterface("TyvonDownloads"); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
