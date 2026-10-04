import {useCallback,useEffect,useRef,useState} from 'react';
import {accountRequest} from './api.js';
import {SaveQueue} from './save-queue.js';
export {accountRequest} from './api.js';

function durableSnapshot(state){
 return {profile:state.profile,logs:state.logs,step:state.step,messages:(state.messages||[]).filter(m=>!m.live).map(({live,...m})=>m)};
}
export default function useAccountStore(state,enabled,accountId){
 const [status,setStatus]=useState('saved'),[error,setError]=useState('');
 const latest=useRef(state),timer=useRef(null),alive=useRef(true),enabledRef=useRef(enabled);
 const queue=useRef(new SaveQueue(snapshot=>accountRequest('PUT',snapshot))),identity=useRef(accountId);
 latest.current=state;enabledRef.current=enabled;
 if(identity.current!==accountId){identity.current=accountId;queue.current=new SaveQueue(snapshot=>accountRequest('PUT',snapshot));clearTimeout(timer.current)}
 const drain=useCallback(async()=>{
  const active=queue.current;
  if(alive.current){setStatus('saving');setError('')}
  try{await active.drain();if(alive.current&&active===queue.current)setStatus('saved')}
  catch(e){if(alive.current&&active===queue.current){setStatus('error');setError(e.status===409?'Sua conta mudou em outra aba ou dispositivo. Reabra o TYVON para carregar essa versão antes de salvar.':e.message)}throw e}
 },[]);
 const flush=useCallback((override)=>{
  clearTimeout(timer.current);
  if(enabledRef.current&&latest.current.profile)queue.current.enqueue(durableSnapshot(override||latest.current));
  return drain();
 },[drain]);
 useEffect(()=>{
  if(!enabled||!state.profile)return;
  const snapshot=durableSnapshot(state);
  if(JSON.stringify(snapshot)===queue.current.saved)return;
  queue.current.enqueue(snapshot);setStatus('saving');clearTimeout(timer.current);
  timer.current=setTimeout(()=>drain().catch(()=>{}),900);
  return()=>clearTimeout(timer.current);
 },[state.profile,state.messages,state.logs,state.step,enabled,accountId,drain]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(timer.current)}},[]);
 return {status,error,flush,retry:()=>flush().catch(()=>{})};
}
