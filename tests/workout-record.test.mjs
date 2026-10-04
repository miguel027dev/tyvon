import test from 'node:test';
import assert from 'node:assert/strict';
import {workoutRecord,upsertWorkoutRecord} from '../src/workout-record.js';
test('retry keeps identity but replaces a corrected or undone series',()=>{
 const pending=workoutRecord({sets:2,setLogs:[{weight:20},{weight:25}]},null,new Date(1000),()=> 'one');
 const corrected=workoutRecord({sets:1,setLogs:[{weight:22}]},pending,new Date(2000));
 assert.equal(corrected.id,'one');assert.equal(corrected.date,pending.date);
 const records=upsertWorkoutRecord([pending],corrected);
 assert.equal(records.length,1);assert.equal(records[0].sets,1);assert.deepEqual(records[0].setLogs,[{weight:22}]);
});
test('a different chat session never inherits an earlier failed record',()=>{
 const pending={id:'old',date:new Date(1000).toISOString()};
 const saved=workoutRecord({id:'new',sets:1},pending,new Date(2000));
 assert.equal(saved.id,'new');assert.equal(saved.date,new Date(2000).toISOString());
 assert.equal(upsertWorkoutRecord([pending],saved).length,2);
});
