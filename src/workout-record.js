export function workoutRecord(log,pending=null,now=new Date(),newId=()=>crypto.randomUUID()){
 const reuse=pending&&(!log.id||log.id===pending.id)?pending:null;
 return {...log,engine:'tyvon',setLogs:log.setLogs||[],feedback:log.feedback||{},date:reuse?.date||now.toISOString(),id:log.id||reuse?.id||newId()};
}
export function upsertWorkoutRecord(logs,saved){
 return logs.some(log=>log.id===saved.id)?logs.map(log=>log.id===saved.id?saved:log):[...logs,saved];
}
