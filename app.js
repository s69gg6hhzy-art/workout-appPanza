const upperWarmup=[['Bar Hang','As long as possible','Wrap thumbs around bar'],['Scapular Pushups','10 reps',''],['DB Pause Bench Press','Light set of 10','Maximize stretch; inhale maximally as you lower the dumbbells'],['Suspension I Delt Fly','5 reps',''],['Suspension Y Deltoid Fly','5 reps',''],['Suspension T Delt Fly','5 reps','']];
const lowerWarmup=[['Cardio of Choice','5 min',''],['Bench Thoracic Mobility','30 sec',''],['Supine Piriformis Stretch','15 sec each leg',''],['Superband Good Morning','30 sec',''],['Dynamic Side Lunge Stretch','30 sec',''],['Deep Squat Mobility','At least 30 sec','As long as needed'],['Bodyweight Split Squat','10 per leg','Weak leg first']];
const total=program.reduce((s,p)=>s+p.workouts.length*p.rounds,0);
const historicalWeight=[
  {date:'2025-01-08',label:'S1 W1',weight:188.6,session:'Session 1'},
  {date:'2025-01-17',label:'DEXA',weight:191.1,session:'Session 1'},
  {date:'2025-01-29',label:'S1 W4',weight:189.7,session:'Session 1'},
  {date:'2025-02-26',label:'S1 W8',weight:186.1,session:'Session 1'},
  {date:'2025-03-12',label:'S1 W10',weight:182.7,session:'Session 1'},
  {date:'2025-03-26',label:'S1 W12',weight:179.9,session:'Session 1'},
  {date:'2025-04-09',label:'S1 W14',weight:179.9,session:'Session 1'},
  {date:'2025-04-16',label:'S1 W15',weight:177.3,session:'Session 1'},
  {date:'2025-04-23',label:'S1 W16',weight:178.7,session:'Session 1'},
  {date:'2025-09-01',label:'S2 W1',weight:191.6,session:'Session 2'},
  {date:'2025-11-03',label:'S2 W10',weight:182.4,session:'Session 2'}
];
const historicalCalories=[
  {date:'2025-01-08',label:'S1 W1',cal:2432,protein:155,session:'Session 1'},
  {date:'2025-01-29',label:'S1 W4',cal:2809,protein:217,session:'Session 1'},
  {date:'2025-02-26',label:'S1 W8',cal:2618,protein:196,session:'Session 1'},
  {date:'2025-03-12',label:'S1 W10',cal:2110,protein:191,session:'Session 1'},
  {date:'2025-03-26',label:'S1 W12',cal:2473,protein:192,session:'Session 1'},
  {date:'2025-04-09',label:'S1 W14',cal:2382,protein:191,session:'Session 1'},
  {date:'2025-04-16',label:'S1 W15',cal:2625,protein:174,session:'Session 1'},
  {date:'2025-04-23',label:'S1 W16',cal:2893,protein:200,session:'Session 1'},
  {date:'2026-05-04',label:'Brazil W1',cal:2639,protein:155,session:'Brazil'},
  {date:'2026-05-11',label:'Brazil W2',cal:3525,protein:177,session:'Brazil'},
  {date:'2026-05-18',label:'Brazil W3',cal:3126,protein:184,session:'Brazil'},
  {date:'2026-05-25',label:'Brazil W4',cal:3295,protein:188,session:'Brazil'},
  {date:'2026-06-01',label:'Brazil W5',cal:2920,protein:208,session:'Brazil'},
  {date:'2026-06-08',label:'Brazil W6',cal:3214,protein:174,session:'Brazil'},
  {date:'2026-06-15',label:'Brazil W7',cal:2559,protein:174,session:'Brazil'},
  {date:'2026-06-22',label:'Brazil W8',cal:3109,protein:203,session:'Brazil'},
  {date:'2026-06-29',label:'Brazil W9',cal:2789,protein:175,session:'Brazil'},
  {date:'2026-07-06',label:'Brazil W10',cal:2774,protein:147,session:'Brazil'}
];

