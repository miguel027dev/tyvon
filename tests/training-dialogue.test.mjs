import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrainingSession,trainingDialogue,setDescription} from '../src/training-dialogue.js';
const workout={id:0,name:'Treino A',exercises:[{id:'bench',name:'Supino reto com barra',group:'Peitoral',sets:3,reps:'8–12',restSeconds:90,equipment:'Barras',targetRir:2},{id:'plank',name:'Prancha',group:'Core',sets:2,reps:'20–40 s',restSeconds:60,equipment:'Peso corporal'}]};
const start=()=>createTrainingSession(workout,1000);

test('selecting a numbered set does not complete it',()=>{
 const result=trainingDialogue(start(),'estou na série 2',2000);
 assert.equal(result.session.setIndex,1);assert.equal(result.session.setLogs.length,0);
 assert.match(result.reply,/Nenhuma série/);
});
test('explicit ordinal set with compact kg and reps is recorded exactly once',()=>{
 const result=trainingDialogue(start(),'fiz 2ª série com20kg10reps',2000);
 assert.deepEqual(result.session.setLogs.map(s=>[s.setIndex,s.weight,s.reps,s.rir]),[[2,20,10,null]]);
 const correction=trainingDialogue(result.session,'corrigir série 2 com 22,5 kg e 9 reps',3000);
 assert.equal(correction.session.setLogs.length,1);assert.equal(correction.session.setLogs[0].weight,22.5);
 assert.match(correction.reply,/Corrigi/);
});
test('separate weight and reps never silently use prescribed target',()=>{
 let result=trainingDialogue(start(),'terminei',2000);
 assert.equal(result.session.awaiting,'weight');assert.equal(result.session.setLogs.length,0);
 result=trainingDialogue(result.session,'20 kg',2000);
 assert.equal(result.session.awaiting,'reps');assert.equal(result.session.setLogs.length,0);
 result=trainingDialogue(result.session,'10',3000);
 assert.equal(result.session.setLogs[0].reps,10);assert.equal(result.session.setLogs[0].weight,20);
});
test('selection while awaiting load does not interpret series number as kg',()=>{
 const awaiting=trainingDialogue(start(),'terminei',2000).session;
 const result=trainingDialogue(awaiting,'estou na série 2',3000);
 assert.equal(result.session.setIndex,1);assert.equal(result.session.awaiting,null);assert.equal(result.session.setLogs.length,0);
});
test('unique exercise names select and timed records use seconds',()=>{
 let result=trainingDialogue(start(),'estou na Prancha',2000);
 assert.equal(result.session.exerciseIndex,1);assert.equal(result.session.setLogs.length,0);
 result=trainingDialogue(result.session,'fiz a série 1 por 35 segundos',3000);
 assert.equal(result.session.setLogs[0].unit,'seconds');assert.equal(result.session.setLogs[0].reps,35);
 assert.equal(setDescription(result.session.setLogs[0]),'35 s');
 assert.equal(result.complete,undefined); // earlier exercises cannot be skipped into completion
});
test('ambiguous exercise names require selection and do not alter session',()=>{
 const duplicate={...workout,exercises:[...workout.exercises,{...workout.exercises[0],id:'incline',name:'Supino inclinado com barra'}]};
 const s=createTrainingSession(duplicate,1000),result=trainingDialogue(s,'estou no supino',2000);
 assert.equal(result.session,s);assert.match(result.reply,/mais de um/);
});
test('undo restores actual logged set and serializable session draft',()=>{
 const saved=trainingDialogue(start(),'fiz série 2 com20kg10reps',2000).session;
 const restored=JSON.parse(JSON.stringify(saved));
 const undone=trainingDialogue(restored,'desfazer última série',3000);
 assert.equal(undone.session.setIndex,1);assert.equal(undone.session.setLogs.length,0);assert.equal(undone.session.restEndsAt,0);
});
test('invalid or dangerous messages do not register sets',()=>{
 for(const input of ['fiz série 2 com -20 kg e 10 reps','fiz série 9 com20kg10reps','fiz série 1 com20kg 0 reps','senti dor na série 2 com20kg10reps']){
  const result=trainingDialogue(start(),input,2000);assert.equal(result.session.setLogs.length,0);
 }
});
test('completion requires every exercise and series, with replacement not duplication',()=>{
 let s=start(),result;
 for(let index=1;index<=3;index++){result=trainingDialogue(s,`fiz série ${index} com20kg10reps`,2000);s=result.session;assert.equal(result.complete,undefined)}
 result=trainingDialogue(s,'fiz série 1 por30s',2000);s=result.session;assert.equal(result.complete,undefined);
 result=trainingDialogue(s,'fiz série 2 por30s',2000);assert.equal(result.complete,true);assert.equal(result.session.setLogs.length,5);
});
