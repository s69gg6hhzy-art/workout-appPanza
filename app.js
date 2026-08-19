const upperWarmup=[['Bar Hang','As long as possible','Wrap thumbs around bar'],['Scapular Pushups','10 reps',''],['DB Pause Bench Press','Light set of 10','Maximize stretch; inhale maximally as you lower the dumbbells'],['Suspension I Delt Fly','5 reps',''],['Suspension Y Deltoid Fly','5 reps',''],['Suspension T Delt Fly','5 reps','']];
const lowerWarmup=[['Cardio of Choice','5 min',''],['Bench Thoracic Mobility','30 sec',''],['Supine Piriformis Stretch','15 sec each leg',''],['Superband Good Morning','30 sec',''],['Dynamic Side Lunge Stretch','30 sec',''],['Deep Squat Mobility','At least 30 sec','As long as needed'],['Bodyweight Split Squat','10 per leg','Weak leg first']];
const total=program.reduce((s,p)=>s+p.workouts.length*p.rounds,0);
const isoDate=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
const todayISO=()=>isoDate(new Date());
const old=JSON.parse(localStorage.getItem('mwState')||'null');
const base={phase:0,round:0,workout:0,completed:0,history:[],workoutLogs:{},weights:{},nutrition:{},goals:{cal:2500,p:180,c:250,f:85},drafts:{},water:{},waterGoal:96,checklistItems:[],checklistDays:{},activities:{},bmr:1891,tdee:2741};
let state=JSON.parse(localStorage.getItem('mfState')||'null')||base;
if(old&&!localStorage.getItem('mfState')){state={...base,...old,history:(old.history||[]).map(h=>({...h,sets:{},summary:{}}))};}
state={...base,...state,goals:{...base.goals,...(state.goals||{})}};
let timerInterval=null,timerLeft=0,calendarCursor=new Date();calendarCursor.setDate(1);
function save(){localStorage.setItem('mfState',JSON.stringify(state))}
function phase(){return program[state.phase]}
function current(){return phase().workouts[state.workout]}
function workoutType(n){return /lower|legs/i.test(n)?'lower':'upper'}
function nextDateInfo(){if(!state.history.length)return{next:todayISO(),rest:null};const last=state.history[0];const d=new Date(last.date);const on=program[last.phaseIndex??state.phase]?.on||phase().on;const countInPhase=(state.history.filter(h=>(h.phaseIndex??-1)===(last.phaseIndex??-2)).length)||state.completed;const restAfter=countInPhase%on===0;const rest=new Date(d);rest.setDate(rest.getDate()+1);const next=new Date(d);next.setDate(next.getDate()+(restAfter?2:1));return{next:isoDate(next),rest:restAfter?isoDate(rest):null};}
function warmupHTML(type){const data=type==='lower'?lowerWarmup:upperWarmup;return `<div class="warmup"><div class="warmup-title">${type==='lower'?'Lower':'Upper'} Warm-up</div>${data.map(x=>`<div class="warm-row"><div class="warm-copy"><b>${x[0]}</b><small>${x[1]}${x[2]?` · ${x[2]}`:''}</small></div><button class="warm-check" type="button">✓</button></div>`).join('')}</div>`}
function getDraftKey(){return `${state.phase}-${state.round}-${state.workout}`}
function getDraft(){return state.drafts[getDraftKey()]||{sets:{},warm:{}}}
function renderToday(){
  const p=phase(),w=current(),sched=nextDateInfo(),today=todayISO();
  const todaysWorkout=state.history.find(h=>isoDate(h.date)===today);
  const isRest=sched.rest===today && !todaysWorkout;
  const isComplete=!!todaysWorkout;

  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});
  document.getElementById('overallProgress').style.width=`${state.completed/total*100}%`;
  document.getElementById('progressText').textContent=`${state.completed} of ${total} workouts completed`;
  document.getElementById('completedStat').textContent=state.completed;
  document.getElementById('phaseStat').textContent=`${state.phase+1} / 3`;

  const startBtn=document.getElementById('startBtn');
  startBtn.disabled=false;
  startBtn.style.display='block';

  if(isComplete){
    document.getElementById('phaseLabel').textContent=`${todaysWorkout.phase} · Round ${todaysWorkout.round}`;
    document.getElementById('nextWorkout').textContent="Today's workout complete";
    const nextLabel=new Date(sched.next+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
    document.getElementById('sessionLabel').textContent=`${todaysWorkout.workout} completed · Next: ${w.name} · ${nextLabel}`;
    startBtn.style.display='none';
  }else if(isRest){
    document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;
    document.getElementById('nextWorkout').textContent='Rest day';
    const nextLabel=new Date(sched.next+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
    document.getElementById('sessionLabel').textContent=`No workout planned today · Next: ${w.name} · ${nextLabel}`;
    startBtn.style.display='none';
  }else{
    document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;
    document.getElementById('nextWorkout').textContent=w.name;
    const due=sched.next<=today;
    document.getElementById('sessionLabel').textContent=`Workout ${Math.min(state.completed+1,total)} of ${total} · ${due?'scheduled today':'next '+new Date(sched.next+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}`;
  }

  const wt=state.weights[today]||{};
  document.getElementById('amWeight').value=wt.am||'';
  document.getElementById('pmWeight').value=wt.pm||'';
  document.getElementById('weightHint').textContent=wt.post?`Post-workout today: ${wt.post} lb`:'';
  renderTodayMacros();
  renderWater();
  renderActivities();
  renderEnergyBalance();
}
function renderTodayMacros(){const n=state.nutrition[todayISO()]||{foods:[]};const t=totals(n.foods||[]),g=state.goals;document.getElementById('todayMacros').innerHTML=macroBoxes(t,g);if(document.getElementById('energyBalance'))renderEnergyBalance();}
function macroBoxes(t,g){return [['Calories',t.cal,g.cal],['Protein',t.p,g.p],['Carbs',t.c,g.c],['Fat',t.f,g.f]].map(([k,v,goal])=>`<div class="macro-box"><strong>${Math.round(v)}</strong><span>${k}${k==='Calories'?'':' g'}</span><small>/ ${goal}</small></div>`).join('')}
function saveWeights(){state.weights[todayISO()]={...(state.weights[todayISO()]||{}),am:num('amWeight'),pm:num('pmWeight')};save();renderProgress();renderToday();}

function renderWater(){
  const d=todayISO(), amount=+(state.water[d]||0), goal=+(state.waterGoal||96);
  const pct=Math.min(100,goal?amount/goal*100:0);
  const amountEl=document.getElementById('waterAmount');
  const goalEl=document.getElementById('waterGoal');
  const bar=document.getElementById('waterProgress');
  if(amountEl)amountEl.textContent=`${amount} / ${goal} oz`;
  if(goalEl)goalEl.value=goal;
  if(bar)bar.style.width=`${pct}%`;
}
function changeWater(delta){
  const d=todayISO();
  state.water[d]=Math.max(0,+(state.water[d]||0)+delta);
  save();renderWater();
}
function saveWaterGoal(){
  state.waterGoal=Math.max(1,num('waterGoal')||96);
  save();renderWater();
}
function checklistDay(){
  const d=todayISO();
  state.checklistDays[d]=state.checklistDays[d]||{};
  return state.checklistDays[d];
}
function renderChecklist(){
  const list=document.getElementById('checklistList');
  const day=checklistDay();
  const items=state.checklistItems||[];
  const done=items.filter(x=>day[x.id]).length;
  document.getElementById('checklistDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
  document.getElementById('checklistCount').textContent=`${done} of ${items.length} complete`;
  list.innerHTML=items.length?items.map(item=>`<div class="checklist-row ${day[item.id]?'done':''}" draggable="true" data-item="${item.id}">
    <button class="drag-handle" type="button" aria-label="Drag ${esc(item.text)} to reorder">☰</button>
    <button class="checklist-check ${day[item.id]?'done':''}" data-check="${item.id}" aria-label="Mark ${esc(item.text)} complete">✓</button>
    <span class="checklist-text" data-text="${item.id}">${esc(item.text)}</span>
    <input class="checklist-edit" data-edit-input="${item.id}" value="${esc(item.text)}" aria-label="Edit ${esc(item.text)}">
    <button class="checklist-edit-btn" data-edit="${item.id}" aria-label="Edit ${esc(item.text)}">Edit</button>
    <button class="checklist-delete" data-delete="${item.id}" aria-label="Delete ${esc(item.text)}">×</button>
  </div>`).join(''):'<p class="notice">No checklist items yet. Add your first daily item below.</p>';

  document.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.check;day[id]=!day[id];save();renderChecklist();
  }));

  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.delete;state.checklistItems=state.checklistItems.filter(x=>x.id!==id);
    Object.values(state.checklistDays||{}).forEach(x=>delete x[id]);
    save();renderChecklist();
  }));

  document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>{
    const row=b.closest('.checklist-row');
    const id=b.dataset.edit;
    const input=row.querySelector(`[data-edit-input="${id}"]`);
    if(row.classList.contains('editing')){
      const value=input.value.trim();
      if(value){
        const item=state.checklistItems.find(x=>x.id===id);
        if(item)item.text=value;
        save();
      }
      renderChecklist();
    }else{
      row.classList.add('editing');
      b.textContent='Done';
      input.focus();
      input.select();
    }
  }));

  document.querySelectorAll('.checklist-edit').forEach(inp=>inp.addEventListener('keydown',e=>{
    if(e.key==='Enter') e.target.closest('.checklist-row').querySelector('.checklist-edit-btn').click();
  }));

  let draggedId=null;
  list.querySelectorAll('.checklist-row').forEach(row=>{
    row.addEventListener('dragstart',e=>{
      draggedId=row.dataset.item;
      row.classList.add('dragging');
      if(e.dataTransfer)e.dataTransfer.effectAllowed='move';
    });
    row.addEventListener('dragend',()=>{
      draggedId=null;
      row.classList.remove('dragging');
      list.querySelectorAll('.checklist-row').forEach(r=>r.classList.remove('drag-over'));
    });
    row.addEventListener('dragover',e=>{
      e.preventDefault();
      if(draggedId&&draggedId!==row.dataset.item)row.classList.add('drag-over');
    });
    row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));
    row.addEventListener('drop',e=>{
      e.preventDefault();
      row.classList.remove('drag-over');
      if(!draggedId||draggedId===row.dataset.item)return;
      const from=state.checklistItems.findIndex(x=>x.id===draggedId);
      const to=state.checklistItems.findIndex(x=>x.id===row.dataset.item);
      if(from<0||to<0)return;
      const [moved]=state.checklistItems.splice(from,1);
      state.checklistItems.splice(to,0,moved);
      save();renderChecklist();
    });

    const handle=row.querySelector('.drag-handle');
    handle.addEventListener('touchstart',()=>{
      row.classList.add('touch-drag-ready');
    },{passive:true});
    handle.addEventListener('touchend',()=>{
      row.classList.remove('touch-drag-ready');
    },{passive:true});
  });
}
function addChecklistItem(){
  const input=document.getElementById('newChecklistItem');
  const text=input.value.trim();
  if(!text)return;
  const id=`i${Date.now()}`;
  state.checklistItems.push({id,text});
  input.value='';save();renderChecklist();
  input.focus();
}


