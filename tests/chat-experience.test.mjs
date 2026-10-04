import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAnswer,steps,onboardingQuestion} from '../src/logic.js';
const step=key=>steps.find(s=>s.key===key);

test('onboarding keeps a single TYVON experience and strict bounds',()=>{
 assert.equal(steps.length,10);
 assert.equal(steps.at(-1).key,'limitations');
 for(const answer of ['18','18 anos','Tenho 18 anos','Minha idade é 18'])assert.deepEqual(parseAnswer(step('age'),answer),{value:18});
 for(const answer of ['12 anos','13 anos','18.5','18 ou 19','101 anos'])assert.ok(parseAnswer(step('age'),answer).error);
 assert.deepEqual(parseAnswer(step('height'),'1,75 m'),{value:175});
 assert.deepEqual(parseAnswer(step('height'),'175 cm'),{value:175});
 assert.ok(parseAnswer(step('height'),'250 cm').error);
 assert.deepEqual(parseAnswer(step('weight'),'78,5 kg'),{value:78.5});
 assert.deepEqual(parseAnswer(step('days'),'4 dias por semana'),{value:4});
 assert.deepEqual(parseAnswer(step('sessionMinutes'),'60 min'),{value:60});
 assert.ok(parseAnswer(step('sessionMinutes'),'15 min').error);
 assert.ok(parseAnswer(step('days'),'4 ou 5').error);
 assert.deepEqual(parseAnswer(step('experience'),'sou avançado'),{value:'Avançado'});
 assert.equal(onboardingQuestion(1,{name:'Miguel'}),'Prazer, Miguel! Qual é a sua idade?');
});

test('equipment parsing is bounded to known options',()=>{
 assert.deepEqual(parseAnswer(step('equipment'),'Academia completa').value,['Halteres','Barras','Máquinas','Cabos','Banco']);
 assert.deepEqual(parseAnswer(step('equipment'),'só peso corporal').value,['Peso corporal']);
 assert.ok(parseAnswer(step('equipment'),'qualquer coisa').error);
});

import {readWorkoutDraft,saveWorkoutDraft,workoutDraftKey,readChatWorkoutDraft,chatWorkoutDraftKey} from '../src/workout-draft.js';
test('workout recovery is scoped, expires and survives storage failures',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const key=workoutDraftKey('athlete-1'),workout={id:0,exercises:[{sets:2}]};
 saveWorkoutDraft(storage,key,{workout,index:0,seconds:120,checked:{'0-0':true}});
 assert.equal(readWorkoutDraft(storage,key).seconds,120);
 assert.equal(readWorkoutDraft(storage,workoutDraftKey('athlete-2')),null);
 assert.equal(readWorkoutDraft(storage,key,Date.now()+86400001),null);
 storage.setItem(key,JSON.stringify({version:1,updatedAt:Date.now(),workout,index:9,seconds:0,checked:{}}));
 assert.equal(readWorkoutDraft(storage,key),null);
 assert.equal(saveWorkoutDraft({setItem(){throw Error('quota')}},key,{}),false);
 assert.equal(readWorkoutDraft({getItem(){throw Error('blocked')}},key),null);
 const session={workout,exerciseIndex:0,setIndex:1,setLogs:[],startedAt:Date.now()};
 const chatKey=chatWorkoutDraftKey('athlete-1');storage.setItem(chatKey,JSON.stringify({session,updatedAt:Date.now()}));
 assert.equal(readChatWorkoutDraft(storage,chatKey).setIndex,1);
 assert.equal(readChatWorkoutDraft(storage,chatKey,Date.now()+86400001),null);
});


test('optional body metrics can be skipped without invented values',()=>{
 for(const key of ['height','weight'])for(const answer of ['Pular','Prefiro não informar','Depois'])assert.deepEqual(parseAnswer(step(key),answer),{value:null});
 assert.ok(parseAnswer(step('age'),'Pular').error);
});
