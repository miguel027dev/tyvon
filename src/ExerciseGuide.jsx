import React from 'react';
import './exercise-guide.css';
export default function ExerciseGuide({exercise:e}){
 const timed=/\bs\b|segundo/.test(String(e.reps));
 return <div className="exercise-guide">
  <div className="exercise-guide-metrics"><span><small>Séries principais</small><strong>{e.sets}</strong></span><span><small>{timed?'Tempo por série':'Repetições por série'}</small><strong>{e.reps}</strong></span><span><small>Descanso entre séries</small><strong>{e.restSeconds} s</strong></span></div>
  <h4>Antes de começar</h4><p>Equipamento: {e.equipment}. {e.warmupSets>0?`Faça ${e.warmupSets} ${e.warmupSets===1?'série de aquecimento':'séries de aquecimento'} com carga leve antes das ${e.sets} séries principais. O aquecimento não entra no contador de séries principais.`:'Esta ficha não inclui séries extras de aquecimento.'}</p>
  <h4>Execução</h4><p>{e.tip}</p>
  {e.targetRir!=null&&<><h4>Esforço planejado · RIR {e.targetRir}</h4><p>RIR significa repetições em reserva: ao terminar, a meta é sentir que ainda conseguiria aproximadamente {e.targetRir} {e.targetRir===1?'repetição':'repetições'} com boa técnica. Se não souber estimar, deixe o esforço sem informar.</p></>}
  <h4>O que registrar</h4><p>{timed?'Informe quantos segundos você realmente sustentou em cada série.':'Informe a carga em kg e quantas repetições você realmente fez em cada série.'} Marque a série ao terminar; o descanso começa no registro. Você pode corrigir os valores e desfazer a marcação.</p>
  {e.progressionReason&&<p className="exercise-guide-progression">{e.progressionReason}</p>}
 </div>
}
