import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCompletedSet} from '../src/recorded-set.js';

test('a planned target cannot be treated as performed reps',()=>{
  assert.equal(parseCompletedSet('',undefined),null);
  assert.equal(parseCompletedSet('40',''),null);
  assert.deepEqual(parseCompletedSet('40','9'),{weight:40,reps:9});
});
test('supports bodyweight and timed movements without inventing a load',()=>{
  assert.deepEqual(parseCompletedSet('', '30','seconds'),{weight:0,reps:30});
  assert.deepEqual(parseCompletedSet('22,5','12'),{weight:22.5,reps:12});
});
test('rejects malformed, negative, fractional or out-of-range entries',()=>{
  for(const v of ['-1','0','3.5','101','abc',''])assert.equal(parseCompletedSet('10',v),null);
  assert.equal(parseCompletedSet('10','101','seconds').reps,101);
  assert.equal(parseCompletedSet('xx','8'),null);
  assert.equal(parseCompletedSet('501','8'),null);
  assert.equal(parseCompletedSet('0','601','seconds'),null);
});