function todaysExerciseTotals(){
  const today=todayISO();
  const workoutEntries=state.history.filter(h=>isoDate(h.date)===today);
  const workoutMinutes=workoutEntries.reduce((s,h)=>s+(+(h.summary?.duration)||0),0);
  const workoutCalories=workoutEntries.reduce((s,h)=>s+(+(h.summary?.activeCalories)||0),0);
  const acts=state.activities[today]||[];
  const activityMinutes=acts.reduce((s,a)=>s+(+a.minutes||0)+((+a.seconds||0)/60),0);
  const activityCalories=acts.reduce((s,a)=>s+(+a.calories||0),0);
  return {
    workoutMinutes,workoutCalories,activityMinutes,activityCalories,
    minutes:workoutMinutes+activityMinutes,
    calories:workoutCalories+activityCalories
  };
}
function fmtDuration(sec){
  sec=Math.max(0,Math.round(+sec||0));
  const m=Math.floor(sec/60),s=sec%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}
function activitySeconds(a){return (+a.minutes||0)*60+(+a.seconds||0)}
function activityPace(a){
  const d=+a.distance||0,sec=activitySeconds(a);
  if(!d||!sec)return '';
  return fmtDuration(sec/d)+'/mi';
}
function renderActivities(){
  const today=todayISO();
  const acts=state.activities[today]||[];
  const list=document.getElementById('activityList');
  if(!list)return;
  list.innerHTML=acts.length?acts.map((a,i)=>{
    const bits=[];
    if(+a.distance)bits.push(`${(+a.distance).toFixed(2).replace(/\.00$/,'')} mi`);
    if(activitySeconds(a))bits.push(fmtDuration(activitySeconds(a)));
    if(activityPace(a))bits.push(`${activityPace(a)} pace`);
    if(+a.calories)bits.push(`${a.calories} active kcal`);
    if(+a.avgHr)bits.push(`${a.avgHr} avg bpm`);
    const zones=[1,2,3,4,5].map(z=>a[`z${z}`]).filter(Boolean);
    const zoneLine=zones.length?[1,2,3,4,5].map(z=>a[`z${z}`]?`Z${z} ${a[`z${z}`]}`:'').filter(Boolean).join(' · '):'';
    return `<div class="activity-row">
      <div><b>${esc(a.type)}</b><small>${bits.join(' · ')}</small>${zoneLine?`<small class="zone-line">${zoneLine}</small>`:''}</div>
      <button data-activity-delete="${i}" aria-label="Delete ${esc(a.type)}">×</button>
    </div>`;
  }).join(''):'<p class="notice">No walks or jogs logged today.</p>';
  document.querySelectorAll('[data-activity-delete]').forEach(b=>b.addEventListener('click',()=>{
    state.activities[today].splice(+b.dataset.activityDelete,1);
    save();renderActivities();renderEnergyBalance();
  }));
  const t=todaysExerciseTotals();
  const summary=document.getElementById('activitySummary');
  if(summary)summary.textContent=`${Math.round(t.minutes)} min exercise · ${Math.round(t.calories)} active exercise kcal`;
}
function addActivity(){
  const type=document.getElementById('activityType').value;
  const minutes=num('activityMinutes');
  const seconds=Math.min(59,num('activitySeconds'));
  const distance=+document.getElementById('activityDistance').value||0;
  const calories=num('activityCalories');
  const avgHr=num('activityAvgHr');
  const zones={};
  [1,2,3,4,5].forEach(z=>{const v=document.getElementById(`activityZ${z}`).value.trim();if(v)zones[`z${z}`]=v});
  if(!minutes&&!seconds&&!distance&&!calories)return;
  const today=todayISO();
  state.activities[today]=state.activities[today]||[];
  state.activities[today].push({type,minutes,seconds,distance,calories,avgHr,...zones});
  ['activityMinutes','activitySeconds','activityDistance','activityCalories','activityAvgHr','activityZ1','activityZ2','activityZ3','activityZ4','activityZ5'].forEach(id=>document.getElementById(id).value='');
  save();renderActivities();renderEnergyBalance();
}
function renderEnergyBalance(){
  const el=document.getElementById('energyBalance');
  if(!el)return;
  const today=todayISO();
  const foods=(state.nutrition[today]?.foods)||[];
  const intake=totals(foods).cal;
  const ex=todaysExerciseTotals();
  const bmr=+(state.bmr||1891);
  const tdee=+(state.tdee||2741);
  const nonExerciseMinutes=Math.max(0,1440-ex.minutes);
  const nonExerciseBurn=bmr*(nonExerciseMinutes/1440);
  const totalBurn=nonExerciseBurn+ex.calories;
  const balance=intake-totalBurn;
  const label=balance<0?'deficit':balance>0?'surplus':'balance';
  const amount=Math.abs(Math.round(balance));
  el.innerHTML=`<div class="balance-main">
      <span>${label==='deficit'?'Estimated deficit':label==='surplus'?'Estimated surplus':'Estimated balance'}</span>
      <strong class="${label}">${amount} kcal</strong>
    </div>
    <div class="balance-grid">
      <div><b>${Math.round(intake)}</b><span>intake</span></div>
      <div><b>${Math.round(totalBurn)}</b><span>estimated burn</span></div>
      <div><b>${Math.round(ex.calories)}</b><span>exercise kcal</span></div>
      <div><b>${Math.round(nonExerciseBurn)}</b><span>non-exercise burn</span></div>
    </div>
    <p class="tiny balance-note">${Math.round(ex.minutes)} exercise min + ${Math.round(nonExerciseMinutes)} non-exercise min. Non-exercise burn uses BMR ${bmr} kcal/day. Measured TDEE: ${tdee} kcal/day (reference).</p>`;
}

