package com.tyvon.iron;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.json.*;

/** Private transport; Android-native, no WebView and no credentials in URLs. */
final class Api {
  private static final String HOST="https://rep-kky9.onrender.com";
  private final CookieManager cookies=new CookieManager(null,CookiePolicy.ACCEPT_ORIGINAL_SERVER);
  Api(){ CookieHandler.setDefault(cookies); }

  JSONObject request(String method,String path,JSONObject body,Integer revision) throws Exception {
    if(!path.startsWith("/")||path.startsWith("//"))throw new IOException("Invalid API path");
    URL url=new URL(HOST+path);
    HttpURLConnection c=(HttpURLConnection)url.openConnection();
    c.setInstanceFollowRedirects(false);
    c.setConnectTimeout(12000); c.setReadTimeout(18000);
    c.setRequestMethod(method); c.setRequestProperty("Accept","application/json");
    c.setRequestProperty("Cache-Control","no-store");
    if(!"GET".equals(method)){
      String token=csrf();
      if(token.isEmpty())throw new IOException("Sessão de segurança ausente. Tente novamente.");
      c.setRequestProperty("X-CSRF-Token",token);
    }
    if(revision!=null)c.setRequestProperty("If-Match",String.valueOf(revision));
    if(body!=null){
      c.setDoOutput(true); c.setRequestProperty("Content-Type","application/json; charset=UTF-8");
      try(OutputStream out=c.getOutputStream()){out.write(body.toString().getBytes(StandardCharsets.UTF_8));}
    }
    int code=c.getResponseCode();InputStream stream=code>=400?c.getErrorStream():c.getInputStream();
    ByteArrayOutputStream buffer=new ByteArrayOutputStream();
    if(stream!=null)try(InputStream input=stream){byte[] part=new byte[8192];int n;while((n=input.read(part))!=-1){buffer.write(part,0,n);if(buffer.size()>2000000)throw new IOException("Resposta excessiva");}}
    c.disconnect();
    JSONObject data;
    try{data=new JSONObject(buffer.toString("UTF-8"));}catch(JSONException e){throw new IOException("O servidor enviou uma resposta inesperada.");}
    if(code>=400)throw new IOException(data.optString("error","Falha do servidor")+" ("+code+")");
    return data;
  }

  void prepare() throws Exception {request("GET","/api/auth/status",null,null);}
  String csrf(){
    List<HttpCookie> list=cookies.getCookieStore().getCookies();
    for(HttpCookie cookie:list)if("tyvon_csrf".equals(cookie.getName())&&!cookie.hasExpired())return cookie.getValue();
    return "";
  }
  void clear(){cookies.getCookieStore().removeAll();}
}
