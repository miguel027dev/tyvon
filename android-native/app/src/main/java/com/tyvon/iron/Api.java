package com.tyvon.iron;
import org.json.*;
import java.net.*;
import java.io.*;
import java.util.*;
final class Api {
 static final String BASE="https://rep-kky9.onrender.com";
 final Vault vault;final Map<String,String> cookies=new LinkedHashMap<>();
 Api(Vault v)throws Exception{vault=v;String s=v.get("cookies");if(!s.isEmpty()){JSONObject j=new JSONObject(s);Iterator<String> i=j.keys();while(i.hasNext()){String k=i.next();cookies.put(k,j.getString(k));}}}
 interface Token {void accept(JSONObject data);}
 synchronized JSONObject call(String path,String method,JSONObject body,Integer revision,Token stream)throws Exception{
  if(!path.startsWith("/api/"))throw new Exception("Endpoint inválido.");
  if(!method.equals("GET")&&!cookies.containsKey("tyvon_csrf"))call("/api/auth/status","GET",null,null,null);
  HttpURLConnection c=(HttpURLConnection)new URL(BASE+path).openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(stream==null?20000:90000);c.setRequestMethod(method);c.setRequestProperty("Accept",stream==null?"application/json":"text/event-stream");
  StringBuilder cs=new StringBuilder();for(Map.Entry<String,String> e:cookies.entrySet()){if(cs.length()>0)cs.append("; ");cs.append(e.getKey()).append('=').append(e.getValue());}c.setRequestProperty("Cookie",cs.toString());
  if(!method.equals("GET")){c.setRequestProperty("X-CSRF-Token",cookies.getOrDefault("tyvon_csrf",""));if(revision!=null)c.setRequestProperty("If-Match",revision.toString());c.setRequestProperty("Content-Type","application/json");c.setDoOutput(true);try(OutputStream out=c.getOutputStream()){out.write((body==null?"{}":body.toString()).getBytes("UTF-8"));}}
  try{
   int code=c.getResponseCode();for(Map.Entry<String,List<String>> e:c.getHeaderFields().entrySet())if(e.getKey()!=null&&e.getKey().equalsIgnoreCase("Set-Cookie"))for(String raw:e.getValue()){String pair=raw.split(";",2)[0];int split=pair.indexOf('=');if(split>0){String name=pair.substring(0,split),value=pair.substring(split+1);if(value.isEmpty())cookies.remove(name);else cookies.put(name,value);}}
   vault.put("cookies",new JSONObject(cookies).toString());
   InputStream input=code>=400?c.getErrorStream():c.getInputStream();if(input==null)throw new Exception("Servidor indisponível ("+code+").");
   try(BufferedReader reader=new BufferedReader(new InputStreamReader(input,"UTF-8"))){
    if(code<300&&stream!=null&&c.getContentType()!=null&&c.getContentType().contains("text/event-stream")){String line;while((line=reader.readLine())!=null){if(line.startsWith("data: ")){JSONObject event=new JSONObject(line.substring(6));stream.accept(event);}}return new JSONObject().put("ok",true);}
    StringBuilder s=new StringBuilder();String line;while((line=reader.readLine())!=null){s.append(line);if(s.length()>1100000)throw new Exception("Resposta acima do limite.");}
    JSONObject j;try{j=new JSONObject(s.toString());}catch(Exception ignored){throw new Exception("Resposta inválida do servidor ("+code+").");}
    if(code>=300)throw new ApiError(code,j.optString("error","Falha de conexão."));if(stream!=null&&j.has("message")){stream.accept(new JSONObject().put("type","token").put("text",j.optString("message")+(j.has("workouts")?"\nAbra sua ficha na aba Ficha.":"")));}return j;
   }
  }finally{c.disconnect();}
 }
 static final class ApiError extends Exception{final int status;ApiError(int s,String m){super(m);status=s;}}
}