function renderWorkout(){const p=phase(),w=current(),draft=getDraft();document.getElementById('workoutPhase').textContent=`${p.name} · R${state.round+1}`;document.getElementById('workoutTitle').textContent=w.name;document.getElementById('workoutMeta').textContent=`${w.ex.length} exercises · ${p.on} days on / 1 off`;const el=document.getElementById('exerciseList');el.innerHTML=warmupHTML(workoutType(w.name));w.ex.forEach((x,i)=>{const [name,sets,rest,last]=x;const previous=latestExercise(name)||last||'—';let rows=sets.map((target,j)=>{const v=(draft.sets[i]||[])[j]||{};return `<div class="setrow"><div class="setnum">${j+1}</div><input data-e="${i}" data-s="${j}" data-k="weight" inputmode="decimal" placeholder="weight" value="${v.weight??''}"><input data-e="${i}" data-s="${j}" data-k="reps" inputmode="numeric" placeholder="reps · ${target}" value="${v.reps??''}"><button class="check ${v.done?'done':''}" data-e="${i}" data-s="${j}" data-rest="${rest}">✓</button></div>`}).join('');el.insertAdjacentHTML('beforeend',`<div class="exercise"><h3>${name}</h3><div class="rx">${sets.length} set${sets.length>1?'s':''} · ${sets.join(' / ')}${rest?` · ${rest} rest`:''}</div><div class="last">Last: ${previous}</div>${rows}</div>`)});document.querySelectorAll('.warm-check').forEach((b,i)=>{if(draft.warm[i]){b.classList.add('done');b.closest('.warm-row').classList.add('done')}b.addEventListener('click',()=>{draft.warm[i]=!draft.warm[i];b.classList.toggle('done');b.closest('.warm-row').classList.toggle('done');storeDraft(draft)})});document.querySelectorAll('.setrow input').forEach(inp=>inp.addEventListener('input',()=>{const e=+inp.dataset.e,s=+inp.dataset.s;draft.sets[e]=draft.sets[e]||[];draft.sets[e][s]=draft.sets[e][s]||{};draft.sets[e][s][inp.dataset.k]=inp.value;storeDraft(draft)}));document.querySelectorAll('.check').forEach(b=>b.addEventListener('click',()=>{const e=+b.dataset.e,s=+b.dataset.s;draft.sets[e]=draft.sets[e]||[];draft.sets[e][s]=draft.sets[e][s]||{};draft.sets[e][s].done=!draft.sets[e][s].done;b.classList.toggle('done');storeDraft(draft);if(draft.sets[e][s].done&&b.dataset.rest)startTimer(b.dataset.rest)}));}
function storeDraft(d){state.drafts[getDraftKey()]=d;save()}
function latestExercise(name){for(const h of state.history){if(h.sets&&h.sets[name]){const vals=h.sets[name].filter(x=>x.weight||x.reps).map(x=>`${x.weight?x.weight+'×':''}${x.reps||''}`);if(vals.length)return vals.join(', ')}}return null}
function parseRest(s){if(!s)return 0;const [m,sec]=s.split(':').map(Number);return m*60+sec}
function startTimer(rest){stopTimer();timerLeft=parseRest(rest);if(!timerLeft)return;document.getElementById('timer').classList.add('show');tick();timerInterval=setInterval(()=>{timerLeft--;tick();if(timerLeft<=0)stopTimer()},1000)}
function tick(){document.getElementById('timerText').textContent=`${String(Math.floor(timerLeft/60)).padStart(2,'0')}:${String(timerLeft%60).padStart(2,'0')}`}
function stopTimer(){clearInterval(timerInterval);document.getElementById('timer').classList.remove('show')}
function openFinish(){document.getElementById('finishWorkoutName').textContent=current().name;document.getElementById('finishModal').classList.add('show');document.getElementById('finishModal').setAttribute('aria-hidden','false')}
function closeFinish(){document.getElementById('finishModal').classList.remove('show');document.getElementById('finishModal').setAttribute('aria-hidden','true')}
function saveWorkout(){const w=current(),p=phase(),draft=getDraft(),sets={};w.ex.forEach((x,i)=>sets[x[0]]=(draft.sets[i]||[]).map(v=>({weight:v.weight||'',reps:v.reps||'',done:!!v.done})));const summary={duration:num('sumDuration'),activeCalories:num('sumActiveCal'),totalCalories:num('sumTotalCal'),avgHr:num('sumAvgHr'),maxHr:num('sumMaxHr'),postWeight:num('sumWeight'),notes:document.getElementById('sumNotes').value.trim()};const date=new Date().toISOString();state.history.unshift({date,phase:p.name,phaseIndex:state.phase,round:state.round+1,workout:w.name,sets,summary});if(summary.postWeight)state.weights[todayISO()]={...(state.weights[todayISO()]||{}),post:summary.postWeight};delete state.drafts[getDraftKey()];state.completed++;advanceProgram();save();clearSummary();closeFinish();renderAll();showScreen('today')}
function advanceProgram(){state.workout++;if(state.workout>=phase().workouts.length){state.workout=0;state.round++;if(state.round>=phase().rounds){state.round=0;state.phase++;if(state.phase>=program.length){state.phase=program.length-1;state.round=phase().rounds-1;state.workout=phase().workouts.length-1}}}}
function clearSummary(){['sumDuration','sumActiveCal','sumTotalCal','sumAvgHr','sumMaxHr','sumWeight','sumNotes'].forEach(id=>document.getElementById(id).value='')}
function renderNutrition(){const d=document.getElementById('nutritionDate').value||todayISO();document.getElementById('nutritionDate').value=d;const g=state.goals;[['goalCal','cal'],['goalP','p'],['goalC','c'],['goalF','f']].forEach(([id,k])=>document.getElementById(id).value=g[k]);state.nutrition[d]=state.nutrition[d]||{foods:[]};const foods=state.nutrition[d].foods;document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);document.getElementById('foodList').innerHTML=foods.length?foods.map((f,i)=>foodRow(f,i)).join(''):'<p class="notice">No foods logged yet.</p>';document.querySelectorAll('.food-row input').forEach(inp=>inp.addEventListener('blur',foodChanged));document.querySelectorAll('.food-row button').forEach(b=>b.addEventListener('click',()=>{foods.splice(+b.dataset.i,1);save();renderNutrition();renderTodayMacros()}));}
function foodRow(f,i){return `<div class="food-row"><label class="food-name">Food<input data-i="${i}" data-k="name" value="${esc(f.name||'')}"></label><label>Cal<input inputmode="numeric" data-i="${i}" data-k="cal" value="${f.cal||''}"></label><label>P<input inputmode="decimal" data-i="${i}" data-k="p" value="${f.p||''}"></label><label>C<input inputmode="decimal" data-i="${i}" data-k="c" value="${f.c||''}"></label><label>F<input inputmode="decimal" data-i="${i}" data-k="f" value="${f.f||''}"></label><button data-i="${i}">×</button></div>`}
function refreshNutritionTotals(d){const foods=(state.nutrition[d]?.foods)||[],g=state.goals;document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);if(d===todayISO())renderTodayMacros()}
function foodChanged(e){const d=document.getElementById('nutritionDate').value,foods=state.nutrition[d].foods,i=+e.target.dataset.i,k=e.target.dataset.k;foods[i][k]=k==='name'?e.target.value:(parseFloat(e.target.value)||0);save();refreshNutritionTotals(d)}
function addFood(){const d=document.getElementById('nutritionDate').value||todayISO();state.nutrition[d]=state.nutrition[d]||{foods:[]};state.nutrition[d].foods.push({name:'',cal:0,p:0,c:0,f:0});save();renderNutrition();setTimeout(()=>document.querySelectorAll('.food-name input')[document.querySelectorAll('.food-name input').length-1]?.focus(),0)}
function totals(foods){return foods.reduce((a,f)=>({cal:a.cal+(+f.cal||0),p:a.p+(+f.p||0),c:a.c+(+f.c||0),f:a.f+(+f.f||0)}),{cal:0,p:0,c:0,f:0})}
function saveGoals(){state.goals={cal:num('goalCal'),p:num('goalP'),c:num('goalC'),f:num('goalF')};save();renderNutrition();renderTodayMacros()}
function renderHistory(){const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();document.getElementById('monthLabel').textContent=calendarCursor.toLocaleDateString(undefined,{month:'short',year:'numeric'});const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=first.getDay(),sched=nextDateInfo(),byDate={};state.history.forEach(h=>{const d=isoDate(h.date);(byDate[d]=byDate[d]||[]).push(h)});let html='';for(let i=0;i<offset;i++)html+='<div class="day blank"></div>';for(let d=1;d<=days;d++){const key=isoDate(new Date(y,m,d)),classes=['day'];if(key===todayISO())classes.push('today');if(byDate[key])classes.push('workout-day');if(key===sched.next)classes.push('next-day');if(key===sched.rest)classes.push('rest-day');const mark=(byDate[key]||key===sched.next||key===sched.rest)?'<span class="mark"></span>':'';html+=`<button class="${classes.join(' ')}" data-date="${key}">${d}${mark}</button>`}document.getElementById('calendar').innerHTML=html;document.querySelectorAll('.day[data-date]').forEach(b=>b.addEventListener('click',()=>renderDayDetail(b.dataset.date)));const w=current();document.getElementById('nextScheduleCard').innerHTML=`<div class="eyebrow">Next scheduled workout</div><h3>${w.name}</h3><p class="muted">${new Date(sched.next+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})} · ${phase().name} · Round ${state.round+1}</p>${sched.rest?`<p class="tiny" style="margin-top:8px">Scheduled rest: ${new Date(sched.rest+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</p>`:''}`;}
function renderDayDetail(date){const hs=state.history.filter(h=>isoDate(h.date)===date),wt=state.weights[date],nut=state.nutrition[date];let parts=`<div class="eyebrow">${new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>`;if(hs.length)hs.forEach(h=>{const s=h.summary||{};parts+=`<div class="day-detail-row"><b>${h.workout}</b><small>${h.phase} · Round ${h.round}${s.duration?` · ${s.duration} min`:''}${s.activeCalories?` · ${s.activeCalories} active kcal`:''}${s.avgHr?` · ${s.avgHr} avg HR`:''}</small></div>`});if(wt)parts+=`<div class="day-detail-row"><b>Weight</b><small>${wt.am?`AM ${wt.am} lb · `:''}${wt.post?`Post ${wt.post} lb · `:''}${wt.pm?`PM ${wt.pm} lb`:''}</small></div>`;if(nut){const t=totals(nut.foods||[]);parts+=`<div class="day-detail-row"><b>Nutrition</b><small>${Math.round(t.cal)} kcal · ${Math.round(t.p)} P · ${Math.round(t.c)} C · ${Math.round(t.f)} F</small></div>`}const acts=state.activities[date]||[];if(acts.length){const mins=acts.reduce((s,a)=>s+(+a.minutes||0),0),cals=acts.reduce((s,a)=>s+(+a.calories||0),0);parts+=`<div class="day-detail-row"><b>Walks / jogs</b><small>${Math.round(mins)} min · ${Math.round(cals)} kcal</small></div>`}const water=state.water[date];if(water)parts+=`<div class="day-detail-row"><b>Water</b><small>${water} oz</small></div>`;const cd=state.checklistDays[date];if(cd){const items=state.checklistItems||[],done=items.filter(x=>cd[x.id]).length;parts+=`<div class="day-detail-row"><b>Checklist</b><small>${done} of ${items.length} complete</small></div>`}if(!hs.length&&!wt&&!nut&&!acts.length&&!water&&!cd)parts+='<p class="notice">No saved data for this day.</p>';document.getElementById('dayDetail').innerHTML=parts;}
function renderProgress(){const entries=Object.entries(state.weights).filter(([,v])=>v.am||v.pm).sort((a,b)=>a[0].localeCompare(b[0]));const ams=entries.filter(([,v])=>v.am).map(([d,v])=>({d,v:+v.am}));const latest=ams.at(-1);const last7=ams.slice(-7);document.getElementById('latestWeight').textContent=latest?`${latest.v.toFixed(1)} lb`:'—';document.getElementById('avg7Weight').textContent=last7.length?`${(last7.reduce((s,x)=>s+x.v,0)/last7.length).toFixed(1)} lb`:'—';const swings=entries.filter(([,v])=>v.am&&v.pm).map(([,v])=>+v.pm-+v.am);document.getElementById('dailySwing').textContent=swings.length?`${(swings.reduce((a,b)=>a+b,0)/swings.length).toFixed(1)} lb`:'—';document.getElementById('weightHistory').innerHTML=entries.length?entries.slice(-10).reverse().map(([d,v])=>`<div class="weight-line"><span>${new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><b>${v.am?`AM ${v.am}`:'—'}</b><b>${v.pm?`PM ${v.pm}`:(v.post?`Post ${v.post}`:'—')}</b></div>`).join(''):'<p class="notice">Start entering morning and evening weights to build your trend.</p>';}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.screen===id));if(id==='workout')renderWorkout();if(id==='nutrition')renderNutrition();if(id==='history')renderHistory();if(id==='progress')renderProgress();if(id==='checklist')renderChecklist();if(id==='today')renderToday();window.scrollTo(0,0)}
function renderAll(){renderToday();renderWorkout();renderNutrition();renderChecklist();renderHistory();renderProgress()}
function num(id){return parseFloat(document.getElementById(id).value)||0}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));document.getElementById('startBtn').addEventListener('click',()=>showScreen('workout'));document.getElementById('finishBtn').addEventListener('click',openFinish);document.getElementById('closeFinish').addEventListener('click',closeFinish);document.getElementById('saveWorkoutBtn').addEventListener('click',saveWorkout);document.getElementById('skipTimer').addEventListener('click',stopTimer);document.getElementById('saveWeightBtn').addEventListener('click',saveWeights);document.getElementById('nutritionDate').addEventListener('change',renderNutrition);document.getElementById('addFoodBtn').addEventListener('click',addFood);document.getElementById('saveGoalsBtn').addEventListener('click',saveGoals);document.getElementById('prevMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderHistory()});document.getElementById('nextMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderHistory()});document.getElementById('addActivityBtn').addEventListener('click',addActivity);
document.getElementById('waterMinusBtn').addEventListener('click',()=>changeWater(-8));
document.getElementById('waterPlusBtn').addEventListener('click',()=>changeWater(8));
document.getElementById('saveWaterGoalBtn').addEventListener('click',saveWaterGoal);
document.getElementById('addChecklistBtn').addEventListener('click',addChecklistItem);
document.getElementById('newChecklistItem').addEventListener('keydown',e=>{if(e.key==='Enter')addChecklistItem()});
document.getElementById('nutritionDate').value=todayISO();renderAll();save();
