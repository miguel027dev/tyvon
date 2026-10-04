import React,{useEffect,useId,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronRight,Clock,Dumbbell,ShieldCheck} from 'lucide-react';
import {steps,parseAnswer,makePlan} from './logic.js';
import './onboarding-flow.css';

const EQUIPMENT=['Halteres','Barras','Máquinas','Cabos','Banco','Peso corporal'];
const UNITS={height:'cm',weight:'kg',age:'anos'};
function inputValue(profile,key){const v=profile?.[key];return Array.isArray(v)?v.join(', '):v==null?'':String(v)}

export default function OnboardingFlow({profile,setProfile,step,setStep,completed,setMessages}){
 const index=Math.max(0,Math.min(steps.length-1,step||0)),current=steps[index],fieldId=useId();
 const [value,setValue]=useState(()=>inputValue(profile,current.key)),[error,setError]=useState(''),[ready,setReady]=useState(false),[reviewing,setReviewing]=useState(false);
 const plan=useMemo(()=>makePlan(profile||{}),[profile]);
 const chips=current.key==='goal'&&profile?.age<18?current.chips.filter(c=>c!=='Perder gordura'):current.chips;
 useEffect(()=>{setValue(inputValue(profile,current.key));setError('')},[index]);
 function advance(next){setProfile(next);setError('');if(reviewing){setReviewing(false);setReady(true)}else if(index<steps.length-1)setStep(index+1);else setReady(true)}
 function submit(event){
  event?.preventDefault();
  if(['height','weight'].includes(current.key)&&!value.trim()){advance({...profile,[current.key]:null});return}
  if(current.key==='limitations'&&!value.trim()){advance({...profile,limitations:'Nenhuma'});return}
  const answer=parseAnswer(current,value);
  if(answer.error){setError(answer.error);return}
  const next={...profile,[current.key]:answer.value};
  if(current.key==='age'&&answer.value<18&&next.goal==='Perder gordura')next.goal='Criar uma rotina';
  advance(next);
 }
 function skipBody(){setProfile({...profile,height:null,weight:null});setError('');if(reviewing){setReviewing(false);setReady(true)}else setStep(4)}
 function edit(index){setReviewing(true);setReady(false);setStep(index)}
 function complete(){
  const final={...profile,height:profile?.height??null,weight:profile?.weight??null,limitations:profile?.limitations?.trim()||'Nenhuma'};
  for(const s of steps.filter(s=>!['height','weight','limitations'].includes(s.key))){const result=parseAnswer(s,inputValue(final,s.key));if(result.error){setReady(false);setReviewing(true);setStep(steps.findIndex(v=>v.key===s.key));setError(result.error);return}}
  completed(final);
  setMessages?.(prev=>[...prev,{role:'ai',text:`Seu plano está pronto, ${final.name}. São ${makePlan(final).length} fichas com exercícios, séries e descanso. Você já pode começar seu primeiro treino.`,workouts:makePlan(final),plan:true}]);
 }
 const selectedEquipment=value.split(',').map(v=>v.trim());
 function toggleEquipment(eq){const list=selectedEquipment.filter(Boolean);setValue(list.includes(eq)?list.filter(v=>v!==eq).join(', '):[...list,eq].join(', '));setError('')}
 return <section className="onboarding-flow" aria-label="Personalizar meu treino">
  <header className="onboarding-flow-header"><button type="button" aria-label={ready?'Voltar à última pergunta':'Voltar à pergunta anterior'} disabled={!ready&&index===0} onClick={()=>{setError('');if(ready){setReady(false);setStep(steps.length-1)}else if(reviewing){setReviewing(false);setReady(true)}else setStep(Math.max(0,index-1))}}><ArrowLeft size={18}/><span>Voltar</span></button><span>{ready?'REVISE SEU PLANO':`SEU PERFIL · ${index+1}/${steps.length}`}</span><ShieldCheck size={18}/></header>
  <div className="onboarding-flow-progress" role="progressbar" aria-label="Personalização do treino" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={ready?steps.length:index}><span style={{width:`${(ready?steps.length:index)/steps.length*100}%`}}/></div>
  {ready?<div className="onboarding-flow-card onboarding-plan-ready"><span className="onboarding-flow-eyebrow">FEITO PARA SUA ROTINA</span><h1>{profile?.name?.split(' ')[0]}, sua ficha está pronta.</h1><p>Confira seu ponto de partida. Você pode ajustar tudo pelo Perfil depois.</p><div className="onboarding-review-fields">{[[0,'Nome',profile?.name],[1,'Idade',`${profile?.age} anos`],[4,'Objetivo',profile?.goal],[5,'Experiência',profile?.experience],[6,'Equipamentos',profile?.equipment?.join(', ')],[7,'Rotina',`${profile?.days} dias por semana`],[8,'Duração',`${profile?.sessionMinutes} min por treino`],[2,'Altura (opcional)',profile?.height==null?'Não informada':`${profile.height} cm`],[3,'Peso (opcional)',profile?.weight==null?'Não informado':`${profile.weight} kg`],[9,'Restrições',profile?.limitations||'Nenhuma']].map(([i,label,text])=><button key={label} type="button" onClick={()=>edit(i)}><span><small>{label}</small><strong>{text}</strong></span><span className="onboarding-edit">Editar<ChevronRight size={15}/></span></button>)}</div><div className="onboarding-ready-sessions">{plan.map((w,i)=><details key={w.id}><summary><span className="onboarding-day-letter">{String.fromCharCode(65+i)}</span><span><strong>{w.name}</strong><small><Clock size={12}/>{w.minutes} min · {w.exercises.length} exercícios</small></span><ChevronRight size={17}/></summary><ol>{w.exercises.map(e=><li key={e.id||e.name}><span>{e.name}</span><small>{e.sets} × {e.reps} · {e.restSeconds}s descanso</small></li>)}</ol><p>{w.recovery}</p></details>)}</div>{profile?.age<18&&<p className="onboarding-flow-safety">Priorize técnica, recuperação e acompanhamento de responsável e profissional.</p>}<button type="button" className="onboarding-flow-primary" onClick={complete}><Check size={18}/>Usar meu plano</button><p className="onboarding-flow-private">Seu perfil fica vinculado à sua conta. Compartilhar cards é uma escolha sua.</p></div>:<form className="onboarding-flow-card" onSubmit={submit} noValidate><span className="onboarding-flow-eyebrow">{reviewing?'AJUSTAR MEU PERFIL':index<4?'SEU PONTO DE PARTIDA':'UMA ROTINA QUE CABE NO SEU DIA'}</span><h1>{current.question}</h1><p id={`${fieldId}-hint`}>{['height','weight'].includes(current.key)?'Opcional. Você pode montar sua ficha sem informar altura ou peso.':current.hint||'Escolha a opção que combina com você.'}</p>
   {chips&&<div className="onboarding-flow-choices" role="group" aria-label={current.question}>{chips.map(chip=>{const parsed=current.key==='equipment'?parseAnswer(current,chip).value:null;const active=current.key==='equipment'?JSON.stringify([...selectedEquipment].sort())===JSON.stringify([...(parsed||[])].sort()):value===chip||(['days','sessionMinutes'].includes(current.key)&&String(Number.parseInt(value))===String(Number.parseInt(chip)));return <button key={chip} type="button" aria-pressed={active} className={active?'selected':''} onClick={()=>{setValue(current.key==='equipment'?parsed.join(', '):chip);setError('')}}>{chip}{active&&<Check size={17}/>}</button>})}</div>}
   {current.key==='equipment'&&<fieldset className="onboarding-equipment-options"><legend>Ou escolha seus equipamentos</legend>{EQUIPMENT.map(eq=><label key={eq}><input type="checkbox" checked={selectedEquipment.includes(eq)} onChange={()=>toggleEquipment(eq)}/>{eq}</label>)}</fieldset>}
   {(!chips||current.key==='limitations')&&<label className="onboarding-flow-field" htmlFor={fieldId}><span>{current.key==='limitations'?'Se quiser, descreva a restrição':'Sua resposta'}{['height','weight','limitations'].includes(current.key)&&' · opcional'}</span><div>{current.key==='limitations'?<textarea id={fieldId} maxLength={500} rows={3} value={value} onChange={e=>{setValue(e.target.value);setError('')}} placeholder="Nenhuma" aria-describedby={`${fieldId}-hint`} aria-invalid={!!error}/>:<input key={current.key} id={fieldId} type="text" autoComplete={current.key==='name'?'given-name':'off'} inputMode={['age','height','weight'].includes(current.key)?'decimal':'text'} maxLength={current.key==='name'?40:30} value={value} onChange={e=>{setValue(e.target.value);setError('')}} placeholder={{name:'Seu primeiro nome',age:'Sua idade',height:'Ex.: 175',weight:'Ex.: 70,5'}[current.key]} aria-describedby={`${fieldId}-hint`} aria-invalid={!!error}/>} {UNITS[current.key]&&<span aria-hidden="true">{UNITS[current.key]}</span>}</div></label>}
   {error&&<p className="onboarding-flow-error" role="alert">{error}</p>}<button type="submit" className="onboarding-flow-primary">{reviewing?'Salvar ajuste':index===steps.length-1?'Ver minha ficha':'Continuar'}<ArrowRight size={18}/></button>{['height','weight'].includes(current.key)&&<button type="button" className="onboarding-flow-skip" onClick={skipBody}>Pular dados corporais</button>}{current.key==='limitations'&&<button type="button" className="onboarding-flow-skip" onClick={()=>advance({...profile,limitations:'Nenhuma'})}>Continuar sem restrições</button>}<p className="onboarding-flow-private">Seu progresso é salvo na sua conta. Pode continuar depois.</p>
  </form>}
 </section>
}
