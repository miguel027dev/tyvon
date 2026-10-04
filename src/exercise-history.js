const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const dayKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function isTimed(set){
 return /^(plank|prancha)$/.test(normalized(set.exerciseId))||/\b(prancha|plank)\b/.test(normalized(set.exerciseName))||/second|segundo|duration|tempo|time/.test(normalized(set.metric||set.unit))||set.unit==='s'||set.seconds!=null||set.durationSeconds!=null;
}
export function buildExerciseHistory(logs=[]){
 const exercises=new Map();
 for(const log of Array.isArray(logs)?logs:[]){
  const date=new Date(log?.date);if(!Number.isFinite(date.getTime()))continue;
  for(const set of Array.isArray(log?.setLogs)?log.setLogs:[]){
   if(set?.completed!==true||isTimed(set)||!String(set.exerciseName||'').trim())continue;
   // Current TYVON logs use kg; do not present a legacy lb value as kg.
   if(set.weightUnit&&!['kg','kilogram','kilograms'].includes(normalized(set.weightUnit)))continue;
   if(['lb','lbs','pound','pounds'].includes(normalized(set.unit)))continue;
   const weight=Number(set.weight),reps=Number(set.reps);
   if(set.weight==null||set.weight===''||set.reps==null||set.reps===''||!Number.isFinite(weight)||weight<0||weight>500||!Number.isInteger(reps)||reps<1||reps>100)continue;
   // Positional fallback IDs are not identities: exercise-0 can be any movement.
   const id=normalized(set.exerciseId),key=id&&!/^exercise-\d+$/.test(id)?`id:${id}`:`name:${normalized(set.exerciseName)}`;
   const item=exercises.get(key)||{key,name:set.exerciseName,sets:[]};
   item.sets.push({date:date.toISOString(),timestamp:date.getTime(),weight,reps,setIndex:Number(set.setIndex)||0,workoutName:log.name||log.workoutName||'Treino'});exercises.set(key,item);
  }
 }
 return [...exercises.values()].map(item=>{
  const sets=item.sets.sort((a,b)=>b.timestamp-a.timestamp||b.setIndex-a.setIndex);
  const latestDate=sets[0].timestamp,latestSets=sets.filter(set=>set.timestamp===latestDate).sort((a,b)=>a.setIndex-b.setIndex);
  const loaded=sets.filter(set=>set.weight>0),best=loaded.reduce((max,set)=>!max||set.weight>max.weight||(set.weight===max.weight&&set.reps>max.reps)?set:max,null);
  return {...item,sets,latestSets,best,sessionCount:new Set(sets.map(set=>set.timestamp)).size};
 }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
export function buildConsistency(logs=[],now=new Date()){
 const today=new Date(now);today.setHours(0,0,0,0);const days=[];
 for(let offset=29;offset>=0;offset--){const date=new Date(today);date.setDate(date.getDate()-offset);days.push({key:dayKey(date),date:date.toISOString(),count:0})}
 const byDay=new Map(days.map(day=>[day.key,day]));
 for(const log of Array.isArray(logs)?logs:[]){const date=new Date(log?.date);if(!Number.isFinite(date.getTime())||date.getTime()>new Date(now).getTime())continue;const day=byDay.get(dayKey(date));if(day)day.count++}
 return {days,activeDays:days.filter(day=>day.count>0).length,sessions:days.reduce((total,day)=>total+day.count,0)};
}
