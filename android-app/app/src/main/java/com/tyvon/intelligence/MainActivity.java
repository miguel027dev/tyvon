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
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.os.Handler;
import android.os.Looper;

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
    private FrameLayout shell;
    private LinearLayout cover;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean failed;
    private final Runnable loadTimeout = () -> showError("A conexão está demorando. Confira sua internet e tente novamente.");
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingDownload;
    private String downloadNonce;
    private boolean backing;

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setTheme(R.style.Theme_Tyvon);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        shell = new FrameLayout(this);
        shell.setBackgroundColor(Color.BLACK);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        shell.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        cover = new LinearLayout(this);
        cover.setOrientation(LinearLayout.VERTICAL);
        cover.setGravity(Gravity.CENTER);
        cover.setBackgroundColor(Color.BLACK);
        cover.setPadding(dp(28), dp(28), dp(28), dp(28));
        shell.addView(cover, new FrameLayout.LayoutParams(-1, -1));
        showLaunch();
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
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::navigateBack);
        }
        if (state == null || webView.restoreState(state) == null) webView.loadUrl(TYVON_URL);
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
        settings.setUserAgentString(settings.getUserAgentString() + " TYVON-Android/1.2");
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
                // Loading is represented by the brand cover, with no browser progress bar.
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
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                failed = false;
                downloadNonce = null;
                handler.removeCallbacks(loadTimeout);
                handler.postDelayed(loadTimeout, 45000);
            }
            @Override public void onPageCommitVisible(WebView view, String url) {
                if (!failed && trusted(Uri.parse(url))) {
                    // Browser OAuth cannot transfer its session to this WebView.
                    // Keep the Android login screen focused on supported credentials.
                    view.evaluateJavascript("(()=>{if(document.getElementById('tyvon-android-style'))return;const s=document.createElement('style');s.id='tyvon-android-style';s.textContent='.google-login,.auth-divider,.entry-auth-note{display:none!important}';document.head.appendChild(s)})()", null);
                    handler.removeCallbacks(loadTimeout);
                    cover.setVisibility(View.GONE);
                }
            }
            @Override public void onPageFinished(WebView view, String url) { CookieManager.getInstance().flush(); }
            @Override public void onReceivedSslError(WebView view, android.webkit.SslErrorHandler sslHandler, android.net.http.SslError error) {
                sslHandler.cancel();
                showError("Não foi possível estabelecer uma conexão segura. Tente novamente mais tarde.");
            }
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

    private void navigateBack() {
        if (backing || webView == null) return;
        if (webView.canGoBack() && !onTrustedPage()) { webView.goBack(); return; }
        backing = true;
        String js = "(()=>{const e=new Event('tyvon:native-back',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()";
        webView.evaluateJavascript(js, result -> {
            backing = false;
            if ("true".equals(result)) return;
            if (webView == null || isFinishing()) return;
            if (webView.canGoBack()) webView.goBack();
            else new AlertDialog.Builder(this).setTitle("Sair do TYVON?").setMessage("Sua sessão fica salva neste aparelho. Você pode voltar depois.").setNegativeButton("Continuar", null).setPositiveButton("Sair", (d, w) -> finish()).show();
        });
    }
    @Override public void onBackPressed() { navigateBack(); }

    private TextView coverText(String text, int size) {
        TextView label = new TextView(this);
        label.setText(text); label.setTextColor(Color.WHITE); label.setTextSize(size);
        label.setGravity(Gravity.CENTER); label.setPadding(0, dp(12), 0, dp(12));
        cover.addView(label, new LinearLayout.LayoutParams(-1, -2));
        return label;
    }
    private void showLaunch() {
        cover.removeAllViews(); cover.setVisibility(View.VISIBLE);
        ImageView mark = new ImageView(this);
        mark.setImageResource(R.drawable.tyvon_mark); mark.setContentDescription("TYVON");
        cover.addView(mark, new LinearLayout.LayoutParams(dp(104), dp(104)));
        coverText("TYVON", 28);
        coverText("Preparando seu espaço…", 14);
    }
    private void showError(String message) {
        if (isFinishing() || webView == null) return;
        failed = true; downloadNonce = null;
        handler.removeCallbacks(loadTimeout);
        webView.stopLoading();
        cover.removeAllViews(); cover.setVisibility(View.VISIBLE);
        coverText("TYVON", 28);
        coverText(message, 16);
        Button retry = new Button(this); retry.setText("Tentar novamente");
        retry.setOnClickListener(v -> { showLaunch(); webView.loadUrl(TYVON_URL); });
        cover.addView(retry, new LinearLayout.LayoutParams(-1, dp(56)));
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
        handler.removeCallbacksAndMessages(null);
        pendingDownload = null; downloadNonce = null;
        if (webView != null) { webView.stopLoading(); webView.removeJavascriptInterface("TyvonDownloads"); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