const isoDate=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
const todayISO=()=>isoDate(new Date());
const defaultChecklistItems=[{"id":"brush-am","text":"Brush Teeth AM"},{"id":"floss-am","text":"Floss AM"},{"id":"weight-am","text":"Take Weight AM"},{"id":"walk-dogs","text":"Walk Dogs"},{"id":"morning-jog","text":"Morning Jog"},{"id":"brush-pm","text":"Brush Teeth PM"},{"id":"floss-pm","text":"Floss PM"}];
const old=JSON.parse(localStorage.getItem('mwState')||'null');
const base={phase:0,round:0,workout:0,completed:0,history:[],workoutLogs:{},weights:{},nutrition:{},goals:{cal:2500,p:180,c:250,f:85},drafts:{},water:{},waterGoal:96,checklistItems:JSON.parse(JSON.stringify(defaultChecklistItems)),checklistDays:{},activities:{},bmr:1891,tdee:2741,restDays:{},scheduleDate:null,nextEventType:'workout',profile:{name:'Matt'},historicalEnabled:true,photoSettings:{weekly:false},photoCheckins:[],photoDays:{}};
let state=JSON.parse(localStorage.getItem('mfState')||'null')||base;
if(old&&!localStorage.getItem('mfState')){state={...base,...old,history:(old.history||[]).map(h=>({...h,sets:{},summary:{}}))};}
state={...base,...state,goals:{...base.goals,...(state.goals||{})}};
if(!Array.isArray(state.checklistItems)||state.checklistItems.length===0)state.checklistItems=JSON.parse(JSON.stringify(defaultChecklistItems));
let timerInterval=null,timerLeft=0,calendarCursor=new Date();calendarCursor.setDate(1),checklistReorderMode=false,activityEditIndex=null,workoutEditIndex=null;
function currentTimeHHMM(){
  const d=new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function formatTime12(t){
  if(!t)return '';
  const [hh,mm]=String(t).split(':');
  const h=+hh;
  if(Number.isNaN(h))return String(t);
  return `${h%12||12}:${String(mm||'00').padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}
function workoutTime(h){
  if(h?.summary?.time)return h.summary.time;
  if(h?.date){
    const d=new Date(h.date);
    if(!Number.isNaN(d.getTime()))return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  return '';
}
function save(){localStorage.setItem('mfState',JSON.stringify(state))}
function phase(){return program[state.phase]}
function current(){return phase().workouts[state.workout]}
function workoutType(n){return /lower|legs/i.test(n)?'lower':'upper'}

function phaseWorkoutCount(phaseIndex){
  return state.history.filter(h=>(h.phaseIndex??-1)===phaseIndex).length;
}
function plusDays(dateStr,n){
  const d=new Date(dateStr+'T12:00:00');d.setDate(d.getDate()+n);return isoDate(d);
}
function ensureScheduleState(){
  const today=todayISO();
  if(!state.scheduleDate){
    if(state.history.length){
      const last=state.history[0];
      const phaseIndex=last.phaseIndex??state.phase;
      const on=program[phaseIndex]?.on||phase().on;
      const count=state.history.filter(h=>(h.phaseIndex??-1)===phaseIndex).length;
      state.scheduleDate=plusDays(isoDate(last.date),1);
      state.nextEventType=(count%on===0)?'rest':'workout';
    }else{
      state.scheduleDate=today;
      state.nextEventType='workout';
    }
  }
  if(state.scheduleDate<today) state.scheduleDate=today;
}
function nextDateInfo(){
  ensureScheduleState();
  return {
    next:state.nextEventType==='workout'?state.scheduleDate:plusDays(state.scheduleDate,1),
    rest:state.nextEventType==='rest'?state.scheduleDate:null,
    eventDate:state.scheduleDate,
    eventType:state.nextEventType
  };
}
function projectSchedule(startDate,endDate){
  ensureScheduleState();
  const items=[];
  let date=state.scheduleDate,type=state.nextEventType;
  let pIndex=state.phase,r=state.round,wIndex=state.workout;
  let phaseCount=phaseWorkoutCount(pIndex);

  while(date<=endDate){
    if(date>=startDate)items.push({date,type,phaseIndex:pIndex,round:r,workoutIndex:wIndex});
    if(type==='rest'){
      type='workout';
      date=plusDays(date,1);
      continue;
    }
    phaseCount++;
    wIndex++;
    if(wIndex>=program[pIndex].workouts.length){
      wIndex=0;r++;
      if(r>=program[pIndex].rounds){
        r=0;pIndex++;
        if(pIndex>=program.length){
          pIndex=program.length-1;r=program[pIndex].rounds-1;wIndex=program[pIndex].workouts.length-1;
        }
        phaseCount=0;
      }
    }
    type=(phaseCount%(program[pIndex]?.on||1)===0)?'rest':'workout';
    date=plusDays(date,1);
  }
  return items;
}

function warmupHTML(type){const data=type==='lower'?lowerWarmup:upperWarmup;return `<div class="warmup"><div class="warmup-title">${type==='lower'?'Lower':'Upper'} Warm-up</div>${data.map(x=>`<div class="warm-row"><div class="warm-copy"><b>${x[0]}</b><small>${x[1]}${x[2]?` · ${x[2]}`:''}</small></div><button class="warm-check" type="button">✓</button></div>`).join('')}</div>`}
function getDraftKey(){return `${state.phase}-${state.round}-${state.workout}`}
function getDraft(){return state.drafts[getDraftKey()]||{sets:{},warm:{}}}

function photoDayState(date=todayISO()){
  state.photoDays=state.photoDays||{};
  state.photoDays[date]=state.photoDays[date]||{front:false,side:false,back:false,flex:false};
  return state.photoDays[date];
}
function anyPhotoTaken(date){
  const p=(state.photoDays||{})[date];
  return !!(p&&(p.front||p.side||p.back||p.flex));
}
function renderPhotoTracker(){
  const p=photoDayState();
  const ids={Front:'front',Side:'side',Back:'back',Flex:'flex'};
  Object.entries(ids).forEach(([cap,key])=>{
    const el=document.getElementById('photoDone'+cap);
    if(el)el.checked=!!p[key];
  });
  const n=Object.values(p).filter(Boolean).length;
  const s=document.getElementById('photoTakenStatus');
  if(s)s.textContent=n?`${n} of 4 angles marked complete`:'No progress photos marked today';
}
function setPhotoDone(angle,checked){
  const p=photoDayState();
  if(!['front','side','back','flex'].includes(angle))return;
  p[angle]=!!checked;
  save();
  renderPhotoTracker();
  renderHistory();
}
function savePhotoTracker(){
  const p=photoDayState();
  p.front=!!document.getElementById('photoDoneFront')?.checked;
  p.side=!!document.getElementById('photoDoneSide')?.checked;
  p.back=!!document.getElementById('photoDoneBack')?.checked;
  p.flex=!!document.getElementById('photoDoneFlex')?.checked;
  save();
  renderPhotoTracker();
  renderHistory();
}

function renderToday(){
  ensureScheduleState();
  const p=phase(),w=current(),today=todayISO();
  const todaysWorkout=state.history.find(h=>isoDate(h.date)===today);
  const restDone=!!state.restDays[today];
  const isRest=state.scheduleDate===today&&state.nextEventType==='rest'&&!restDone&&!todaysWorkout;

  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});
  document.getElementById('overallProgress').style.width=`${state.completed/total*100}%`;
  document.getElementById('progressText').textContent=`${state.completed} of ${total} workouts completed`;
  document.getElementById('completedStat').textContent=state.completed;
  document.getElementById('phaseStat').textContent=`${state.phase+1} / 3`;

  const startBtn=document.getElementById('startBtn');
  const restBtn=document.getElementById('ackRestBtn');
  startBtn.style.display='none';restBtn.style.display='none';

  if(todaysWorkout){
    document.getElementById('phaseLabel').textContent=`${todaysWorkout.phase} · Round ${todaysWorkout.round}`;
    document.getElementById('nextWorkout').textContent="Today's workout complete";
    document.getElementById('sessionLabel').textContent=`${todaysWorkout.workout} completed`;
  }else if(restDone){
    document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;
    document.getElementById('nextWorkout').textContent='Rest day complete';
    document.getElementById('sessionLabel').textContent='Rest day acknowledged';
  }else if(isRest){
    document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;
    document.getElementById('nextWorkout').textContent='Rest day';
    document.getElementById('sessionLabel').textContent='No workout planned today';
    restBtn.style.display='block';
  }else{
    document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;
    document.getElementById('nextWorkout').textContent=w.name;
    document.getElementById('sessionLabel').textContent=`Workout ${Math.min(state.completed+1,total)} of ${total} · scheduled today`;
    startBtn.style.display='block';
  }
  const wt=state.weights[today]||{};
  document.getElementById('amWeight').value=wt.am||'';
  document.getElementById('pmWeight').value=wt.pm||'';
  document.getElementById('weightHint').textContent=wt.post?`Post-workout today: ${wt.post} lb`:'';
  renderTodayMacros();renderWater();renderActivities();renderEnergyBalance();renderPhotoTracker();
  const activityTime=document.getElementById('activityTime');if(activityTime&&!activityTime.value)activityTime.value=currentTimeHHMM();
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
function toggleChecklistReorder(){
  checklistReorderMode=!checklistReorderMode;
  const b=document.getElementById('reorderChecklistBtn');
  if(b)b.textContent=checklistReorderMode?'Done':'Reorder';
  renderChecklist();
}
function moveChecklistItem(id,dir){
  const i=state.checklistItems.findIndex(x=>x.id===id);
  const j=i+dir;if(i<0||j<0||j>=state.checklistItems.length)return;
  [state.checklistItems[i],state.checklistItems[j]]=[state.checklistItems[j],state.checklistItems[i]];
  save();renderChecklist();
}
function renderChecklist(){
  const list=document.getElementById('checklistList');
  const day=checklistDay();
  const items=state.checklistItems||[];
  const done=items.filter(x=>day[x.id]).length;
  document.getElementById('checklistDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
  document.getElementById('checklistCount').textContent=`${done} of ${items.length} complete`;
  const reorderBtn=document.getElementById('reorderChecklistBtn');if(reorderBtn)reorderBtn.textContent=checklistReorderMode?'Done':'Reorder';
  list.innerHTML=items.length?items.map(item=>`<div class="checklist-row ${day[item.id]?'done':''} ${checklistReorderMode?'reorder-mode':''}" data-item="${item.id}">
    ${checklistReorderMode?'':`<button class="checklist-check ${day[item.id]?'done':''}" data-check="${item.id}" aria-label="Mark ${esc(item.text)} complete">✓</button>`}
    <span class="checklist-text" data-text="${item.id}">${esc(item.text)}</span>
    <input class="checklist-edit" data-edit-input="${item.id}" value="${esc(item.text)}" aria-label="Edit ${esc(item.text)}">
    ${checklistReorderMode?`
      <div class="reorder-controls">
        <button class="check-move" data-check-up="${item.id}" aria-label="Move ${esc(item.text)} up">↑</button>
        <button class="check-move" data-check-down="${item.id}" aria-label="Move ${esc(item.text)} down">↓</button>
      </div>`:`
      <div class="checklist-actions">
        <button class="checklist-edit-btn" data-edit="${item.id}" aria-label="Edit ${esc(item.text)}">Edit</button>
        <button class="checklist-delete" data-delete="${item.id}" aria-label="Delete ${esc(item.text)}">×</button>
      </div>`}
  </div>`).join(''):'<p class="notice">No checklist items yet. Add your first daily item below.</p>';

  document.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.check;day[id]=!day[id];save();renderChecklist();
  }));

  document.querySelectorAll('[data-check-up]').forEach(b=>b.addEventListener('click',()=>moveChecklistItem(b.dataset.checkUp,-1)));
  document.querySelectorAll('[data-check-down]').forEach(b=>b.addEventListener('click',()=>moveChecklistItem(b.dataset.checkDown,1)));
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
    if(!handle)return;
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



function exerciseTotalsForDate(date){
  const workoutEntries=state.history.filter(h=>isoDate(h.date)===date);
  const workoutMinutes=workoutEntries.reduce((s,h)=>s+(+(h.summary?.duration)||0),0);
  const workoutCalories=workoutEntries.reduce((s,h)=>s+(+(h.summary?.totalCalories ?? h.summary?.activeCalories)||0),0);
  const acts=state.activities[date]||[];
  const activityMinutes=acts.reduce((s,a)=>s+(+a.minutes||0)+((+a.seconds||0)/60),0);
  const activityCalories=acts.reduce((s,a)=>s+(+a.calories||0),0);
  return {
    workoutMinutes,workoutCalories,activityMinutes,activityCalories,
    minutes:workoutMinutes+activityMinutes,
    calories:workoutCalories+activityCalories
  };
}
function energyForDate(date){
  const foods=(state.nutrition[date]?.foods)||[];
  const intake=totals(foods).cal;
  const ex=exerciseTotalsForDate(date);
  const bmr=+(state.bmr||1891);
  const tdee=+(state.tdee||2741);
  const nonExerciseMinutes=Math.max(0,1440-ex.minutes);
  const nonExerciseBurn=bmr*(nonExerciseMinutes/1440);
  const totalBurn=nonExerciseBurn+ex.calories;
  return {date,intake,ex,bmr,tdee,nonExerciseMinutes,nonExerciseBurn,totalBurn,balance:intake-totalBurn};
}
function mondayOf(date){
  const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7;
  d.setDate(d.getDate()-day);
  return isoDate(d);
}
function currentWeeklyMacroEnergy(){
  const dates=Object.keys(state.nutrition).filter(date=>totals(state.nutrition[date]?.foods||[]).cal>0).sort();
  if(!dates.length)return[];
  const weeks={};
  dates.forEach(date=>{
    const key=mondayOf(date);
    const n=totals(state.nutrition[date]?.foods||[]);
    const e=energyForDate(date);
    (weeks[key]||(weeks[key]=[])).push({date,...n,energy:e.balance});
  });
  return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).map(([date,days],idx)=>({
    date,
    label:`Week ${idx+1}`,
    range:`${new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}`,
    days:days.length,
    cal:days.reduce((s,x)=>s+x.cal,0)/days.length,
    p:days.reduce((s,x)=>s+x.p,0)/days.length,
    c:days.reduce((s,x)=>s+x.c,0)/days.length,
    f:days.reduce((s,x)=>s+x.f,0)/days.length,
    energy:days.reduce((s,x)=>s+x.energy,0)/days.length
  }));
}
function dailyEnergySeries(){
  return Object.keys(state.nutrition).sort().map(date=>{
    const n=totals(state.nutrition[date]?.foods||[]);
    if(!n.cal)return null;
    const e=energyForDate(date);
    return {date,label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),energy:Math.round(e.balance)};
  }).filter(Boolean);
}
function signedKcal(v){
  const n=Math.round(+v||0);
  return `${n>0?'+':''}${n} kcal`;
}

function todaysExerciseTotals(){return exerciseTotalsForDate(todayISO());}
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

function editActivity(index){
  const today=todayISO();
  const a=(state.activities[today]||[])[index];
  if(!a)return;
  activityEditIndex=index;
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=(val??'')};
  const typeEl=document.getElementById('activityType');
  if(typeEl)typeEl.value=a.type||'Walk';
  set('activityTime',a.time||'');
  set('activityMinutes',a.minutes||0);
  set('activitySeconds',a.seconds||0);
  set('activityDistance',a.distance||0);
  set('activityCalories',a.calories||0);
  set('activityAvgHr',a.avgHr||0);
  ['z1','z2','z3','z4','z5'].forEach(k=>set('activity'+k.toUpperCase(),a[k]||''));
  const addBtn=document.getElementById('addActivityBtn');
  if(addBtn)addBtn.textContent='Save changes';
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
    if(+a.calories)bits.push(`${a.calories} total kcal`);
    if(+a.avgHr)bits.push(`${a.avgHr} avg bpm`);
    const zones=[1,2,3,4,5].map(z=>a[`z${z}`]).filter(Boolean);
    const zoneLine=zones.length?[1,2,3,4,5].map(z=>a[`z${z}`]?`Z${z} ${a[`z${z}`]}`:'').filter(Boolean).join(' · '):'';
    return `<div class="activity-row">
      <div><b>${esc(a.type)}</b><small>${a.time?`${formatTime12(a.time)} · `:''}${bits.join(' · ')}</small>${zoneLine?`<small class="zone-line">${zoneLine}</small>`:''}</div>
      <div class="activity-actions"><button data-activity-edit="${i}" aria-label="Edit ${esc(a.type)}">Edit</button><button data-activity-delete="${i}" aria-label="Delete ${esc(a.type)}">×</button></div>
    </div>`;
  }).join(''):'<p class="notice">No walks or jogs logged today.</p>';
  document.querySelectorAll('[data-activity-edit]').forEach(b=>b.addEventListener('click',()=>editActivity(+b.dataset.activityEdit)));
  document.querySelectorAll('[data-activity-delete]').forEach(b=>b.addEventListener('click',()=>{
    state.activities[today].splice(+b.dataset.activityDelete,1);
    save();renderActivities();renderEnergyBalance();
  }));
  const t=todaysExerciseTotals();
  const summary=document.getElementById('activitySummary');
  if(summary)summary.textContent=`${Math.round(t.minutes)} min exercise · ${Math.round(t.calories)} total exercise kcal`;
}

function setHrDefaultsForType(){
  const type=document.getElementById('activityType').value;
  const details=document.getElementById('hrDetails');
  const avg=document.getElementById('activityAvgHr');
  const z=[1,2,3,4,5].map(i=>document.getElementById(`activityZ${i}`));

  if(type==='Walk'){
    details.style.display='none';
    details.open=false;
    avg.value='';
    z.forEach(x=>x.value='');
    return;
  }

  details.style.display='block';

  if(type==='Jog'){
    avg.value='154';
    const vals=['1:43','4:14','5:23','6:55','0:00'];
    z.forEach((x,i)=>x.value=vals[i]);
  }else if(type==='Run'){
    avg.value='0';
    z.forEach(x=>x.value='0:00');
  }else{
    avg.value='';
    z.forEach(x=>x.value='');
  }
}

function addActivity(){
  const type=document.getElementById('activityType').value;
  const time=document.getElementById('activityTime')?.value||currentTimeHHMM();
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
  const entry={type,time,minutes,seconds,distance,calories,avgHr,...zones};
  if(activityEditIndex!==null && state.activities[today][activityEditIndex]){
    state.activities[today][activityEditIndex]=entry;
  }else{
    state.activities[today].push(entry);
  }
  activityEditIndex=null;
  const addBtn=document.getElementById('addActivityBtn');
  if(addBtn)addBtn.textContent='Add activity';
  ['activityMinutes','activitySeconds','activityDistance','activityCalories'].forEach(id=>document.getElementById(id).value='');
  setHrDefaultsForType();
  const t=document.getElementById('activityTime');if(t)t.value=currentTimeHHMM();
  save();renderActivities();renderEnergyBalance();
}
function renderEnergyBalance(){
  const el=document.getElementById('energyBalance');
  if(!el)return;
  const e=energyForDate(todayISO());
  const label=e.balance<0?'deficit':e.balance>0?'surplus':'balance';
  const amount=Math.abs(Math.round(e.balance));
  el.innerHTML=`<div class="balance-main">
      <span>${label==='deficit'?'Estimated deficit':label==='surplus'?'Estimated surplus':'Estimated balance'}</span>
      <strong class="${label}">${amount} kcal</strong>
    </div>
    <div class="balance-grid">
      <div><b>${Math.round(e.intake)}</b><span>intake</span></div>
      <div><b>${Math.round(e.totalBurn)}</b><span>estimated burn</span></div>
      <div><b>${Math.round(e.ex.calories)}</b><span>exercise total kcal</span></div>
      <div><b>${Math.round(e.nonExerciseBurn)}</b><span>non-exercise burn</span></div>
    </div>
    <p class="tiny balance-note">${Math.round(e.ex.minutes)} exercise min + ${Math.round(e.nonExerciseMinutes)} non-exercise min. Non-exercise burn uses BMR ${e.bmr} kcal/day. Measured TDEE: ${e.tdee} kcal/day (reference).</p>`;
}


function acknowledgeRest(){
  ensureScheduleState();
  const today=todayISO();
  if(state.nextEventType!=='rest'||state.scheduleDate!==today)return;
  state.restDays[today]=true;
  state.scheduleDate=plusDays(today,1);
  state.nextEventType='workout';
  save();renderAll();showScreen('today');
}

function renderWorkout(){const p=phase(),w=current(),draft=getDraft();document.getElementById('workoutPhase').textContent=`${p.name} · R${state.round+1}`;document.getElementById('workoutTitle').textContent=w.name;document.getElementById('workoutMeta').textContent=`${w.ex.length} exercises · ${p.on} days on / 1 off`;const el=document.getElementById('exerciseList');el.innerHTML=warmupHTML(workoutType(w.name));w.ex.forEach((x,i)=>{const [name,sets,rest,last]=x;const previous=latestExercise(name)||last||'—';let rows=sets.map((target,j)=>{const v=(draft.sets[i]||[])[j]||{};return `<div class="setrow"><div class="setnum">${j+1}</div><input data-e="${i}" data-s="${j}" data-k="weight" inputmode="decimal" placeholder="weight" value="${v.weight??''}"><input data-e="${i}" data-s="${j}" data-k="reps" inputmode="numeric" placeholder="reps · ${target}" value="${v.reps??''}"><button class="check ${v.done?'done':''}" data-e="${i}" data-s="${j}" data-rest="${rest}">✓</button></div>`}).join('');el.insertAdjacentHTML('beforeend',`<div class="exercise"><h3>${name}</h3><div class="rx">${sets.length} set${sets.length>1?'s':''} · ${sets.join(' / ')}${rest?` · ${rest} rest`:''}</div><div class="last">Last: ${previous}</div>${rows}</div>`)});document.querySelectorAll('.warm-check').forEach((b,i)=>{if(draft.warm[i]){b.classList.add('done');b.closest('.warm-row').classList.add('done')}b.addEventListener('click',()=>{draft.warm[i]=!draft.warm[i];b.classList.toggle('done');b.closest('.warm-row').classList.toggle('done');storeDraft(draft)})});document.querySelectorAll('.setrow input').forEach(inp=>inp.addEventListener('input',()=>{const e=+inp.dataset.e,s=+inp.dataset.s;draft.sets[e]=draft.sets[e]||[];draft.sets[e][s]=draft.sets[e][s]||{};draft.sets[e][s][inp.dataset.k]=inp.value;storeDraft(draft)}));document.querySelectorAll('.check').forEach(b=>b.addEventListener('click',()=>{const e=+b.dataset.e,s=+b.dataset.s;draft.sets[e]=draft.sets[e]||[];draft.sets[e][s]=draft.sets[e][s]||{};draft.sets[e][s].done=!draft.sets[e][s].done;b.classList.toggle('done');storeDraft(draft);if(draft.sets[e][s].done&&b.dataset.rest)startTimer(b.dataset.rest)}));}
function storeDraft(d){state.drafts[getDraftKey()]=d;save()}
function latestExercise(name){for(const h of state.history){if(h.sets&&h.sets[name]){const vals=h.sets[name].filter(x=>x.weight||x.reps).map(x=>`${x.weight?x.weight+'×':''}${x.reps||''}`);if(vals.length)return vals.join(', ')}}return null}
function parseRest(s){if(!s)return 0;const [m,sec]=s.split(':').map(Number);return m*60+sec}
function startTimer(rest){stopTimer();timerLeft=parseRest(rest);if(!timerLeft)return;document.getElementById('timer').classList.add('show');tick();timerInterval=setInterval(()=>{timerLeft--;tick();if(timerLeft<=0)stopTimer()},1000)}
function tick(){document.getElementById('timerText').textContent=`${String(Math.floor(timerLeft/60)).padStart(2,'0')}:${String(timerLeft%60).padStart(2,'0')}`}
function stopTimer(){clearInterval(timerInterval);document.getElementById('timer').classList.remove('show')}
function openFinish(){
  document.getElementById('finishWorkoutName').textContent=current().name;
  const t=document.getElementById('sumTime');if(t)t.value=currentTimeHHMM();
  document.getElementById('finishModal').classList.add('show');
  document.getElementById('finishModal').setAttribute('aria-hidden','false');
}
function closeFinish(){document.getElementById('finishModal').classList.remove('show');document.getElementById('finishModal').setAttribute('aria-hidden','true')}
function saveWorkout(){
  ensureScheduleState();
  const w=current(),p=phase(),draft=getDraft(),sets={};
  w.ex.forEach((x,i)=>sets[x[0]]=(draft.sets[i]||[]).map(v=>({weight:v.weight||'',reps:v.reps||'',done:!!v.done})));
  const summary={duration:num('sumDuration'),time:document.getElementById('sumTime')?.value||currentTimeHHMM(),totalCalories:num('sumTotalCal'),avgHr:num('sumAvgHr'),maxHr:num('sumMaxHr'),postWeight:num('sumWeight'),notes:document.getElementById('sumNotes').value.trim()};
  const date=new Date().toISOString(),completedPhaseIndex=state.phase;
  state.history.unshift({date,phase:p.name,phaseIndex:state.phase,round:state.round+1,workout:w.name,sets,summary});
  if(summary.postWeight)state.weights[todayISO()]={...(state.weights[todayISO()]||{}),post:summary.postWeight};
  delete state.drafts[getDraftKey()];
  state.completed++;
  const completedCount=state.history.filter(h=>(h.phaseIndex??-1)===completedPhaseIndex).length;
  const restNext=completedCount%(program[completedPhaseIndex]?.on||1)===0;
  advanceProgram();
  state.scheduleDate=plusDays(todayISO(),1);
  state.nextEventType=restNext?'rest':'workout';
  save();clearSummary();closeFinish();renderAll();showScreen('today');
}
function advanceProgram(){state.workout++;if(state.workout>=phase().workouts.length){state.workout=0;state.round++;if(state.round>=phase().rounds){state.round=0;state.phase++;if(state.phase>=program.length){state.phase=program.length-1;state.round=phase().rounds-1;state.workout=phase().workouts.length-1}}}}
function clearSummary(){['sumDuration','sumTime','sumTotalCal','sumAvgHr','sumMaxHr','sumWeight','sumNotes'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''})}
function renderNutrition(){const d=document.getElementById('nutritionDate').value||todayISO();document.getElementById('nutritionDate').value=d;const g=state.goals;[['goalCal','cal'],['goalP','p'],['goalC','c'],['goalF','f']].forEach(([id,k])=>document.getElementById(id).value=g[k]);state.nutrition[d]=state.nutrition[d]||{foods:[]};const foods=state.nutrition[d].foods;document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);document.getElementById('foodList').innerHTML=foods.length?foods.map((f,i)=>foodRow(f,i)).join(''):'<p class="notice">No foods logged yet.</p>';document.querySelectorAll('.food-row input').forEach(inp=>inp.addEventListener('blur',foodChanged));document.querySelectorAll('.food-row button').forEach(b=>b.addEventListener('click',()=>{foods.splice(+b.dataset.i,1);save();renderNutrition();renderTodayMacros()}));}
function foodRow(f,i){return `<div class="food-row"><label class="food-name">Food<input data-i="${i}" data-k="name" value="${esc(f.name||'')}"></label><label>Wt(g)<input inputmode="decimal" data-i="${i}" data-k="weight" value="${f.weight||''}"></label><label>Cal<input inputmode="numeric" data-i="${i}" data-k="cal" value="${f.cal||''}"></label><label>P<input inputmode="decimal" data-i="${i}" data-k="p" value="${f.p||''}"></label><label>C<input inputmode="decimal" data-i="${i}" data-k="c" value="${f.c||''}"></label><label>F<input inputmode="decimal" data-i="${i}" data-k="f" value="${f.f||''}"></label><label>Time<input type="time" data-i="${i}" data-k="time" value="${f.time||''}"></label><button data-i="${i}">×</button></div>`}
function refreshNutritionTotals(d){const foods=(state.nutrition[d]?.foods)||[],g=state.goals;document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);if(d===todayISO())renderTodayMacros()}
function foodChanged(e){const d=document.getElementById('nutritionDate').value,foods=state.nutrition[d].foods,i=+e.target.dataset.i,k=e.target.dataset.k;foods[i][k]=(k==='name'||k==='time')?e.target.value:(parseFloat(e.target.value)||0);save();refreshNutritionTotals(d)}
function addFood(){const d=document.getElementById('nutritionDate').value||todayISO();state.nutrition[d]=state.nutrition[d]||{foods:[]};state.nutrition[d].foods.push({name:'',weight:0,cal:0,p:0,c:0,f:0,time:currentTimeHHMM()});save();renderNutrition();setTimeout(()=>document.querySelectorAll('.food-name input')[document.querySelectorAll('.food-name input').length-1]?.focus(),0)}
function totals(foods){return foods.reduce((a,f)=>({cal:a.cal+(+f.cal||0),p:a.p+(+f.p||0),c:a.c+(+f.c||0),f:a.f+(+f.f||0)}),{cal:0,p:0,c:0,f:0})}
function saveGoals(){state.goals={cal:num('goalCal'),p:num('goalP'),c:num('goalC'),f:num('goalF')};save();renderNutrition();renderTodayMacros()}

function openWorkoutEditor(index){
  const h=state.history[index];
  if(!h)return;
  workoutEditIndex=index;
  const s=h.summary||{};
  document.getElementById('editWorkoutName').textContent=`${h.workout} · ${h.phase} · Round ${h.round}`;
  document.getElementById('editWorkoutDuration').value=s.duration||'';
  document.getElementById('editWorkoutTime').value=workoutTime(h);
  document.getElementById('editWorkoutCalories').value=(s.totalCalories ?? s.activeCalories ?? '')||'';
  document.getElementById('editWorkoutAvgHr').value=s.avgHr||'';
  document.getElementById('editWorkoutMaxHr').value=s.maxHr||'';
  document.getElementById('editWorkoutWeight').value=s.postWeight||'';
  document.getElementById('editWorkoutNotes').value=s.notes||'';

  const sets=h.sets||{};
  const box=document.getElementById('editWorkoutSets');
  const names=Object.keys(sets);
  box.innerHTML=names.length?names.map((name,ei)=>{
    const rows=sets[name]||[];
    return `<div class="edit-exercise-card" data-edit-exercise="${ei}">
      <div class="edit-exercise-name">${esc(name)}</div>
      <div class="edit-set-header"><span>Set</span><span>Weight</span><span>Reps</span><span>Done</span></div>
      ${rows.map((set,si)=>`<div class="edit-set-row" data-exercise-name="${encodeURIComponent(name)}" data-set-index="${si}">
        <span>${si+1}</span>
        <input class="edit-set-weight" inputmode="decimal" value="${esc(set.weight??'')}">
        <input class="edit-set-reps" inputmode="numeric" value="${esc(set.reps??'')}">
        <input class="edit-set-done" type="checkbox" ${set.done?'checked':''}>
      </div>`).join('')}
    </div>`;
  }).join(''):'<p class="notice">No saved set details for this workout.</p>';

  const modal=document.getElementById('editWorkoutModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
function closeWorkoutEditor(){
  workoutEditIndex=null;
  const modal=document.getElementById('editWorkoutModal');
  if(!modal)return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}
function saveEditedWorkout(){
  if(workoutEditIndex===null)return;
  const h=state.history[workoutEditIndex];
  if(!h)return;

  const oldPost=+(h.summary?.postWeight||0);
  const oldDate=isoDate(h.date);
  const summary={
    ...(h.summary||{}),
    duration:num('editWorkoutDuration'),
    time:document.getElementById('editWorkoutTime')?.value||workoutTime(h),
    totalCalories:num('editWorkoutCalories'),
    avgHr:num('editWorkoutAvgHr'),
    maxHr:num('editWorkoutMaxHr'),
    postWeight:num('editWorkoutWeight'),
    notes:document.getElementById('editWorkoutNotes').value.trim()
  };
  delete summary.activeCalories;
  h.summary=summary;

  const newSets={};
  document.querySelectorAll('#editWorkoutSets .edit-set-row').forEach(row=>{
    const name=decodeURIComponent(row.dataset.exerciseName||'');
    newSets[name]=newSets[name]||[];
    newSets[name].push({
      weight:row.querySelector('.edit-set-weight')?.value||'',
      reps:row.querySelector('.edit-set-reps')?.value||'',
      done:!!row.querySelector('.edit-set-done')?.checked
    });
  });
  if(Object.keys(newSets).length)h.sets=newSets;

  state.weights[oldDate]=state.weights[oldDate]||{};
  if(summary.postWeight)state.weights[oldDate].post=summary.postWeight;
  else if(oldPost && state.weights[oldDate].post==oldPost)delete state.weights[oldDate].post;

  save();
  closeWorkoutEditor();
  renderAll();
  renderDayDetail(oldDate);
}

function renderHistory(){
  ensureScheduleState();
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();
  document.getElementById('monthLabel').textContent=calendarCursor.toLocaleDateString(undefined,{month:'short',year:'numeric'});
  const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=first.getDay();
  const monthStart=isoDate(first),monthEnd=isoDate(new Date(y,m,days));
  const projected=projectSchedule(monthStart,monthEnd),plan={};
  projected.forEach(x=>plan[x.date]=x);
  const byDate={};
  state.history.forEach(h=>{const d=isoDate(h.date);(byDate[d]=byDate[d]||[]).push(h)});
  let html='';
  for(let i=0;i<offset;i++)html+='<div class="day blank"></div>';
  for(let d=1;d<=days;d++){
    const key=isoDate(new Date(y,m,d)),classes=['day'];
    const complete=!!byDate[key]||!!state.restDays[key],p=plan[key];
    if(key===todayISO())classes.push('today');
    if(complete)classes.push('completed-day');
    if(p?.type==='workout')classes.push('scheduled-workout');
    if(p?.type==='rest')classes.push('scheduled-rest');
    const dot=p?`<span class="schedule-dot ${p.type}"></span>`:'';
    const photoMark=anyPhotoTaken(key)?'<span class="photo-day-marker" aria-label="Progress photos taken">📷</span>':'';
    html+=`<button class="${classes.join(' ')}" data-date="${key}">${d}${dot}${photoMark}</button>`;
  }
  document.getElementById('calendar').innerHTML=html;
  document.querySelectorAll('.day[data-date]').forEach(b=>b.addEventListener('click',()=>renderDayDetail(b.dataset.date)));

  const next=projectSchedule(todayISO(),plusDays(todayISO(),60))[0];
  if(next){
    const pp=program[next.phaseIndex],ww=pp.workouts[next.workoutIndex];
    document.getElementById('nextScheduleCard').innerHTML=`<div class="eyebrow">Next scheduled ${next.type==='rest'?'rest day':'workout'}</div><h3>${next.type==='rest'?'Rest Day':ww.name}</h3><p class="muted">${new Date(next.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})} · ${pp.name} · Round ${next.round+1}</p>`;
  }
}
function renderDayDetail(date){
  const hs=state.history.filter(h=>isoDate(h.date)===date),wt=state.weights[date],nut=state.nutrition[date];
  let parts=`<div class="eyebrow">${new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>`;

  if(state.restDays[date])parts+=`<div class="day-detail-row"><b>Rest day complete</b><small>Acknowledged</small></div>`;

  if(hs.length)hs.forEach(h=>{
    const s=h.summary||{};
    const historyIndex=state.history.indexOf(h);
    const kcal=(s.totalCalories ?? s.activeCalories ?? 0);
    parts+=`<div class="day-detail-row workout-history-detail">
      <div>
        <b>${esc(h.workout)}</b>
        <small>${workoutTime(h)?`${formatTime12(workoutTime(h))} · `:''}${esc(h.phase)} · Round ${h.round}${s.duration?` · ${s.duration} min`:''}${kcal?` · ${kcal} total kcal`:''}${s.avgHr?` · ${s.avgHr} avg HR`:''}${s.maxHr?` · ${s.maxHr} max HR`:''}${s.postWeight?` · ${s.postWeight} lb post`:''}</small>
        ${s.notes?`<small class="history-notes">${esc(s.notes)}</small>`:''}
      </div>
      <button class="secondary compact edit-workout-history-btn" onclick="openWorkoutEditor(${historyIndex})">Edit workout</button>
    </div>`;
  });

  if(wt)parts+=`<div class="day-detail-row"><b>Weight</b><small>${wt.am?`AM ${wt.am} lb · `:''}${wt.post?`Post ${wt.post} lb · `:''}${wt.pm?`PM ${wt.pm} lb`:''}</small></div>`;
  if(nut){
    const t=totals(nut.foods||[]);
    parts+=`<div class="day-detail-row"><b>Nutrition</b><small>${Math.round(t.cal)} kcal · ${Math.round(t.p)} P · ${Math.round(t.c)} C · ${Math.round(t.f)} F</small></div>`;
    (nut.foods||[]).filter(x=>x.name||x.cal).forEach(x=>parts+=`<div class="day-detail-row history-subrow"><b>${x.time?formatTime12(x.time)+' · ':''}${esc(x.name||'Food')}</b><small>${x.weight?`${x.weight} g · `:''}${Math.round(+x.cal||0)} kcal</small></div>`);
  }
  const acts=state.activities[date]||[];
  if(acts.length){
    const mins=acts.reduce((s,a)=>s+(+a.minutes||0)+((+a.seconds||0)/60),0),cals=acts.reduce((s,a)=>s+(+a.calories||0),0);
    parts+=`<div class="day-detail-row"><b>Walks / jogs</b><small>${Math.round(mins)} min · ${Math.round(cals)} total kcal</small></div>`;
    acts.forEach(a=>parts+=`<div class="day-detail-row history-subrow"><b>${a.time?formatTime12(a.time)+' · ':''}${esc(a.type||'Cardio')}</b><small>${a.distance?`${a.distance} mi · `:''}${Math.round((+a.minutes||0)+((+a.seconds||0)/60))} min${a.calories?` · ${a.calories} kcal`:''}</small></div>`);
  }
  if(totals((state.nutrition[date]?.foods)||[]).cal>0){
    const e=energyForDate(date);
    const label=e.balance<0?'Estimated deficit':e.balance>0?'Estimated surplus':'Estimated balance';
    parts+=`<div class="day-detail-row energy-history-row"><b>Energy result</b><small>${label}: ${Math.abs(Math.round(e.balance))} kcal · ${Math.round(e.intake)} intake · ${Math.round(e.totalBurn)} estimated burn</small></div>`;
  }
  const water=state.water[date];if(water)parts+=`<div class="day-detail-row"><b>Water</b><small>${water} oz</small></div>`;
  const cd=state.checklistDays[date];if(cd){const items=state.checklistItems||[],done=items.filter(x=>cd[x.id]).length;parts+=`<div class="day-detail-row"><b>Checklist</b><small>${done} of ${items.length} complete</small></div>`}
  const pd=(state.photoDays||{})[date];if(pd&&Object.values(pd).some(Boolean)){const taken=Object.entries(pd).filter(([,v])=>v).map(([k])=>k[0].toUpperCase()+k.slice(1)).join(' · ');parts+=`<div class="day-detail-row"><b>📷 Progress photos</b><small>${taken}</small></div>`}
  if(!hs.length&&!state.restDays[date]&&!wt&&!nut&&!acts.length&&!water&&!cd&&!anyPhotoTaken(date))parts+='<p class="notice">No saved data for this day.</p>';
  document.getElementById('dayDetail').innerHTML=parts;
}

function svgLineChart(points,{valueKey,labelKey='label',suffix='',minPad=2,maxPad=2,height=220}={}){
  if(!points.length)return '<p class="notice">No data yet.</p>';
  const width=760,padL=42,padR=18,padT=18,padB=38,plotW=width-padL-padR,plotH=height-padT-padB;
  const vals=points.map(x=>+x[valueKey]).filter(Number.isFinite);
  let min=Math.min(...vals),max=Math.max(...vals);
  if(min===max){min-=1;max+=1}
  min-=minPad;max+=maxPad;
  const x=i=>padL+(points.length===1?plotW/2:(i/(points.length-1))*plotW);
  const y=v=>padT+((max-v)/(max-min))*plotH;
  const path=points.map((p,i)=>`${i?'L':'M'} ${x(i).toFixed(1)} ${y(+p[valueKey]).toFixed(1)}`).join(' ');
  const grid=[0,.25,.5,.75,1].map(f=>{
    const yy=padT+f*plotH, val=max-f*(max-min);
    return `<line x1="${padL}" y1="${yy}" x2="${width-padR}" y2="${yy}" class="chart-grid"/><text x="${padL-8}" y="${yy+4}" text-anchor="end" class="chart-axis">${Math.round(val)}${suffix}</text>`;
  }).join('');
  const labels=points.map((p,i)=>{
    const show=points.length<=10 || i===0 || i===points.length-1 || i%Math.ceil(points.length/6)===0;
    return show?`<text x="${x(i)}" y="${height-10}" text-anchor="middle" class="chart-axis">${esc(p[labelKey])}</text>`:'';
  }).join('');
  const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(+p[valueKey])}" r="5" class="chart-dot"><title>${esc(p[labelKey])}: ${p[valueKey]}${suffix}${p.session?` · ${esc(p.session)}`:''}</title></circle>`).join('');
  return `<svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img">${grid}<path d="${path}" class="chart-line"/>${dots}${labels}</svg>`;
}
function currentWeightSeries(){
  return Object.entries(state.weights).filter(([,v])=>v.am).map(([date,v])=>({date,label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),weight:+v.am,session:'Current'})).sort((a,b)=>a.date.localeCompare(b.date));
}
function currentWeeklyNutrition(){
  const rows=Object.entries(state.nutrition).map(([date,n])=>({date,...totals(n.foods||[])})).filter(x=>x.cal>0).sort((a,b)=>a.date.localeCompare(b.date));
  if(!rows.length)return[];
  const weeks={};
  rows.forEach(r=>{
    const d=new Date(r.date+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);
    const key=isoDate(d);weeks[key]=weeks[key]||[];
    weeks[key].push(r);
  });
  return Object.entries(weeks).map(([date,arr])=>({
    date,label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),
    cal:arr.reduce((s,x)=>s+x.cal,0)/arr.length,
    protein:arr.reduce((s,x)=>s+x.p,0)/arr.length,
    session:'Current'
  })).sort((a,b)=>a.date.localeCompare(b.date));
}
function currentCardioSeries(){
  const out=[];
  Object.entries(state.activities).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([date,acts])=>{
    acts.filter(a=>['Jog','Run'].includes(a.type)&&+a.distance&&activitySeconds(a)).forEach(a=>{
      out.push({date,label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),pace:activitySeconds(a)/(+a.distance)/60,avgHr:+a.avgHr||0,distance:+a.distance,type:a.type});
    });
  });
  return out;
}

