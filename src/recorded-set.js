// Only measured values belong in a completed set. The prescribed target is not evidence of performance.
export function parseCompletedSet(weightInput, repsInput, unit='reps'){
  const raw=String(repsInput??'').trim();
  if(!/^\d+$/.test(raw))return null;
  const reps=Number(raw),max=unit==='seconds'?600:100;
  if(!Number.isInteger(reps)||reps<1||reps>max)return null;
  const load=String(weightInput??'').trim().replace(',','.');
  if(load&&!/^(?:\d+)(?:\.\d+)?$/.test(load))return null;
  const weight=load?Number(load):0;
  if(!Number.isFinite(weight)||weight<0||weight>500)return null;
  return {weight,reps};
}
