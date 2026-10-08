package com.tyvon.iron;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.*;
import android.view.*;
import android.widget.*;
import android.text.InputType;
import java.util.*;
import org.json.*;

/** TYVON / IRON: native Views, with real server-side training data. No WebView. */
public final class MainActivity extends Activity {
  private static final int BG=Color.rgb(11,11,12), SURFACE=Color.rgb(32,32,34),
    STROKE=Color.rgb(59,59,61), WHITE=Color.rgb(241,238,231),
    MUTED=Color.rgb(160,158,155), ACCENT=Color.rgb(206,103,57);
  private final Api api=new Api();
  private LinearLayout root,stack;
  private JSONObject state,profile;
  private JSONArray plan=new JSONArray();
  private int revision=0,currentWorkout=0,currentExercise=0;
  private long startedAt=0;
  private final Map<String,SetRecord> draft=new HashMap<>();
  private boolean busy=false;
  private interface Task {JSONObject run() throws Exception;}
  private interface Result {void ok(JSONObject data) throws Exception;}
  private static final class SetRecord {
    String load="",reps="",rir="";
    boolean complete=false;
  }
  private int dp(float size){return (int)(size*getResources().getDisplayMetrics().density+.5f);}
  @Override public void onCreate(Bundle saved){
    super.onCreate(saved);
    getWindow().setStatusBarColor(BG);getWindow().setNavigationBarColor(BG);
    getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    showLogin();
  }
  private void run(Task task,Result result){
    if(busy)return;
    busy=true;
    new Thread(()->{
      try {
        JSONObject answer=task.run();
        runOnUiThread(()->{busy=false;try{result.ok(answer);}catch(Exception ex){error(ex.getMessage());}});
      }catch(Exception ex){runOnUiThread(()->{busy=false;error(ex.getMessage());});}
    },"tyvon-api").start();
  }
  private void error(String reason){
    new AlertDialog.Builder(this).setTitle("TYVON").setMessage(reason==null?"Não foi possível concluir a ação.":reason)
      .setPositiveButton("Entendi",null).show();
  }
  private GradientDrawable shape(int fill,int stroke,int radius){
    GradientDrawable d=new GradientDrawable();d.setColor(fill);d.setCornerRadius(dp(radius));
    if(stroke!=0)d.setStroke(dp(1),stroke);return d;
  }
  private TextView text(String s,int size,int color,boolean bold){
    TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);
    t.setFontFeatureSettings("tnum");
    t.setTypeface(android.graphics.Typeface.create(bold?"sans-serif-condensed":"sans-serif",bold?1:0));
    t.setGravity(Gravity.CENTER_VERTICAL);
    return t;
  }
  private LinearLayout column(){
    LinearLayout x=new LinearLayout(this);x.setOrientation(LinearLayout.VERTICAL);return x;
  }
  private LinearLayout row(){
    LinearLayout x=new LinearLayout(this);x.setOrientation(LinearLayout.HORIZONTAL);
    x.setGravity(Gravity.CENTER_VERTICAL);return x;
  }
  private LinearLayout.LayoutParams lp(int w,int h){
    return new LinearLayout.LayoutParams(w<0?w:dp(w),h<0?h:dp(h));
  }
  private void gap(LinearLayout to,int height){
    View v=new View(this);to.addView(v,lp(1,height));
  }
  private void label(LinearLayout to,String value){
    TextView t=text(value.toUpperCase(Locale.ROOT),11,MUTED,true);
    t.setLetterSpacing(.13f);to.addView(t,lp(-1,24));
  }
  private void heading(LinearLayout to,String cap,String title,String sub){
    label(to,cap);TextView big=text(title,34,WHITE,true);to.addView(big,lp(-1,-2));
    if(sub!=null){gap(to,8);to.addView(text(sub,14,MUTED,false),lp(-1,-2));}
    gap(to,24);
  }
  private TextView button(String name,boolean primary,Runnable action){
    TextView b=text(name,15,primary?BG:WHITE,true);
    b.setGravity(Gravity.CENTER);b.setPadding(dp(14),dp(10),dp(14),dp(10));
    b.setMinHeight(dp(52));
    b.setBackground(shape(primary?ACCENT:SURFACE,primary?0:STROKE,14));
    b.setClickable(true);b.setFocusable(true);
    b.setOnClickListener(v->action.run());
    return b;
  }
  private LinearLayout card(LinearLayout to){
    LinearLayout c=column();c.setPadding(dp(18),dp(18),dp(18),dp(18));
    c.setBackground(shape(SURFACE,STROKE,18));
    to.addView(c,lp(-1,-2));gap(to,12);return c;
  }
  private EditText field(LinearLayout to,String title,String hint,int inputType){
    label(to,title);
    EditText e=new EditText(this);e.setSingleLine(true);e.setTextSize(16);
    e.setTextColor(WHITE);e.setHintTextColor(MUTED);e.setHint(hint);
    e.setInputType(inputType);e.setPadding(dp(16),dp(12),dp(16),dp(12));
    e.setBackground(shape(SURFACE,STROKE,12));e.setMinHeight(dp(52));
    to.addView(e,lp(-1,-2));gap(to,12);return e;
  }
  private Spinner spinner(LinearLayout to,String title,String[] items){
    label(to,title);
    Spinner s=new Spinner(this);ArrayAdapter<String> a=new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,items);
    s.setAdapter(a);s.setBackground(shape(SURFACE,STROKE,12));s.setMinimumHeight(dp(52));
    to.addView(s,lp(-1,52));gap(to,12);return s;
  }
  private void screen(String tab){
    root=column();root.setBackgroundColor(BG);root.setFitsSystemWindows(android.os.Build.VERSION.SDK_INT<35);
    if(android.os.Build.VERSION.SDK_INT>=35)root.setOnApplyWindowInsetsListener((view,insets)->{
      android.graphics.Insets a=insets.getInsets(android.view.WindowInsets.Type.systemBars());
      root.setPadding(0,a.top,0,a.bottom);return insets;
    });
    setContentView(root);
    ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.setClipToPadding(false);
    root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
    stack=column();stack.setPadding(dp(20),dp(20),dp(20),dp(24));scroll.addView(stack);
    LinearLayout bar=row();bar.setPadding(dp(20),dp(7),dp(20),dp(9));
    TextView mark=text("TYVON  /  IRON",14,WHITE,true);bar.addView(mark,new LinearLayout.LayoutParams(0,dp(48),1));
    TextView line=text(tab,11,ACCENT,true);line.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);
    bar.addView(line,lp(-2,48));root.addView(bar,lp(-1,58));
  }
  private String value(EditText e){return e.getText().toString().trim();}
  private void showLogin(){
    screen("ENTRAR");heading(stack,"TREINO, NÃO TEATRO","Seu treino. Seus números.","O ferro não mente. Registre o que realmente fez.");
    EditText email=field(stack,"E-mail","voce@email.com",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
    EditText password=field(stack,"Senha","Mínimo 10 caracteres",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);
    stack.addView(button("Entrar no TYVON",true,()->authenticate(email,password,false)),lp(-1,54));gap(stack,12);
    stack.addView(button("Criar conta",false,()->authenticate(email,password,true)),lp(-1,54));gap(stack,16);
    stack.addView(text("O registro exige idade mínima de 14 anos e aceitação dos Termos e da Política de Privacidade. Criação de conta usa a mesma API do TYVON.",12,MUTED,false),lp(-1,-2));
  }
  private void authenticate(EditText email,EditText password,boolean register){
    if(!value(email).contains("@")||value(password).length()<10){error("Informe e-mail válido e senha com pelo menos 10 caracteres.");return;}
    Runnable perform=()->run(()->{
      api.prepare();
      JSONObject credentials=new JSONObject().put("email",value(email)).put("password",value(password));
      if(register)credentials.put("accepted",true);
      return api.request("POST","/api/auth/"+(register?"register":"login"),credentials,null);
    },result->refresh());
    if(register)new AlertDialog.Builder(this).setTitle("Criar conta")
      .setMessage("Confirma que tem pelo menos 14 anos e aceita os Termos e a Política de Privacidade do TYVON?")
      .setNegativeButton("Cancelar",null).setPositiveButton("Aceitar e criar",(d,w)->perform.run()).show();
    else perform.run();
  }
  private void refresh(){
    run(()->api.request("GET","/api/account",null,null),result->{
      revision=result.optInt("revision",0);
      state=result.optJSONObject("state");
      profile=state==null?null:state.optJSONObject("profile");
      if(profile==null||!profile.optBoolean("complete",false)){showSetup();return;}
      fetchPlan();
    });
  }
  private void fetchPlan(){
    run(()->api.request("GET","/api/native/plan",null,null),result->{
      plan=result.optJSONArray("workouts");if(plan==null)plan=new JSONArray();
      showHome();
    });
  }
  private void showSetup(){
    screen("CONFIGURAR");heading(stack,"PRIMEIRO TREINO","Monte sua base.","Sem comparações com outras pessoas. Você controla o que informa.");
    EditText name=field(stack,"Nome","Como quer ser chamado?",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_WORDS);
    EditText age=field(stack,"Idade","Anos completos (mínimo 14)",InputType.TYPE_CLASS_NUMBER);
    Spinner goal=spinner(stack,"Objetivo",new String[]{"Ganhar massa muscular","Melhorar condicionamento","Criar uma rotina"});
    Spinner exp=spinner(stack,"Experiência",new String[]{"Iniciante","Intermediário","Avançado"});
    Spinner equipment=spinner(stack,"Equipamentos",new String[]{"Academia completa","Halteres e banco","Só peso corporal"});
    Spinner days=spinner(stack,"Dias por semana",new String[]{"2","3","4","5"});
    Spinner minutes=spinner(stack,"Minutos por sessão",new String[]{"35","45","60","75"});
    EditText limits=field(stack,"Restrições (opcional)","Nenhuma / descreva aqui",InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
    stack.addView(button("Criar minha ficha",true,()->{
      int years;try{years=Integer.parseInt(value(age));}catch(Exception ex){error("Informe sua idade.");return;}
      if(years<14||years>100||value(name).isEmpty()){error("Informe nome e idade válida (14 anos ou mais).");return;}
      run(()->{
        String eq=(String)equipment.getSelectedItem();
        JSONArray equipmentList=new JSONArray();
        if(eq.equals("Academia completa"))for(String item:new String[]{"Halteres","Barras","Máquinas","Cabos","Banco"})equipmentList.put(item);
        else if(eq.equals("Halteres e banco")){equipmentList.put("Halteres");equipmentList.put("Banco");}
        else equipmentList.put("Peso corporal");
        JSONObject p=new JSONObject().put("name",value(name)).put("age",years)
          .put("height",JSONObject.NULL).put("weight",JSONObject.NULL)
          .put("goal",goal.getSelectedItem().toString()).put("experience",exp.getSelectedItem().toString())
          .put("equipment",equipmentList).put("days",Integer.parseInt(days.getSelectedItem().toString()))
          .put("sessionMinutes",Integer.parseInt(minutes.getSelectedItem().toString()))
          .put("limitations",value(limits).isEmpty()?"Nenhuma":value(limits)).put("complete",true);
        JSONObject body=new JSONObject().put("profile",p).put("step",10).put("messages",new JSONArray()).put("logs",new JSONArray());
        return api.request("POST","/api/account",body,null);
      },result->refresh());
    }),lp(-1,54));
  }
  private JSONObject selectedWorkout(){return plan.optJSONObject(Math.min(currentWorkout,Math.max(0,plan.length()-1)));}
  private void showHome(){
    currentWorkout=plan.length()==0?0:((state.optJSONArray("logs")==null?0:state.optJSONArray("logs").length())%plan.length());
    screen("SEU TREINO");nav("Início");
    String name=profile.optString("name","Atleta").split(" ")[0];
    heading(stack,"SEU ESPAÇO","Bora, "+name+".","Sua próxima ficha está pronta. A decisão de começar é sua.");
    JSONObject w=selectedWorkout();
    if(w!=null){
      LinearLayout c=card(stack);label(c,"PRÓXIMA SESSÃO");gap(c,8);
      c.addView(text(w.optString("name"),29,WHITE,true),lp(-1,-2));
      gap(c,8);c.addView(text(w.optString("focus")+" · "+w.optInt("minutes",60)+" min",13,MUTED,false),lp(-1,-2));
      gap(c,18);c.addView(button("Abrir ficha  →",true,()->startWorkout()),lp(-1,54));
      gap(c,8);c.addView(text(w.optString("note"),12,MUTED,false),lp(-1,-2));
    }
    LinearLayout stats=card(stack);label(stats,"SEU HISTÓRICO");
    JSONArray logs=state.optJSONArray("logs");
    stats.addView(text((logs==null?0:logs.length())+" sessões registradas",24,WHITE,true),lp(-1,-2));
    stats.addView(text("Nenhum número é estimado a partir da meta do treino.",12,MUTED,false),lp(-1,-2));
  }
  private void nav(String active){
    LinearLayout buttons=row();buttons.setPadding(0,0,0,dp(10));
    String[] items={"Início","Histórico","Perfil"};
    for(String item:items){
      TextView b=text(item,13,active.equals(item)?ACCENT:MUTED,true);
      b.setGravity(Gravity.CENTER);b.setBackground(shape(active.equals(item)?SURFACE:BG,active.equals(item)?STROKE:0,12));
      buttons.addView(b,new LinearLayout.LayoutParams(0,dp(48),1));
      b.setOnClickListener(v->{if(item.equals("Início"))showHome();else if(item.equals("Histórico"))showHistory();else showProfile();});
    }
    stack.addView(buttons,lp(-1,50));
  }
  private void startWorkout(){
    currentExercise=0;draft.clear();startedAt=System.currentTimeMillis();showWorkout();
  }
  private SetRecord record(String key){
    SetRecord r=draft.get(key);if(r==null){r=new SetRecord();draft.put(key,r);}return r;
  }
  private void showWorkout(){
    JSONObject workout=selectedWorkout();
    if(workout==null){error("Nenhum treino disponível.");return;}
    JSONArray exercises=workout.optJSONArray("exercises");
    if(exercises==null||exercises.length()==0){error("Ficha vazia.");return;}
    currentExercise=Math.max(0,Math.min(currentExercise,exercises.length()-1));
    JSONObject ex=exercises.optJSONObject(currentExercise);
    screen("EM TREINO");label(stack,workout.optString("name")+" · "+(currentExercise+1)+"/"+exercises.length());
    heading(stack,ex.optString("group","FORÇA"),ex.optString("name"),ex.optString("equipment")+" · "+ex.optString("tip"));
    LinearLayout info=card(stack);
    label(info,"PRESCRIÇÃO — NÃO É O REGISTRO");
    info.addView(text(ex.optInt("sets")+" séries · "+ex.optString("reps")+" · "+ex.optInt("restSeconds")+"s descanso",17,WHITE,true),lp(-1,-2));
    gap(info,10);info.addView(text(workout.optString("note"),12,MUTED,false),lp(-1,-2));
    int count=Math.max(1,Math.min(6,ex.optInt("sets",2)));
    for(int i=0;i<count;i++){
      int setIndex=i;String key=currentExercise+"-"+i;SetRecord rec=record(key);
      LinearLayout c=card(stack);label(c,"SÉRIE "+(i+1)+(rec.complete?"  ·  REGISTRADA":""));
      LinearLayout group=row();
      LinearLayout left=column(),right=column();group.addView(left,new LinearLayout.LayoutParams(0,-2,1));
      gapHorizontal(group,10);group.addView(right,new LinearLayout.LayoutParams(0,-2,1));
      EditText load=field(left,"Carga (kg)","0",InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL);load.setText(rec.load);
      boolean timed=ex.optString("reps","").contains(" s");
      EditText reps=field(right,timed?"Segundos":"Repetições","Realizadas",InputType.TYPE_CLASS_NUMBER);
      reps.setText(rec.reps);c.addView(group,lp(-1,-2));
      Spinner effort=spinner(c,"Repetições em reserva (opcional)",new String[]{"Não informar","0","1","2","3","4","5"});
      if(!rec.rir.isEmpty())effort.setSelection(Integer.parseInt(rec.rir)+1);
      c.addView(button(rec.complete?"Atualizar série ✓":"Registrar série",true,()->{
        String r=value(reps),l=value(load).replace(',','.');
        int repsDone;float kg;
        try{repsDone=Integer.parseInt(r);kg=l.isEmpty()?0:Float.parseFloat(l);}
        catch(Exception e){error("Informe repetições ou segundos realmente realizados.");return;}
        if(repsDone<1||repsDone>(timed?600:100)||!Float.isFinite(kg)||kg<0||kg>500){
          error("Confira a carga e o número de repetições ou segundos.");return;
        }
        rec.reps=r;rec.load=l;rec.rir=effort.getSelectedItemPosition()==0?"":String.valueOf(effort.getSelectedItemPosition()-1);
        rec.complete=true;showWorkout();
      }),lp(-1,48));
    }
    if(currentExercise>0){stack.addView(button("← Exercício anterior",false,()->{currentExercise--;showWorkout();}),lp(-1,52));gap(stack,10);}
    if(currentExercise<exercises.length()-1){
      stack.addView(button("Próximo exercício →",true,()->{currentExercise++;showWorkout();}),lp(-1,52));
    }else{
      stack.addView(button("Salvar treino realizado",true,()->saveWorkout()),lp(-1,52));
    }
    gap(stack,12);stack.addView(button("Voltar ao início (rascunho nesta sessão)",false,()->showHome()),lp(-1,52));
  }
  private void gapHorizontal(LinearLayout to,int width){
    View x=new View(this);to.addView(x,lp(width,1));
  }
  private void saveWorkout(){
    JSONObject workout=selectedWorkout();if(workout==null)return;
    JSONArray exercises=workout.optJSONArray("exercises");JSONArray setLogs=new JSONArray();JSONObject weights=new JSONObject();
    try{
      for(int x=0;x<exercises.length();x++){
        JSONObject e=exercises.getJSONObject(x);
        for(int y=0;y<e.optInt("sets",2);y++){
          String key=x+"-"+y;SetRecord rec=draft.get(key);
          if(rec==null||!rec.complete)continue;
          int reps=Integer.parseInt(rec.reps);double kg=rec.load.isEmpty()?0:Double.parseDouble(rec.load);
          JSONObject set=new JSONObject().put("exerciseId",e.optString("id")).put("exerciseName",e.optString("name"))
            .put("group",e.optString("group")).put("setIndex",y+1).put("weight",kg)
            .put("reps",reps).put("unit",e.optString("reps","").contains(" s")?"seconds":"reps")
            .put("rir",rec.rir.isEmpty()?JSONObject.NULL:Integer.valueOf(rec.rir))
            .put("targetRir",e.optInt("targetRir",2)).put("completed",true);
          setLogs.put(set);weights.put(key,String.valueOf(kg));
        }
      }
      if(setLogs.length()==0){error("Registre pelo menos uma série real antes de salvar.");return;}
      int minutes=Math.max(1,(int)((System.currentTimeMillis()-startedAt)/60000));
      JSONArray logs=state.optJSONArray("logs");if(logs==null)logs=new JSONArray();
      boolean partial=setLogs.length()<totalSets(exercises);
      JSONObject log=new JSONObject().put("id",UUID.randomUUID().toString())
        .put("name",workout.optString("name")+(partial?" · parcial":""))
        .put("date",new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX",Locale.US).format(new Date()))
        .put("minutes",minutes).put("sets",setLogs.length()).put("weights",weights)
        .put("setLogs",setLogs).put("feedback",new JSONObject().put("mode","detailed").put("partial",partial));
      JSONArray outgoingLogs=new JSONArray(logs.toString());outgoingLogs.put(log);
      JSONObject outgoing=new JSONObject(state.toString()).put("logs",outgoingLogs);
      run(()->api.request("PUT","/api/account",outgoing,revision),result->{
        draft.clear();refresh();new AlertDialog.Builder(this).setTitle("Treino salvo")
          .setMessage("Registradas "+setLogs.length()+" séries reais.")
          .setPositiveButton("OK",null)
          .setNeutralButton("Compartilhar resumo",(dialog,which)->share(workout.optString("name"),setLogs.length()))
          .show();
      });
    }catch(Exception ex){error("Não foi possível preparar o registro: "+ex.getMessage());}
  }
  private int totalSets(JSONArray ex){
    int total=0;for(int i=0;i<ex.length();i++)total+=ex.optJSONObject(i).optInt("sets",0);return total;
  }
  private void share(String workout,int count){
    Intent intent=new Intent(Intent.ACTION_SEND);intent.setType("text/plain");
    intent.putExtra(Intent.EXTRA_TEXT","TYVON • "+workout+"\n"+count+" séries registradas.");startActivity(Intent.createChooser(intent,"Compartilhar"));
  }
  private void showHistory(){
    screen("HISTÓRICO");nav("Histórico");heading(stack,"SEU REGISTRO","Os números ficam.","Só mostramos séries efetivamente registradas.");
    JSONArray logs=state.optJSONArray("logs");
    if(logs==null||logs.length()==0){stack.addView(text("Seu primeiro treino vai aparecer aqui.",16,MUTED,false));return;}
    for(int i=logs.length()-1;i>=Math.max(0,logs.length()-30);i--){
      JSONObject log=logs.optJSONObject(i);if(log==null)continue;
      LinearLayout c=card(stack);label(c,log.optString("date").length()>10?log.optString("date").substring(0,10):"TREINO");
      c.addView(text(log.optString("name"),22,WHITE,true),lp(-1,-2));
      gap(c,8);c.addView(text(log.optInt("sets")+" séries · "+log.optInt("minutes")+" min",14,MUTED,false),lp(-1,-2));
      c.addView(button("Compartilhar resumo",false,()->share(log.optString("name"),log.optInt("sets"))),lp(-1,48));
    }
  }
  private void showProfile(){
    screen("CONTA");nav("Perfil");heading(stack,"ATLETA","Seu espaço.","Seus dados ficam vinculados à sua conta TYVON.");
    LinearLayout c=card(stack);
    label(c,"DADOS DA ROTINA");c.addView(text(profile.optString("name"),26,WHITE,true),lp(-1,-2));
    gap(c,8);c.addView(text(profile.optInt("days")+" dias por semana · "+profile.optInt("sessionMinutes")+" minutos",14,MUTED,false),lp(-1,-2));
    gap(c,8);c.addView(text(profile.optString("goal"),14,WHITE,false),lp(-1,-2));
    gap(stack,16);stack.addView(button("Sair da conta",false,()->new AlertDialog.Builder(this)
      .setTitle("Sair?").setMessage("Você precisará entrar novamente para acessar os treinos.")
      .setNegativeButton("Cancelar",null).setPositiveButton("Sair",(d,w)->run(()->api.request("POST","/api/auth/logout",new JSONObject(),null),result->{api.clear();draft.clear();state=null;profile=null;showLogin();})).show()),lp(-1,54));
  }
  @Override public void onBackPressed(){
    if(state==null||profile==null||!profile.optBoolean("complete")){super.onBackPressed();return;}
    new AlertDialog.Builder(this).setTitle("Voltar ao início?")
      .setMessage("Séries não salvas permanecem apenas nesta sessão do aplicativo.")
      .setNegativeButton("Continuar aqui",null).setPositiveButton("Ir ao início",(d,w)->showHome()).show();
  }
}
