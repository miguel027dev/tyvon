// A failed write keeps its snapshot; conflicts stay blocked until account hydration.
export class SaveQueue {
 constructor(write){this.write=write;this.pending=null;this.running=null;this.saved='';this.conflict=null}
 enqueue(snapshot){const signature=JSON.stringify(snapshot);if(signature!==this.saved)this.pending=snapshot}
 drain(){
  if(this.conflict)return Promise.reject(this.conflict);
  if(this.running)return this.running;
  this.running=(async()=>{
   while(this.pending){
    const snapshot=this.pending;this.pending=null;
    try{await this.write(snapshot);this.saved=JSON.stringify(snapshot)}
    catch(error){if(!this.pending)this.pending=snapshot;if(error.status===409)this.conflict=error;throw error}
   }
  })().finally(()=>{this.running=null});
  return this.running;
 }
}
