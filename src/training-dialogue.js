export const normalizeTrainingText=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const timedExercise=exercise=>/\bs\b|segundo/.test(String(exercise?.reps||''));
export const setDescription=set=>`${set.weight>0?`${set.weight} kg × `:''}${set.reps} ${set.unit==='seconds'?'s':'reps'}`;
const exerciseId=(exercise,index)=>exercise.id||'exercise-'+index;
const sameSet=(log,exercise,index,setIndex)=>log.exerciseId===exerciseId(exercise,index)&&log.setIndex===setIndex+1;
export function createTrainingSession(workout,now=Date.now()){
 return {id:crypto.randomUUID(),workout,exerciseIndex:0,setIndex:0,setLogs:[],startedAt:now,awaiting:null,draftWeight:null,restEndsAt:0};
}
export function trainingDialogue(session,text,now=Date.now()){
 const t=normalizeTrainingText(text),result=(next,reply,extra={})=>({handled:true,session:next,reply,...extra});
 if(/\b(dor|dores|tontura|desmaio|machuc|lesao)\b/.test(t))return result(session,'Interrompa o exercício se estiver com dor ou mal-estar. Nenhuma série foi registrada. Procure orientação profissional antes de continuar.');
 if(/\b(desfazer|desfaca|apagar ultima)\b/.test(t)){
  const last=session.setLogs.at(-1);if(!last)return result(session,'Ainda não há série registrada para desfazer.');
  const index=session.workout.exercises.findIndex((e,i)=>exerciseId(e,i)===last.exerciseId);
  return result({...session,setLogs:session.setLogs.slice(0,-1),exerciseIndex:Math.max(0,index),setIndex:last.setIndex-1,awaiting:null,draftWeight:null,restEndsAt:0},`Desfiz a série ${last.setIndex} de ${last.exerciseName}. Você pode registrá-la novamente.`);
 }
 if(/\b(pular descanso|sem descanso)\b/.test(t))return result({...session,restEndsAt:0},'Descanso encerrado. A série atual continua pronta para registrar.');
 let next={...session};
 const matches=session.workout.exercises.map((e,i)=>({e,i})).filter(({e})=>t.includes(normalizeTrainingText(e.name)));
 const selecting=/\b(estou|to|estou fazendo|mudar|ir para|exercicio|corrigir|corrige)\b/.test(t);
 if(!matches.length&&selecting){
  const phrase=t.replace(/^(?:estou (?:no|na|fazendo)|to (?:no|na)|(?:mudar|ir) para|exercicio)\s+/,'').replace(/\s+(?:serie|fiz|com)\b.*$/,'').trim();
  if(phrase.length>=4&&!/serie|\d/.test(phrase))matches.push(...session.workout.exercises.map((e,i)=>({e,i})).filter(({e})=>normalizeTrainingText(e.name).includes(phrase)));
 }
 if(matches.length>1)return result(session,'Esse nome corresponde a mais de um exercício. Use o nome completo da ficha para escolher.');
 if(matches.length===1&&matches[0].i!==next.exerciseIndex)next={...next,exerciseIndex:matches[0].i,setIndex:0,awaiting:null,draftWeight:null,restEndsAt:0};
 const series=t.match(/(?:serie\s*(\d+)|(\d+)\s*[ªºa.]?\s*serie)/);
 const exercise=next.workout.exercises[next.exerciseIndex];
 if(series){const number=Number(series[1]||series[2]);if(number<1||number>exercise.sets)return result(session,`Esse exercício tem ${exercise.sets} séries. Escolha uma delas.`);if(number-1!==next.setIndex)next={...next,setIndex:number-1,awaiting:null,draftWeight:null};}
 const weightMatch=t.match(/(-?\d+(?:[.,]\d+)?)\s*(?:kg|quilos?)(?=\s|$|\d)/),repMatch=t.match(/(-?\d+)\s*(?:reps?|repeticoes|repeticao)\b/),secondsMatch=t.match(/(-?\d+)\s*(?:s|seg|segundos?)\b/);
 const timed=timedExercise(exercise),valueMatch=timed?secondsMatch:repMatch;
 let weight=weightMatch?Number(weightMatch[1].replace(',','.')):null,value=valueMatch?Number(valueMatch[1]):null;
 const bare=t.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*$/);
 if(bare&&next.awaiting==='weight')weight=Number(bare[1].replace(',','.'));
 if(bare&&next.awaiting==='reps')value=Number(bare[1].replace(',','.'));
 const done=/\b(terminei|acabei|conclui|fiz|registrar|corrigir|corrige)\b/.test(t),data=weight!==null||value!==null;
 if(!done&&!data&&!next.awaiting){if(matches.length||series)return result(next,`${exercise.name}, série ${next.setIndex+1} de ${exercise.sets}. Alvo: ${exercise.reps}. Nenhuma série foi concluída.`);return {handled:false};}
 if(!done&&!data)return {handled:false};
 if(weight!==null&&(!Number.isFinite(weight)||weight<0||weight>500)||value!==null&&(!Number.isInteger(value)||value<1||value>(timed?600:100)))return result(next,`Confira os valores: carga de 0 a 500 kg e ${timed?'tempo de 1 a 600 segundos':'1 a 100 repetições'}. A série ainda não foi registrada.`);
 const weighted=exercise.equipment!=='Peso corporal';
 if(weight===null&&next.awaiting==='reps')weight=next.draftWeight;
 if(weighted&&weight===null)return result({...next,awaiting:'weight',draftReps:value},`Qual carga você usou na série ${next.setIndex+1} de ${exercise.name}? Envie, por exemplo, “20 kg”.`);
 if(value===null&&next.awaiting==='weight'&&Number.isInteger(next.draftReps))value=next.draftReps;
 if(value===null)return result({...next,awaiting:'reps',draftWeight:weighted?weight:0,draftReps:null},`Anotei ${weighted?`${weight} kg. `:''}Quantos ${timed?'segundos':'repetições'} você fez?`);
 const log={exerciseId:exerciseId(exercise,next.exerciseIndex),exerciseName:exercise.name,group:exercise.group||'',setIndex:next.setIndex+1,weight:weighted?weight:0,reps:value,unit:timed?'seconds':'reps',rir:null,targetRir:Number(exercise.targetRir??2),completed:true};
 const oldIndex=next.setLogs.findIndex(s=>sameSet(s,exercise,next.exerciseIndex,next.setIndex)),logs=[...next.setLogs];
 if(oldIndex>=0){logs.splice(oldIndex,1);logs.push(log)}else logs.push(log);
 next={...next,setLogs:logs,awaiting:null,draftWeight:null,draftReps:null,restEndsAt:now+(exercise.restSeconds||90)*1000};
 let missing=null;
 for(let i=0;i<next.workout.exercises.length&&!missing;i++)for(let j=0;j<next.workout.exercises[i].sets;j++)if(!logs.some(s=>sameSet(s,next.workout.exercises[i],i,j))){missing={exerciseIndex:i,setIndex:j};break}
 const reply=`${oldIndex>=0?'Corrigi':'Registrei'} ${exercise.name}, série ${log.setIndex}: ${setDescription(log)}.`;
 if(!missing)return result(next,reply,{complete:true});
 return result({...next,...missing},reply+` Próxima: ${next.workout.exercises[missing.exerciseIndex].name}, série ${missing.setIndex+1}.`);
}
