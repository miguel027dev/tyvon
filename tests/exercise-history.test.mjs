import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExerciseHistory,buildConsistency} from '../src/exercise-history.js';
const set=(name,weight,reps,extra={})=>({exerciseName:name,weight,reps,completed:true,setIndex:1,...extra});
const log=(date,setLogs)=>({date,name:'Treino A',setLogs});
test('latest values follow dates, best load is observed not an estimated maximum',()=>{
 const result=buildExerciseHistory([log('2026-09-02',[set('Supino',30,8)]),log('2026-09-01',[set('Supino',32,5)]),log('2026-09-03',[set('Supino',28,10)])])[0];
 assert.equal(result.latestSets[0].weight,28);assert.equal(result.best.weight,32);assert.equal(result.best.reps,5);assert.equal(result.sessionCount,3);
});
test('positional fallback IDs never combine different exercises',()=>{
 const history=buildExerciseHistory([log('2026-09-01',[set('Supino',20,8,{exerciseId:'exercise-0'}),set('Remada',30,8,{exerciseId:'exercise-0'})])]);assert.equal(history.length,2);
});
test('stable IDs distinguish different equipment with same display name',()=>{
 assert.equal(buildExerciseHistory([log('2026-09-01',[set('Supino',20,8,{exerciseId:'db_bench'}),set('Supino',40,8,{exerciseId:'barbell_bench'})])]).length,2);
});
test('loads in pounds are not compared to kilogram records',()=>{
 const result=buildExerciseHistory([log('2026-09-01',[set('Supino',100,8,{weightUnit:'lb'}),set('Supino',30,8,{weightUnit:'kg'})])])[0];assert.equal(result.best.weight,30);assert.equal(result.sets.length,1);
});
test('timed planks and duration sets are excluded from load/repetition records',()=>{
 assert.deepEqual(buildExerciseHistory([log('2026-09-01',[set('Prancha',0,30),set('Core',0,30,{exerciseId:'plank'}),set('Isometria',20,30,{unit:'seconds'})])]),[]);
});
test('empty, incomplete and invalid records do not manufacture progress',()=>{
 assert.deepEqual(buildExerciseHistory(),[]);assert.deepEqual(buildExerciseHistory([log('invalid',[set('Supino',20,8)]),log('2026-09-01',[set('Supino',20,8,{completed:false}),set('Supino',null,8),set('Supino',20,0)])]),[]);
 const bodyweight=buildExerciseHistory([log('2026-09-01',[set('Flexão',0,12)])])[0];assert.equal(bodyweight.best,null);assert.equal(bodyweight.latestSets[0].reps,12);
});
test('consistency counts calendar days once and includes today with a 30 day window',()=>{
 const now=new Date(2026,9,3,12);const date=offset=>{const d=new Date(now);d.setDate(d.getDate()+offset);return d.toISOString()};
 const result=buildConsistency([log(date(0),[]),log(date(0),[]),log(date(-29),[]),log(date(-30),[]),log(date(1),[]),log('bad',[])],now);
 assert.equal(result.days.length,30);assert.equal(result.sessions,3);assert.equal(result.activeDays,2);assert.equal(result.days.at(-1).count,2);
});
