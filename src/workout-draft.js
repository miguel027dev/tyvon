const MAX_AGE = 24 * 60 * 60 * 1000;
export const workoutDraftKey = userId => userId ? `tyvon-workout-draft:${userId}` : null;
export function readWorkoutDraft(storage, key, now = Date.now()) {
 try {
  const draft = JSON.parse(key ? storage.getItem(key) : null);
  if (!draft) return null;
  if (draft.version !== 1 || !Number.isFinite(draft.updatedAt) || draft.updatedAt > now || now - draft.updatedAt > MAX_AGE || !draft.workout?.exercises?.length || !Number.isInteger(draft.index) || draft.index < 0 || draft.index >= draft.workout.exercises.length || !Number.isFinite(draft.seconds) || draft.seconds < 0 || draft.seconds > 86400 || !draft.checked || typeof draft.checked !== 'object') {
   storage.removeItem(key); return null;
  }
  return draft;
 } catch { return null; }
}
export function saveWorkoutDraft(storage, key, draft) {
 if (!key) return false;
 try { storage.setItem(key, JSON.stringify({...draft, version: 1, updatedAt: Date.now()})); return true; } catch { return false; }
}
export function clearWorkoutDraft(storage, key) {
 try { if (key) storage.removeItem(key); } catch {}
}
export const chatWorkoutDraftKey = userId => userId ? `tyvon-chat-workout:${userId}` : null;
export function readChatWorkoutDraft(storage, key, now = Date.now()) {
 try {
  const saved=JSON.parse(key ? storage.getItem(key) : null),s=saved?.session;
  if(!saved)return null;
  if(!Number.isFinite(saved.updatedAt)||saved.updatedAt>now||now-saved.updatedAt>MAX_AGE||!s?.workout?.exercises?.length||!Number.isInteger(s.exerciseIndex)||s.exerciseIndex<0||s.exerciseIndex>=s.workout.exercises.length||!Number.isInteger(s.setIndex)||s.setIndex<0||s.setIndex>=s.workout.exercises[s.exerciseIndex].sets||!Array.isArray(s.setLogs)||!Number.isFinite(s.startedAt)){storage.removeItem(key);return null}
  return s;
 } catch {return null}
}
