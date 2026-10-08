package com.tyvon.iron;
import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
/** Small encrypted local store. Keys never leave Android Keystore. Backup is disabled. */
final class Vault {
 private final Context context;
 Vault(Context c){context=c.getApplicationContext();}
 private SecretKey key() throws Exception {
  KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
  if(!ks.containsAlias("tyvon_iron_v1")){KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder("tyvon_iron_v1",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());g.generateKey();}
  return (SecretKey)ks.getKey("tyvon_iron_v1",null);
 }
 synchronized void put(String name,String value) throws Exception {
  Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());
  String data=Base64.encodeToString(c.getIV(),Base64.NO_WRAP)+":"+Base64.encodeToString(c.doFinal(value.getBytes("UTF-8")),Base64.NO_WRAP);
  if(!context.getSharedPreferences("iron-vault",0).edit().putString(name,data).commit())throw new Exception("Não foi possível guardar o rascunho neste aparelho.");
 }
 synchronized String get(String name) throws Exception {
  String data=context.getSharedPreferences("iron-vault",0).getString(name,"");if(data.isEmpty())return "";
  String[] parts=data.split(":",2);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(parts[0],Base64.NO_WRAP)));return new String(c.doFinal(Base64.decode(parts[1],Base64.NO_WRAP)),"UTF-8");
 }
 synchronized void remove(String name){context.getSharedPreferences("iron-vault",0).edit().remove(name).commit();}
}