const photoDBName='MattFitnessPhotos';
function photoDB(){return new Promise((resolve,reject)=>{const q=indexedDB.open(photoDBName,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('photos'))q.result.createObjectStore('photos')};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function photoPut(key,blob){const db=await photoDB();return new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function photoGet(key){const db=await photoDB();return new Promise((resolve,reject)=>{const q=db.transaction('photos').objectStore('photos').get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}
async function photoDeleteAll(){const db=await photoDB();return new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function daysBetween(a,b){return Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function phasePhotoDone(){return (state.photoCheckins||[]).some(x=>x.type==='phase'&&x.phaseIndex===state.phase)}
function photoDueInfo(){
  if(!phasePhotoDone())return{due:true,type:'phase',title:`Phase ${state.phase+1} starting photos`,text:'Take a baseline photo set for the beginning of this phase.'};
  if(state.photoSettings?.weekly){const last=[...(state.photoCheckins||[])].sort((a,b)=>b.date.localeCompare(a.date))[0];if(!last||daysBetween(last.date,todayISO())>=7)return{due:true,type:'weekly',title:'Weekly progress photos',text:'Your optional weekly visual check-in is due.'}}
  return{due:false};
}
function renderPhotoDue(){const el=document.getElementById('photoDueCard');if(!el)return;const d=photoDueInfo();el.style.display=d.due?'block':'none';if(d.due){document.getElementById('photoDueTitle').textContent=d.title;document.getElementById('photoDueText').textContent=d.text;el.dataset.photoType=d.type}}
let photoCheckinType='manual';
function openManualPhotos(){openPhotoModal('manual')}
function openPhotoModal(type){const due=photoDueInfo();photoCheckinType=type||due.type||'manual';document.getElementById('photoModal').classList.add('show');setTimeout(bindPhotoInputs,0);document.getElementById('photoModalEyebrow').textContent=photoCheckinType==='phase'?`Phase ${state.phase+1}`:photoCheckinType==='weekly'?'Weekly check-in':'Progress check-in';['Front','Side','Back','Flex'].forEach(a=>{['Camera','Library'].forEach(src=>{const input=document.getElementById('photo'+a+src);if(input)input.value=''});document.getElementById(a.toLowerCase()+'Status').textContent='No photo selected'})}
function closePhotoModal(){
  const modal=document.getElementById('photoModal');
  if(modal)modal.classList.remove('show');
}
async function compressPhoto(file){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const max=1000,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);c.toBlob(b=>{URL.revokeObjectURL(url);b?resolve(b):reject(new Error('Photo compression failed'))},'image/jpeg',.78)};img.onerror=reject;img.src=url})}
function selectedPhoto(angle){
  const cap=angle[0].toUpperCase()+angle.slice(1);
  const camera=document.getElementById('photo'+cap+'Camera');
  const library=document.getElementById('photo'+cap+'Library');
  return (camera&&camera.files&&camera.files[0])||(library&&library.files&&library.files[0])||null;
}
async function savePhotoCheckin(){
  const files={front:selectedPhoto('front'),side:selectedPhoto('side'),back:selectedPhoto('back'),flex:selectedPhoto('flex')};
  if(!Object.values(files).some(Boolean)){alert('Take or choose at least one photo first.');return}
  const btn=document.getElementById('savePhotoCheckinBtn');btn.disabled=true;btn.textContent='Saving…';
  try{
    const id=`${todayISO()}-${Date.now()}`,angles=[];
    for(const [angle,file] of Object.entries(files)){
      if(!file)continue;
      const blob=await compressPhoto(file);
      await photoPut(`${id}:${angle}`,blob);
      angles.push(angle);
    }
    state.photoCheckins=state.photoCheckins||[];
    state.photoCheckins.push({id,date:todayISO(),type:photoCheckinType,phaseIndex:state.phase,angles});
    save();
    closePhotoModal();
    renderAll();
    try{await renderPhotoGallery()}catch(galleryError){console.error('Photo gallery refresh failed',galleryError)}
  }catch(e){
    console.error('Photo save failed',e);
    alert('The photo could not be saved on this device. Please try again.');
  }finally{
    btn.disabled=false;
    btn.textContent='Save photo check-in';
  }
}
function photoLabel(x){const d=new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});return x.type==='phase'?`${d} · Phase ${x.phaseIndex+1}`:x.type==='weekly'?`${d} · Weekly`:d}
async function photoURL(checkin,angle){const b=await photoGet(`${checkin.id}:${angle}`);return b?URL.createObjectURL(b):''}
async function renderPhotoGallery(){
 const gallery=document.getElementById('photoGallery');if(!gallery)return;const list=[...(state.photoCheckins||[])].sort((a,b)=>b.date.localeCompare(a.date));document.getElementById('weeklyPhotosToggle').checked=!!state.photoSettings?.weekly;
 if(!list.length){gallery.innerHTML='<p class="notice">No photo check-ins yet.</p>';document.getElementById('photoCompareControls').style.display='none';document.getElementById('photoCompare').innerHTML='';return}
 gallery.innerHTML='';for(const x of list.slice(0,8)){const card=document.createElement('div');card.className='photo-checkin';let thumb='',thumbAngle='progress';for(const a of ['front','side','back','flex']){if(x.angles.includes(a)){thumb=await photoURL(x,a);if(thumb){thumbAngle=a;break}}}card.innerHTML=`${thumb?`<img src="${thumb}" alt="${thumbAngle} progress photo">`:''}<div><b>${esc(photoLabel(x))}</b><small>${x.angles.map(a=>a[0].toUpperCase()+a.slice(1)).join(' · ')}</small></div>`;gallery.appendChild(card)}
 const controls=document.getElementById('photoCompareControls');controls.style.display=list.length>=2?'flex':'none';if(list.length>=2){const opts=list.map(x=>`<option value="${x.id}">${esc(photoLabel(x))}</option>`).join('');document.getElementById('compareA').innerHTML=opts;document.getElementById('compareB').innerHTML=opts;document.getElementById('compareB').selectedIndex=1}
}
async function comparePhotos(){const list=state.photoCheckins||[],a=list.find(x=>x.id===document.getElementById('compareA').value),b=list.find(x=>x.id===document.getElementById('compareB').value);if(!a||!b)return;const wrap=document.getElementById('photoCompare');wrap.innerHTML='';for(const angle of ['front','side','back','flex']){if(!a.angles.includes(angle)||!b.angles.includes(angle))continue;const ua=await photoURL(a,angle),ub=await photoURL(b,angle);const row=document.createElement('div');row.className='compare-row';row.innerHTML=`<div class="compare-angle">${angle[0].toUpperCase()+angle.slice(1)}</div><div class="compare-pair"><figure><img src="${ua}"><figcaption>${esc(photoLabel(a))}</figcaption></figure><figure><img src="${ub}"><figcaption>${esc(photoLabel(b))}</figcaption></figure></div>`;wrap.appendChild(row)}}
function toggleWeeklyPhotos(){state.photoSettings=state.photoSettings||{};state.photoSettings.weekly=document.getElementById('weeklyPhotosToggle').checked;save();renderPhotoDue()}

function renderProgress(){
  const entries=Object.entries(state.weights).filter(([,v])=>v.am||v.pm).sort((a,b)=>a[0].localeCompare(b[0]));
  const ams=entries.filter(([,v])=>v.am).map(([d,v])=>({d,v:+v.am}));
  const latest=ams.at(-1),last7=ams.slice(-7);
  document.getElementById('latestWeight').textContent=latest?`${latest.v.toFixed(1)} lb`:'—';
  document.getElementById('avg7Weight').textContent=last7.length?`${(last7.reduce((s,x)=>s+x.v,0)/last7.length).toFixed(1)} lb`:'—';
  const swings=entries.filter(([,v])=>v.am&&v.pm).map(([,v])=>+v.pm-+v.am);
  document.getElementById('dailySwing').textContent=swings.length?`${(swings.reduce((a,b)=>a+b,0)/swings.length).toFixed(1)} lb`:'—';

  const allWeights=[...(state.historicalEnabled===false?[]:historicalWeight),...currentWeightSeries()].sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById('weightChart').innerHTML=svgLineChart(allWeights,{valueKey:'weight',suffix:'',minPad:2,maxPad:2});
  const histNut=[...(state.historicalEnabled===false?[]:historicalCalories),...currentWeeklyNutrition()].sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById('calorieChart').innerHTML=svgLineChart(histNut,{valueKey:'cal',minPad:150,maxPad:150});
  document.getElementById('proteinChart').innerHTML=svgLineChart(histNut,{valueKey:'protein',suffix:'g',minPad:10,maxPad:10});

  const cardio=currentCardioSeries();
  document.getElementById('cardioChart').innerHTML=cardio.length?svgLineChart(cardio,{valueKey:'pace',suffix:'',minPad:.5,maxPad:.5}):'<p class="notice">Your jog/run pace graph will appear here after you log cardio sessions.</p>';

  const energy=dailyEnergySeries();
  document.getElementById('energyChart').innerHTML=energy.length?svgLineChart(energy,{valueKey:'energy',suffix:'',minPad:150,maxPad:150}):'<p class="notice">Your energy graph will appear after you log nutrition.</p>';

  const today=todayISO(),weekStart=mondayOf(today);
  const weekDays=Array.from({length:7},(_,i)=>plusDays(weekStart,i));
  const rows=weekDays.map(date=>{
    const n=totals(state.nutrition[date]?.foods||[]);
    if(!n.cal)return {date};
    return {date,...n,energy:energyForDate(date).balance};
  });
  const logged=rows.filter(x=>x.cal);
  const avg=logged.length?{
    cal:logged.reduce((s,x)=>s+x.cal,0)/logged.length,
    p:logged.reduce((s,x)=>s+x.p,0)/logged.length,
    c:logged.reduce((s,x)=>s+x.c,0)/logged.length,
    f:logged.reduce((s,x)=>s+x.f,0)/logged.length,
    energy:logged.reduce((s,x)=>s+x.energy,0)/logged.length
  }:null;
  document.getElementById('currentWeekSnapshot').innerHTML=`<div class="weekly-table">
    <div class="weekly-row weekly-head"><span>Day</span><span>Cal</span><span>P</span><span>C</span><span>F</span><span>Energy</span></div>
    ${rows.map(x=>`<div class="weekly-row"><span>${new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span><span>${x.cal?Math.round(x.cal):'—'}</span><span>${x.cal?Math.round(x.p):'—'}</span><span>${x.cal?Math.round(x.c):'—'}</span><span>${x.cal?Math.round(x.f):'—'}</span><span>${x.cal?signedKcal(x.energy):'—'}</span></div>`).join('')}
    <div class="weekly-row weekly-average"><span>Average</span><span>${avg?Math.round(avg.cal):'—'}</span><span>${avg?Math.round(avg.p):'—'}</span><span>${avg?Math.round(avg.c):'—'}</span><span>${avg?Math.round(avg.f):'—'}</span><span>${avg?signedKcal(avg.energy):'—'}</span></div>
  </div>`;

  const weeks=currentWeeklyMacroEnergy();
  const all=weeks.length?{
    cal:weeks.reduce((s,x)=>s+x.cal,0)/weeks.length,
    p:weeks.reduce((s,x)=>s+x.p,0)/weeks.length,
    c:weeks.reduce((s,x)=>s+x.c,0)/weeks.length,
    f:weeks.reduce((s,x)=>s+x.f,0)/weeks.length,
    energy:weeks.reduce((s,x)=>s+x.energy,0)/weeks.length
  }:null;
  document.getElementById('weeklyAverageHistory').innerHTML=weeks.length?`<div class="weekly-table weekly-history-table">
    <div class="weekly-row weekly-head"><span>Week</span><span>Cal</span><span>P</span><span>C</span><span>F</span><span>Energy</span></div>
    ${weeks.map(x=>`<div class="weekly-row"><span><b>${x.label}</b><small>${x.range} · ${x.days}d</small></span><span>${Math.round(x.cal)}</span><span>${Math.round(x.p)}</span><span>${Math.round(x.c)}</span><span>${Math.round(x.f)}</span><span>${signedKcal(x.energy)}</span></div>`).join('')}
    <div class="weekly-row weekly-average"><span>All weeks avg</span><span>${Math.round(all.cal)}</span><span>${Math.round(all.p)}</span><span>${Math.round(all.c)}</span><span>${Math.round(all.f)}</span><span>${signedKcal(all.energy)}</span></div>
  </div>`:'<p class="notice">Weekly averages will appear after you log nutrition.</p>';

  document.getElementById('weightHistory').innerHTML=entries.length?entries.slice(-10).reverse().map(([d,v])=>`<div class="weight-line"><span>${new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><b>${v.am?`AM ${v.am}`:'—'}</b><b>${v.pm?`PM ${v.pm}`:(v.post?`Post ${v.post}`:'—')}</b></div>`).join(''):'<p class="notice">Start entering morning and evening weights to build your current trend.</p>';
}

function downloadBackup(){
 const payload={app:'Workout App Panza',version:12,exportedAt:new Date().toISOString(),state};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`workout-app-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function restoreBackupFile(file){
 if(!file)return;const r=new FileReader();
 r.onload=()=>{try{const p=JSON.parse(r.result),incoming=p.state||p;if(!incoming||typeof incoming!=='object')throw 0;state={...base,...incoming};save();renderAll();alert('Backup restored.')}catch(e){alert('That backup file could not be restored.')}};r.readAsText(file);
}
function openNewUser(){document.getElementById('newUserModal').classList.add('open')}
function closeNewUser(){document.getElementById('newUserModal').classList.remove('open')}
async function createNewUser(){
 if(document.getElementById('resetConfirm').value.trim().toUpperCase()!=='RESET'){alert('Type RESET to confirm.');return}
 const name=document.getElementById('newName').value.trim()||'User',cal=+document.getElementById('newCalGoal').value||2500,p=+document.getElementById('newProteinGoal').value||180,c=+document.getElementById('newCarbGoal').value||250,f=+document.getElementById('newFatGoal').value||85,bmr=+document.getElementById('newBmr').value||1891,tdee=+document.getElementById('newTdee').value||2741,waterGoal=+document.getElementById('newWaterGoal').value||96,startWeight=+document.getElementById('newStartWeight').value||0;
 await photoDeleteAll();state=JSON.parse(JSON.stringify(base));state.profile={name};state.goals={cal,p,c,f};state.bmr=bmr;state.tdee=tdee;state.waterGoal=waterGoal;state.historicalEnabled=false;state.scheduleDate=todayISO();state.nextEventType='workout';if(startWeight)state.weights[todayISO()]={am:startWeight};
 save();closeNewUser();renderAll();showScreen('today');
}
function editActivity(i){
 const today=todayISO(),a=(state.activities[today]||[])[i];if(!a)return;
 document.getElementById('activityType').value=a.type||'Walk';setHrDefaultsForType();document.getElementById('activityDistance').value=a.distance||'';document.getElementById('activityMinutes').value=a.minutes||'';document.getElementById('activitySeconds').value=a.seconds||'';document.getElementById('activityCalories').value=a.calories||'';document.getElementById('activityAvgHr').value=a.avgHr||'';[1,2,3,4,5].forEach(z=>document.getElementById(`activityZ${z}`).value=a[`z${z}`]||'');
 state.activities[today].splice(i,1);save();renderActivities();renderEnergyBalance();
}

function bindPhotoInputs(){
  ['Front','Side','Back','Flex'].forEach(a=>{
    ['Camera','Library'].forEach(src=>{
      const input=document.getElementById('photo'+a+src);
      if(!input)return;
      input.onchange=()=>{
        const file=input.files&&input.files[0];
        if(file){
          const other=document.getElementById('photo'+a+(src==='Camera'?'Library':'Camera'));
          if(other)other.value='';
          const status=document.getElementById(a.toLowerCase()+'Status');
          if(status)status.textContent=src==='Camera'?'Photo taken ✓':'Existing photo selected ✓';
        }
      };
    });
  });
}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.screen===id));if(id==='workout')renderWorkout();if(id==='nutrition')renderNutrition();if(id==='history')renderHistory();if(id==='progress')renderProgress();if(id==='checklist')renderChecklist();if(id==='today')renderToday();window.scrollTo(0,0)}

async function resetForNewUser(){
  const ok=confirm('Reset this app for a new user? This permanently clears all saved workout, nutrition, weight, activity, checklist, water and progress-photo tracking data on this device.');
  if(!ok)return;
  try{
    localStorage.removeItem('mfState');
    localStorage.removeItem('mwState');
    if(typeof photoClear==='function'){
      try{await photoClear()}catch(e){}
    }
  }catch(e){}
  state=JSON.parse(JSON.stringify(base));
  state.photoDays={};
  save();
  calendarCursor=new Date();
  calendarCursor.setDate(1);
  activityEditIndex=null;
  workoutEditIndex=null;
  renderAll();
  alert('App reset complete. Ready for a new user.');
}

function renderAll(){renderToday();renderWorkout();renderNutrition();renderChecklist();renderHistory();renderProgress()}
function num(id){return parseFloat(document.getElementById(id).value)||0}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));document.getElementById('startBtn').addEventListener('click',()=>showScreen('workout'));
document.getElementById('ackRestBtn').addEventListener('click',acknowledgeRest);document.getElementById('finishBtn').addEventListener('click',openFinish);document.getElementById('closeFinish').addEventListener('click',closeFinish);document.getElementById('saveWorkoutBtn').addEventListener('click',saveWorkout);document.getElementById('skipTimer').addEventListener('click',stopTimer);document.getElementById('saveWeightBtn').addEventListener('click',saveWeights);document.getElementById('nutritionDate').addEventListener('change',renderNutrition);document.getElementById('addFoodBtn').addEventListener('click',addFood);document.getElementById('saveGoalsBtn').addEventListener('click',saveGoals);document.getElementById('prevMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderHistory()});document.getElementById('nextMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderHistory()});document.getElementById('activityType').addEventListener('change',setHrDefaultsForType);
document.getElementById('addActivityBtn').addEventListener('click',addActivity);
document.getElementById('waterMinusBtn').addEventListener('click',()=>changeWater(-8));
document.getElementById('waterPlusBtn').addEventListener('click',()=>changeWater(8));
document.getElementById('saveWaterGoalBtn').addEventListener('click',saveWaterGoal);
document.getElementById('addChecklistBtn').addEventListener('click',addChecklistItem);
document.getElementById('reorderChecklistBtn').addEventListener('click',toggleChecklistReorder);
document.getElementById('newChecklistItem').addEventListener('keydown',e=>{if(e.key==='Enter')addChecklistItem()});
document.getElementById('backupBtn').addEventListener('click',downloadBackup);
document.getElementById('restoreInput').addEventListener('change',e=>{restoreBackupFile(e.target.files[0]);e.target.value=''});
document.getElementById('newUserBtn').addEventListener('click',openNewUser);
document.getElementById('closeNewUserBtn').addEventListener('click',closeNewUser);
document.getElementById('confirmNewUserBtn').addEventListener('click',createNewUser);

document.getElementById('nutritionDate').value=todayISO();setHrDefaultsForType();renderAll();bindPhotoInputs();save();

setTimeout(bindPhotoInputs,0);

