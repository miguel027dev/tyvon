import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveQueue} from '../src/save-queue.js';
import {accountRequest,resetAccountRevision} from '../src/api.js';

test('failed snapshot retries and retains a newer snapshot arriving during failure',async()=>{
 const written=[];let reject;
 const queue=new SaveQueue(s=>{written.push(s);if(written.length===1)return new Promise((_,r)=>reject=r);return Promise.resolve()});
 queue.enqueue({logs:[1]});const first=queue.drain();queue.enqueue({logs:[1,2]});reject(new Error('offline'));
 await assert.rejects(first);await queue.drain();assert.deepEqual(written,[{logs:[1]},{logs:[1,2]}]);
 queue.enqueue({logs:[1,2]});await queue.drain();assert.equal(written.length,2);
});
test('retry resubmits exactly the failed write when nothing newer exists',async()=>{
 let calls=0;const queue=new SaveQueue(async()=>{if(++calls===1)throw new Error('offline')});
 queue.enqueue({step:2});await assert.rejects(queue.drain());await queue.drain();assert.equal(calls,2);
});
test('conflicting snapshots cannot be retried against a newer unseen server version',async()=>{
 let calls=0;const queue=new SaveQueue(async()=>{calls++;throw Object.assign(new Error('conflict'),{status:409})});
 queue.enqueue({step:2});await assert.rejects(queue.drain());queue.enqueue({step:3});await assert.rejects(queue.drain());assert.equal(calls,1);
});
test('409 response never promotes the revision used by the next write',async()=>{
 const originalFetch=globalThis.fetch,originalDocument=globalThis.document;const matches=[];let n=0;
 globalThis.document={cookie:'tyvon_csrf=test'};
 globalThis.fetch=async(_url,opts)=>{matches.push(opts.headers.get('If-Match'));const data=n++===0?{revision:4}: {revision:5,error:'conflict'};return {ok:n===1,status:n===1?200:409,json:async()=>data}};
 try{resetAccountRevision();await accountRequest();await assert.rejects(accountRequest('PUT',{}));await assert.rejects(accountRequest('PUT',{}));assert.deepEqual(matches,[null,'4','4'])}
 finally{resetAccountRevision();globalThis.fetch=originalFetch;globalThis.document=originalDocument}
});
