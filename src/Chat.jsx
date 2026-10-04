import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowUpRight,ChevronLeft,Clock,RotateCcw} from 'lucide-react';
import ShinyText from './ShinyText';
import Bot from './Bot';
import {readableResponse} from './brand/chat-response';
import PromptInput from './PromptInput';
import WorkoutCards from './WorkoutCards';
import {makePlan,selectWorkoutCards,sanitizeWorkoutCards} from '../shared/workouts.js';
import {steps,parseAnswer,coachReply,onboardingQuestion} from './logic';
import {apiFetch} from './api.js';
import {chatWorkoutDraftKey,readChatWorkoutDraft,clearWorkoutDraft,workoutDraftKey,readWorkoutDraft} from './workout-draft.js';
import {normalizeTrainingText,createTrainingSession,trainingDialogue,setDescription,timedExercise} from './training-dialogue.js';
import './training-dialogue.css';

function plainResponse(text,cards){return readableResponse(text,{fallback:cards?.length?'Seu treino está nos cards abaixo.':''})}
const clean=normalizeTrainingText;
const format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;

export default function Chat({request,clearRequest,profile,p,setProfile,messages,setMessages,onboard,step,setStep,completed,plan,go,saveStatus,start,nextWorkoutId=0,onWorkoutComplete,userId,logs=[]}){
 const [busy,setBusy]=useState(false),[thinking,setThinking]=useState(false),[connection,setConnection]=useState(null),[preview,setPreview]=useState(false),[error,setError]=useState('');
 const [showSessionSheet,setShowSessionSheet]=useState(false);
 const [chatSession,setChatSession]=useState(()=>readChatWorkoutDraft(localStorage,chatWorkoutDraftKey(userId))),[chatNow,setChatNow]=useState(()=>Date.now());
 useEffect(()=>{const key=chatWorkoutDraftKey(userId);if(!key)return;if(chatSession){try{localStorage.setItem(key,JSON.stringify({session:chatSession,updatedAt:Date.now()}))}catch{}}else clearWorkoutDraft(localStorage,key)},[chatSession,userId]);
 const historyContainer=useRef(null),followBottom=useRef(true),timer=useRef(null),controller=useRef(null);
 const current=steps[step]?.key==='goal'&&profile?.age<18?{...steps[step],chips:['Ganhar massa muscular','Melhorar condicionamento','Criar uma rotina']}:steps[step];
 const history=messages.length?messages:[{role:'ai',text:`${p.name.split(' ')[0]}, sua ficha de hoje está pronta: ${plan[nextWorkoutId]?.name||'seu próximo treino'}. Você pode começar pelo botão abaixo ou me contar como está se sentindo.`,intro:true}];
 const liveExercise=chatSession?.workout?.exercises?.[chatSession.exerciseIndex];
 const rest=Math.max(0,Math.ceil(((chatSession?.restEndsAt||0)-chatNow)/1000));

 useEffect(()=>{const c=new AbortController();fetch('/api/chat/status',{signal:c.signal,cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(setConnection).catch(()=>{if(!c.signal.aborted)setConnection({configured:false})});return()=>{c.abort();clearTimeout(timer.current);controller.current?.abort()}},[]);
 useEffect(()=>{if(!chatSession?.restEndsAt)return;const id=setInterval(()=>setChatNow(Date.now()),500);return()=>clearInterval(id)},[chatSession?.restEndsAt]);
 useLayoutEffect(()=>{const el=historyContainer.current;if(el&&followBottom.current)el.scrollTop=el.scrollHeight},[messages,thinking,chatSession,rest]);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const viewport=window.visualViewport;let frame;function resize(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--chat-height',(viewport?.height||window.innerHeight)+'px');document.documentElement.style.setProperty('--chat-top',(viewport?.offsetTop||0)+'px')})}resize();viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);window.addEventListener('resize',resize);return()=>{document.body.style.overflow=previous;cancelAnimationFrame(frame);viewport?.removeEventListener('resize',resize);viewport?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);document.documentElement.style.removeProperty('--chat-height');document.documentElement.style.removeProperty('--chat-top')}},[]);
 useEffect(()=>{if(request&&!onboard&&connection){const text=request.text;clearRequest();send(text)}},[request?.id,connection,onboard]);

 function appendLocal(userText,aiText){
  followBottom.current=true;
  setMessages(prev=>[...(prev.length?prev:history),{role:'user',text:userText},{role:'ai',text:aiText}]);
 }

 function selectWorkout(text){
  const t=clean(text),letter=t.match(/treino\s+([a-e])\b/);
  if(letter)return plan[letter[1].charCodeAt(0)-97];
  return plan[Math.min(Math.max(0,nextWorkoutId),plan.length-1)];
 }

 function storeSession(session){
  const key=chatWorkoutDraftKey(userId);
  if(key){try{if(session)localStorage.setItem(key,JSON.stringify({session,updatedAt:Date.now()}));else clearWorkoutDraft(localStorage,key)}catch{}}
  setChatSession(session);
 }
 async function saveChatSession(session,partial=false){
  storeSession(session);setBusy(true);
  try{
   if(!onWorkoutComplete)throw new Error('Registro indisponível');
   const saved=await onWorkoutComplete({id:session.id||`chat-${userId}-${session.startedAt}`,workoutId:session.workout.id,workoutName:session.workout.name,name:session.workout.name+(partial?' · parcial':''),minutes:Math.max(1,Math.round((Date.now()-session.startedAt)/60000)),sets:session.setLogs.length,weights:{},setLogs:session.setLogs,feedback:{mode:'chat',...(partial?{partial:true}:{})}});
   if(saved===false)return false;
   storeSession(null);return true;
  }catch{return false}finally{setBusy(false)}
 }
 async function handleWorkoutMessage(text){
  if(onboard)return false;
  const t=clean(text),startIntent=/\b(comecei|comecar|iniciar|bora|vamos)\b/.test(t)&&(/\btreino\b/.test(t)||t==='comecei'||t==='bora');
  if(!chatSession&&startIntent){
   if(readWorkoutDraft(localStorage,workoutDraftKey(userId))){appendLocal(text,"Você já tem um treino em andamento. Volte ao Início e toque em Continuar treino para retomá-lo.");return true}
   const workout=selectWorkout(text),exercise=workout?.exercises?.[0];
   if(!workout||!exercise){appendLocal(text,"Essa ficha não está no seu plano. Confira as fichas em Meus treinos e escolha uma delas.");return true}
   storeSession(createTrainingSession(workout));
   appendLocal(text,`Começamos ${workout.name}. Primeiro: ${exercise.name}, ${exercise.sets} séries de ${exercise.reps}. Registre como “fiz a série 1 com 20 kg e 10 reps” ou me diga em qual exercício está.`);
   return true;
  }
  if(!chatSession)return false;
  if(/\b(cancelar|sair do treino|encerrar treino|salvar treino)\b/.test(t)){
   if(chatSession.setLogs.length){
    const total=chatSession.workout.exercises.reduce((sum,e)=>sum+e.sets,0),partial=chatSession.setLogs.length<total;
    const saved=await saveChatSession(chatSession,partial);
    appendLocal(text,saved?`Treino ${partial?'parcial ':''}salvo com ${chatSession.setLogs.length} séries.`:'Não foi possível salvar agora. Seus registros continuam neste aparelho. Tente salvar novamente quando a conexão voltar.');
   }else{storeSession(null);appendLocal(text,'Treino encerrado sem registros.');}
   return true;
  }
  const result=trainingDialogue(chatSession,text);
  if(!result.handled)return false;
  storeSession(result.session);
  if(result.complete){const saved=await saveChatSession(result.session);appendLocal(text,result.reply+(saved?' Treino concluído e salvo. Veja seu histórico em Minha evolução.':' O salvamento não foi concluído. Todas as séries continuam aqui: toque em Salvar treino para tentar novamente.'));}
  else appendLocal(text,result.reply);
  return true;
 }

 async function send(text,base=messages){
  if(busy)return;
  setError('');
  if(text.length>5000){setError('Use até 5.000 caracteres por mensagem.');return}
  if(await handleWorkoutMessage(text))return;
  if(!onboard&&!preview&&!connection?.configured){setError('A conversa com IA está indisponível. Sua ficha continua pronta: toque em Começar treino ou experimente a prévia.');return}
  followBottom.current=true;
  const nextMessages=[...(base.length?base:history),{role:'user',text}];
  setMessages(nextMessages);setBusy(true);setThinking(true);

  if(onboard||preview){
   timer.current=setTimeout(()=>{
    if(onboard){
     const answer=parseAnswer(current,text);
     if(answer.error)setMessages(prev=>[...prev,{role:'ai',text:answer.error}]);
     else{
      const next={...profile,[current.key]:answer.value};
      setProfile(next);
      if(step<steps.length-1){
       setStep(step+1);setMessages(prev=>[...prev,{role:'ai',text:onboardingQuestion(step+1,next)}]);
      }else{
       completed(next);
       setMessages(prev=>[...prev,{role:'ai',text:`Tudo pronto, ${next.name}! Montei ${makePlan(next).length} sessões por semana para ${next.goal.toLowerCase()}, com cerca de ${next.sessionMinutes||60} minutos por treino.

Cada dia tem uma ficha completa, com exercícios, séries, repetições e descanso definidos.

${next.age<18?'Vamos priorizar técnica, recuperação e acompanhamento profissional.':next.experience==='Iniciante'?'Comece com calma e registre suas cargas.':'Use o histórico para evoluir sem trocar a ficha toda hora.'}${next.limitations!=='Nenhuma'?' Como você informou uma restrição, valide os exercícios com um profissional.':''}`,workouts:makePlan(next),plan:true}]);
      }
     }
    }else setMessages(prev=>[...prev,{role:'ai',text:coachReply(text,p),preview:true,workouts:selectWorkoutCards(text,p,nextWorkoutId)}]);
    setThinking(false);setBusy(false);
   },550);
   return;
  }

  const c=new AbortController();controller.current=c;let reply='',pending='',appended=false;
  try{
   const response=await apiFetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:nextMessages.filter(m=>m.text&&!m.error&&!m.preview).slice(-16).map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text})),nextWorkoutId}),signal:c.signal});
   if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Não foi possível conectar a IA. Tente novamente.')}
   if(response.headers.get('Content-Type')?.includes('application/json')){
    const data=await response.json(),cards=sanitizeWorkoutCards(data.workouts);
    setMessages(prev=>[...prev,{role:'ai',text:readableResponse(data.message),workouts:cards}]);
    return;
   }
   if(!response.body)throw new Error('A resposta não chegou. Tente novamente.');
   const reader=response.body.getReader(),decoder=new TextDecoder();
   function receive(line){
    if(!line.startsWith('data:'))return;
    const raw=line.slice(5).trim();if(!raw)return;
    let data;try{data=JSON.parse(raw)}catch{return}
    if(data.type==='error')throw new Error('A resposta foi interrompida. Tente novamente.');
    if(data.type==='done')return;
    if(data.type!=='token'||typeof data.text!=='string')return;
    reply+=data.text;setThinking(false);
    if(!appended){appended=true;setMessages(prev=>[...prev,{role:'ai',text:readableResponse(reply,{fallback:''}),live:true}])}
    else setMessages(prev=>prev.map((m,i)=>i===prev.length-1?{...m,text:readableResponse(reply,{fallback:''})}:m));
   }
   for(;;){const {done,value}=await reader.read();if(done){pending+=decoder.decode();break}pending+=decoder.decode(value,{stream:true});const lines=pending.split('\n');pending=lines.pop();for(const line of lines)receive(line.trimEnd())}
   if(pending)receive(pending.trimEnd());
   if(appended)setMessages(prev=>prev.map((m,i)=>i===prev.length-1?{...m,text:readableResponse(reply),live:false}:m));
   if(!reply.trim())throw new Error('A IA não retornou uma resposta. Tente novamente.');
  }catch(e){if(e.name!=='AbortError')setError((reply?'A resposta foi interrompida. ':'')+e.message)}
  finally{setMessages(prev=>prev.map(m=>m.live?{...m,live:false}:m));setThinking(false);setBusy(false)}
 }
 function retry(){const idx=messages.findLastIndex(m=>m.role==='user');if(idx>=0)send(messages[idx].text,messages.slice(0,idx))}
 const placeholders={name:'Digite seu nome',age:'Quantos anos você tem?',height:'Sua altura em cm',weight:'Digite seu peso em kg',goal:'Qual é o seu objetivo?',experience:'Como está sua experiência?',equipment:'Quais equipamentos você tem?',days:'Quantos dias por semana?',sessionMinutes:'Quanto tempo por treino?',limitations:'Existe alguma restrição?'};
 const suggestions=chatSession?(chatSession.setLogs.length===chatSession.workout.exercises.reduce((sum,e)=>sum+e.sets,0)?['Salvar treino']:rest>0?['Pular descanso','Encerrar treino']:['Encerrar treino']):(onboard?current?.chips:['Começar treino de hoje','Qual treino faço hoje?','Como escolher a carga?','Como organizar meu descanso?']);

 return <div className={'chat-page reference-chat '+(onboard?'onboarding-chat':'regular-chat')}><div className="chat-stage">
  <div className="chat-navigation"><button className="chat-back" disabled={busy&&onboard} aria-label={onboard?'Pausar apresentação':'Voltar ao painel'} onClick={()=>go(onboard?'entry':'overview')}><ChevronLeft size={19}/><span>{onboard?'Pausar':'Meu espaço'}</span></button><span className="chat-session-label">{onboard?`Seu perfil · ${step+1} de ${steps.length}`:preview?'Prévia demonstrativa':chatSession?'TREINO AO VIVO':'TYVON AI'}</span><button disabled={busy&&onboard} className="chat-profile-link" onClick={()=>go(onboard?'entry':'profile')}>{onboard?'Continuar depois':'Perfil'}{!onboard&&<ArrowUpRight size={13}/>}</button></div>
  {onboard&&<div className="onboarding-progress" role="progressbar" aria-label="Seu perfil" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={steps.length}><motion.div animate={{width:((step+1)/steps.length*100)+'%'}}/></div>}
  <div ref={historyContainer} onScroll={e=>{const el=e.currentTarget;followBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<80}} className="reference-history" role="log" aria-live="polite" aria-busy={busy}>
   <div className="companion-intro"><Bot thinking={thinking}/><span>{onboard?'VAMOS CONHECER SEU RITMO':chatSession?'TREINO EM ANDAMENTO':'SEU PRÓXIMO PASSO COMEÇA AQUI'}</span></div>
   {history.map((m,i)=><motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.2}} key={i} className={'message '+m.role}><div><div className="bubble">{m.role==='ai'?(onboard?plainResponse(m.text,m.workouts).replace(/\n\s*\n/g,' '):plainResponse(m.text,m.workouts)):m.text}</div>{m.preview&&<small className="preview-label">Resposta de demonstração</small>}{m.role==='ai'&&!m.live&&(m.workouts?.length||m.plan)&&<WorkoutCards workouts={m.workouts?.length?m.workouts:plan} onStart={start} onOpen={()=>go('workouts')}/>}</div></motion.div>)}
   <AnimatePresence>{thinking&&<motion.div className="reference-thinking" role="status" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="thinking-dots"><i/><i/><i/></span><ShinyText text="Pensando…" speed={2} color="#777777" shineColor="#eeeeee"/></motion.div>}</AnimatePresence>
  </div>
  <div className="reference-compose">
   {!onboard&&!chatSession&&<div className="chat-quick-workout"><div><span>SUA FICHA DE HOJE</span><strong>{plan[nextWorkoutId]?.name}</strong><small>{plan[nextWorkoutId]?.minutes} min · {plan[nextWorkoutId]?.exercises.length} exercícios</small></div><button disabled={busy} onClick={()=>start(plan[nextWorkoutId])}>Começar treino<ArrowUpRight size={16}/></button></div>}
   {chatSession&&liveExercise&&<section className="training-context-card" aria-label="Treino em andamento">
    <div className="training-context-top"><span>{chatSession.workout.name}</span><strong>{chatSession.setLogs.length}/{chatSession.workout.exercises.reduce((sum,e)=>sum+e.sets,0)} séries</strong></div>
    <div className="training-context-main"><div><h2>{liveExercise.name}</h2><p>Série {chatSession.setIndex+1}/{liveExercise.sets} · alvo {liveExercise.reps}</p></div>{rest>0?<span className="training-context-rest"><Clock size={14}/>{format(rest)}</span>:<span className="training-context-ready">{chatSession.awaiting==='weight'?'Informe a carga':chatSession.awaiting==='reps'?`Informe ${timedExercise(liveExercise)?'os segundos':'as reps'}`:'Pronto para registrar'}</span>}</div>
    <div className="training-context-previous"><span>Anterior</span><strong>{(()=>{for(let i=logs.length-1;i>=0;i--){const previous=(logs[i].setLogs||[]).find(s=>s.completed&&s.exerciseId===liveExercise.id&&s.setIndex===chatSession.setIndex+1);if(previous)return setDescription({...previous,unit:timedExercise(liveExercise)?'seconds':'reps'})}return 'Primeiro registro desta série'})()}</strong></div>
    <div className="training-context-actions"><button disabled={busy} onClick={()=>send('Terminei a série')}>Registrar série</button><button disabled={busy} onClick={()=>send(`Estou na série ${chatSession.setIndex+1}`)}>Me guiar</button><button aria-expanded={showSessionSheet} onClick={()=>setShowSessionSheet(v=>!v)}>Ficha</button><button disabled={busy||!chatSession.setLogs.length} onClick={()=>send('Desfazer última série')}>Desfazer</button></div>
    {showSessionSheet&&<div className="training-context-sheet">{chatSession.workout.exercises.map((exercise,i)=><button key={exercise.id||i} disabled={busy} onClick={()=>{send(`Estou no ${exercise.name}`);setShowSessionSheet(false)}}><span>{exercise.name}</span><small>{chatSession.setLogs.filter(s=>s.exerciseId===exercise.id).length}/{exercise.sets} · {exercise.reps}</small></button>)}</div>}
   </section>}
   {!onboard&&!chatSession&&connection&&!connection.configured&&<div className="connection-note"><span>{preview?'Você está explorando respostas de exemplo.':'O TYVON AI está indisponível no momento.'}</span><button onClick={()=>setPreview(!preview)} disabled={busy}>{preview?'Sair da prévia':'Experimentar prévia'}<ArrowUpRight size={12}/></button></div>}
   <div className="suggestions">{suggestions?.map(c=><button key={c} disabled={busy} onClick={()=>send(c)}>{c}</button>)}</div>
   {onboard&&current?.hint&&<p className="input-hint">{current.hint}</p>}
   {error&&<div className="chat-error" role="alert"><span>{error}</span>{connection?.configured&&<button disabled={busy} onClick={retry}><RotateCcw size={13}/>Tentar de novo</button>}</div>}
   <PromptInput backDisabled={busy&&onboard} onSubmit={send} disabled={busy} onBack={()=>go(onboard?'entry':'overview')} placeholder={onboard?placeholders[current?.key]:chatSession?'Registre a série ou fale com o TYVON…':'Converse com o TYVON…'} mode={onboard?'Seu perfil':chatSession?'Treino ao vivo':preview?'Prévia':connection?.configured?'Conectado':'Aguardando conexão'}/>
   <p className="chat-disclaimer">{onboard?(saveStatus==='saving'?'Salvando seu progresso…':saveStatus==='error'?'Salvamento pendente. Suas respostas continuam aqui.':'Seu progresso está salvo. Continue no seu tempo.'):chatSession?'Carga e repetições ficam ligadas ao seu histórico de treino.':'A IA pode errar. Valide decisões de treino com um profissional.'}</p>
  </div>
 </div></div>;
}
