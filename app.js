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
const defaultChecklistItems=[{"id":"am-brush-floss","text":"AM Brush & Floss"},{"id":"make-bed","text":"Make Bed"},{"id":"gum","text":"Gum"},{"id":"portuguese-1","text":"Portuguese #1"},{"id":"walk-dogs","text":"Walk Dogs"},{"id":"jog-run","text":"Jog/Run"},{"id":"pushups-1","text":"30 Push Ups #1"},{"id":"stretch","text":"Stretch"},{"id":"creatine-bcaas","text":"Creatine & BCAAs"},{"id":"coconut-oil-brush","text":"Gargle Coconut Oil & Brush"},{"id":"wash-face-guasha","text":"Wash Face & Guasha"},{"id":"fast-until-2","text":"Fast Until 2pm"},{"id":"portuguese-2","text":"Portuguese #2"},{"id":"pushups-2","text":"30 Push Ups #2"},{"id":"pm-brush-floss","text":"PM Brush & Floss"},{"id":"portuguese-3","text":"Portuguese #3"},{"id":"ab-roller","text":"10 Ab Roller"},{"id":"ab-twists","text":"30 Ab Twists"}];
const PUBLIC_STATE_KEY='mfPublicStateV1';
const base={phase:0,round:0,workout:0,completed:0,history:[],workoutLogs:{},weights:{},nutrition:{},goals:{cal:2500,p:180,c:250,f:85},goalHistory:{},drafts:{},water:{},waterGoal:96,checklistItems:JSON.parse(JSON.stringify(defaultChecklistItems)),checklistDays:{},activities:{},bmr:1891,tdee:2741,restDays:{},scheduleDate:null,nextEventType:'workout',profile:{name:'User'},historicalEnabled:false,photoSettings:{weekly:false},photoCheckins:[],photoDays:{}};
let state=JSON.parse(localStorage.getItem(PUBLIC_STATE_KEY)||'null')||JSON.parse(JSON.stringify(base));
state={...base,...state,goals:{...base.goals,...(state.goals||{})}};
if(!Array.isArray(state.history))state.history=[];
['workoutLogs','weights','nutrition','goalHistory','drafts','water','checklistDays','activities','restDays','photoDays'].forEach(k=>{
  if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={};
});
if(!Array.isArray(state.checklistItems))state.checklistItems=JSON.parse(JSON.stringify(defaultChecklistItems));
if(!Array.isArray(state.checklistItems)||state.checklistItems.length===0)state.checklistItems=JSON.parse(JSON.stringify(defaultChecklistItems));
let timerInterval=null,timerLeft=0,timerEndsAt=0,calendarCursor=new Date();calendarCursor.setDate(1),checklistReorderMode=false,activityEditIndex=null,workoutEditIndex=null,selectedLogDate=todayISO();
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

function logDate(){return selectedLogDate||todayISO();}
function formatLogDate(date){
  return new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
}
function setLogDate(date){
  if(!date)return;
  const today=todayISO();
  if(date>today)date=today;
  selectedLogDate=date;
  activityEditIndex=null;
  resetActivityEntryForm();
  renderDailyLogDate();
  renderDailyLogSections();
}
function changeLogDate(days){
  const next=plusDays(logDate(),days);
  if(next>todayISO())return;
  setLogDate(next);
}
function openLogDatePicker(){
  const picker=document.getElementById('logDatePicker');
  if(!picker)return;
  picker.value=logDate();
  picker.max=todayISO();
  picker.focus();
  if(typeof picker.showPicker==='function'){
    try{picker.showPicker();}catch(e){}
  }
}
function renderDailyLogDate(){
  const d=logDate(),today=todayISO();
  const label=document.getElementById('logDateBtn');
  const picker=document.getElementById('logDatePicker');
  const next=document.getElementById('logNextDay');
  const todayBtn=document.getElementById('logTodayBtn');
  if(label)label.textContent=d===today?'Today · '+formatLogDate(d):formatLogDate(d);
  if(picker){picker.value=d;picker.max=today;}
  if(next)next.disabled=d>=today;
  if(todayBtn)todayBtn.style.display=d===today?'none':'inline-flex';
}
function renderDailyLogSections(){
  renderLogWeights();
  renderTodayMacros();
  renderWater();
  renderActivities();
  renderEnergyBalance();
  renderPhotoTracker();
  renderChecklist();
  const nd=document.getElementById('nutritionDate');
  if(nd){
    nd.value=logDate();
    renderNutrition();
  }
}
function renderLogWeights(){
  const wt=state.weights[logDate()]||{};
  const am=document.getElementById('amWeight'),pm=document.getElementById('pmWeight'),hint=document.getElementById('weightHint');
  if(am)am.value=wt.am||'';
  if(pm)pm.value=wt.pm||'';
  if(hint)hint.textContent=wt.post?`Post-workout: ${wt.post} lb`:'';
}
function save(){
  try{
    localStorage.setItem(PUBLIC_STATE_KEY,JSON.stringify(state));
    return true;
  }catch(err){
    console.error('Could not save app state',err);
    return false;
  }
}

if(!state.goalHistory||typeof state.goalHistory!=='object'){
  state.goalHistory={};
}
if(Object.keys(state.goalHistory).length===0){
  const knownDates=[
    ...Object.keys(state.nutrition||{}),
    ...Object.keys(state.weights||{}),
    ...Object.keys(state.activities||{})
  ].sort();
  const seedDate=knownDates[0]||todayISO();
  state.goalHistory[seedDate]={...(state.goals||{cal:2500,p:180,c:250,f:85})};
  save();
}


const v28MistakenChecklistIds=new Set(["brush-am","floss-am","weight-am","walk-dogs","morning-jog","brush-pm","floss-pm"]);
if(Array.isArray(state.checklistItems)&&state.checklistItems.length===7&&state.checklistItems.every(x=>v28MistakenChecklistIds.has(x.id))){
  state.checklistItems=JSON.parse(JSON.stringify(defaultChecklistItems));
  save();
}

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
  let phaseCount=programOrdinal(pIndex,r,wIndex);

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
function getDraft(){
  state.drafts=state.drafts||{};
  const key=getDraftKey();
  const d=state.drafts[key];
  if(!d||typeof d!=='object')return {sets:{},warm:{},subs:{}};
  if(!d.sets||typeof d.sets!=='object')d.sets={};
  if(!d.warm||typeof d.warm!=='object')d.warm={};
  if(!d.subs||typeof d.subs!=='object')d.subs={};
  return d;
}

function photoDayState(date=logDate()){
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
  if(s)s.textContent=n?`${n} of 4 angles marked complete`:'No progress photos marked for this day';
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
  renderDailyLogDate();
  renderDailyLogSections();
  const activityTime=document.getElementById('activityTime');if(activityTime&&!activityTime.value)activityTime.value=currentTimeHHMM();
}
function renderTodayMacros(){const d=logDate(),n=state.nutrition[d]||{foods:[]};const t=totals(n.foods||[]),g=goalsForDate(d);document.getElementById('todayMacros').innerHTML=macroDials(t,g);if(document.getElementById('energyBalance'))renderEnergyBalance();}
function macroBoxes(t,g){return [['Calories',t.cal,g.cal],['Protein',t.p,g.p],['Carbs',t.c,g.c],['Fat',t.f,g.f]].map(([k,v,goal])=>`<div class="macro-box ${(+v>+goal)?'over-goal':''}"><strong>${Math.round(v)}</strong><span>${k}${k==='Calories'?'':' g'}</span><small>/ ${goal}</small></div>`).join('')}
function macroDial(label,value,goal){
  const v=+(value||0),g=+(goal||0),pct=g?Math.round(v/g*100):0;
  const capped=Math.max(0,Math.min(100,pct));
  const radius=44,circ=2*Math.PI*radius,offset=circ*(1-capped/100);
  return `<div class="macro-dial">
    <svg viewBox="0 0 110 110" role="img" aria-label="${label} ${Math.round(v)} of ${g}, ${pct}% of goal">
      <circle class="macro-dial-track" cx="55" cy="55" r="${radius}"></circle>
      <circle class="macro-dial-progress" cx="55" cy="55" r="${radius}" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
      <text x="55" y="50" text-anchor="middle" class="macro-dial-value">${Math.round(v)}</text>
      <text x="55" y="69" text-anchor="middle" class="macro-dial-percent">${pct}%</text>
    </svg>
    <b>${label}</b>
    <small>Goal ${g}${label==='Calories'?' kcal':' g'}</small>
  </div>`;
}
function macroDials(t,g){
  return [
    ['Calories',t.cal,g.cal],
    ['Protein',t.p,g.p],
    ['Carbs',t.c,g.c],
    ['Fat',t.f,g.f]
  ].map(([label,value,goal])=>macroDial(label,value,goal)).join('');
}
function saveWeights(){const d=logDate();state.weights[d]={...(state.weights[d]||{}),am:num('amWeight'),pm:num('pmWeight')};save();renderProgress();renderDailyLogSections();}

function renderWater(){
  const d=logDate(), amount=+(state.water[d]||0), goal=+(state.waterGoal||96);
  const pct=Math.min(100,goal?amount/goal*100:0);
  const amountEl=document.getElementById('waterAmount');
  const goalEl=document.getElementById('waterGoal');
  const bar=document.getElementById('waterProgress');
  if(amountEl)amountEl.textContent=`${amount} / ${goal} oz`;
  const dateLabel=document.getElementById('waterDateLabel');
  if(dateLabel)dateLabel.textContent=d===todayISO()?'today':formatLogDate(d);
  if(goalEl)goalEl.value=goal;
  if(bar)bar.style.width=`${pct}%`;
}
function changeWater(delta){
  const d=logDate();
  state.water[d]=Math.max(0,+(state.water[d]||0)+delta);
  save();renderWater();
}
function saveWaterGoal(){
  state.waterGoal=Math.max(1,num('waterGoal')||96);
  save();renderWater();
}
function checklistDay(){
  const d=logDate();
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
  document.getElementById('checklistDate').textContent=formatLogDate(logDate());
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




function parseWorkoutDuration(value){
  if(value===null||value===undefined||value==='')return 0;
  if(typeof value==='number')return value;
  const s=String(value).trim();
  if(/^\d+(\.\d+)?$/.test(s))return +s;
  const parts=s.split(':').map(Number);
  if(parts.length===3&&parts.every(Number.isFinite)){
    const [h,m,sec]=parts;
    return h*60+m+sec/60;
  }
  if(parts.length===2&&parts.every(Number.isFinite)){
    const [m,sec]=parts;
    return m+sec/60;
  }
  return 0;
}
function formatWorkoutDuration(value){
  if(value===null||value===undefined||value==='')return '';
  const raw=String(value).trim();

  // Legacy six-digit entries came from the old HHMMSS number field.
  if(/^\d{5,6}$/.test(raw)){
    const d=raw.padStart(6,'0');
    const h=+d.slice(0,2),m=+d.slice(2,4),s=+d.slice(4,6);
    const total=Math.max(0,h*3600+m*60+s);
    const hh=Math.floor(total/3600),mm=Math.floor((total%3600)/60),ss=total%60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  if(/^\d+:\d{1,2}:\d{1,2}$/.test(raw)){
    const [h,m,s]=raw.split(':').map(Number);
    const total=Math.max(0,h*3600+m*60+s);
    const hh=Math.floor(total/3600),mm=Math.floor((total%3600)/60),ss=total%60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  // Historical plain numbers were stored as workout minutes.
  if(/^\d+(\.\d+)?$/.test(raw)){
    const total=Math.max(0,Math.round((+raw)*60));
    const hh=Math.floor(total/3600),mm=Math.floor((total%3600)/60),ss=total%60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  return '';
}
function exerciseTotalsForDate(date){
  const workoutEntries=state.history.filter(h=>isoDate(h.date)===date);
  const workoutMinutes=workoutEntries.reduce((s,h)=>s+parseWorkoutDuration(h.summary?.duration),0);
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
    const ex=exerciseTotalsForDate(date);
    (weeks[key]||(weeks[key]=[])).push({date,...n,exerciseCalories:ex.calories||0,energy:e.balance});
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
    exerciseCalories:days.reduce((s,x)=>s+(x.exerciseCalories||0),0)/days.length,
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

function todaysExerciseTotals(){return exerciseTotalsForDate(logDate());}
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
  const date=logDate();
  const a=(state.activities[date]||[])[index];
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
  if(addBtn){
    addBtn.textContent='Save changes';
    addBtn.disabled=false;
    addBtn.type='button';
  }
}


function resetActivityEntryForm(){
  activityEditIndex=null;
  const addBtn=document.getElementById('addActivityBtn');
  if(addBtn){
    addBtn.textContent='+ Add activity';
    addBtn.disabled=false;
    addBtn.type='button';
  }
  const type=document.getElementById('activityType');
  if(type)type.value='Walk';
  ['activityDistance','activityMinutes','activitySeconds','activityCalories','activityAvgHr','activityZ1','activityZ2','activityZ3','activityZ4','activityZ5']
    .forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.value='';
    });
  const time=document.getElementById('activityTime');
  if(time)time.value=currentTimeHHMM();
  const details=document.getElementById('hrDetails');
  if(details){details.open=false;details.style.display='none';}
}
function renderActivities(){
  const date=logDate();
  const acts=state.activities[date]||[];
  const list=document.getElementById('activityList');
  const dateLabel=document.getElementById('activityDateLabel');
  if(dateLabel)dateLabel.textContent=`· ${formatLogDate(date)}`;
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
  }).join(''):'<p class="notice">No walks or jogs logged for this day.</p>';
  document.querySelectorAll('[data-activity-edit]').forEach(b=>b.addEventListener('click',()=>editActivity(+b.dataset.activityEdit)));
  document.querySelectorAll('[data-activity-delete]').forEach(b=>b.addEventListener('click',()=>{
    state.activities[date].splice(+b.dataset.activityDelete,1);
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
    avg.value='0';
    z.forEach(x=>x.value='0:00');
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
  const date=logDate();
  state.activities[date]=state.activities[date]||[];
  const entry={type,time,minutes,seconds,distance,calories,avgHr,...zones};
  const editIndex=activityEditIndex;
  if(editIndex!==null && state.activities[date][editIndex]){
    state.activities[date][editIndex]=entry;
  }else{
    state.activities[date].push(entry);
  }
  save();
  resetActivityEntryForm();
  renderActivities();
  renderEnergyBalance();
  const addBtn=document.getElementById('addActivityBtn');
  if(addBtn){
    addBtn.textContent=editIndex!==null?'Saved ✓':'Added ✓';
    setTimeout(()=>{
      if(activityEditIndex===null && addBtn) addBtn.textContent='+ Add activity';
    },700);
  }
}
function renderEnergyBalance(){
  const el=document.getElementById('energyBalance');
  if(!el)return;
  const e=energyForDate(logDate());
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


function latestExercise(name){
  for(const h of (state.history||[])){
    const sets=h?.sets?.[name];
    if(!Array.isArray(sets)||!sets.length)continue;
    const parts=sets.map(s=>{
      const w=String(s?.weight??'').trim();
      const r=String(s?.reps??'').trim();
      if(w&&r)return `${w}×${r}`;
      return w||r;
    }).filter(Boolean);
    if(parts.length)return parts.join(', ');
  }
  return '';
}
function storeDraft(draft){
  state.drafts=state.drafts||{};
  state.drafts[getDraftKey()]=draft;
  save();
}
function restSeconds(value){
  if(!value)return 0;
  const text=String(value).trim();
  if(/^\d+:\d{1,2}$/.test(text)){
    const [m,s]=text.split(':').map(Number);
    return (m*60)+s;
  }
  const n=Number(text);
  return Number.isFinite(n)?Math.round(n):0;
}
function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval=null;
  }
  timerLeft=0;
  timerEndsAt=0;
  sessionStorage.removeItem('mfRestTimerEndsAt');
  const timer=document.getElementById('timer');
  if(timer)timer.classList.remove('show');
}
function paintTimerFromClock(){
  if(!timerEndsAt)return;
  timerLeft=Math.max(0,Math.ceil((timerEndsAt-Date.now())/1000));
  const timer=document.getElementById('timer');
  const text=document.getElementById('timerText');
  if(timerLeft<=0){
    stopTimer();
    return;
  }
  const m=Math.floor(timerLeft/60);
  const s=timerLeft%60;
  if(text)text.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if(timer)timer.classList.add('show');
}
function runTimerInterval(){
  if(timerInterval)clearInterval(timerInterval);
  paintTimerFromClock();
  if(!timerEndsAt)return;
  timerInterval=setInterval(paintTimerFromClock,250);
}
function startTimer(rest){
  stopTimer();
  const seconds=restSeconds(rest);
  if(!seconds)return;
  timerEndsAt=Date.now()+(seconds*1000);
  sessionStorage.setItem('mfRestTimerEndsAt',String(timerEndsAt));
  runTimerInterval();
}
function restoreRestTimer(){
  const saved=Number(sessionStorage.getItem('mfRestTimerEndsAt')||0);
  if(!saved||saved<=Date.now()){
    sessionStorage.removeItem('mfRestTimerEndsAt');
    return;
  }
  timerEndsAt=saved;
  runTimerInterval();
}

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&timerEndsAt)runTimerInterval();
});
window.addEventListener('pageshow',()=>{
  if(timerEndsAt)runTimerInterval(); else restoreRestTimer();
});
window.addEventListener('focus',()=>{
  if(timerEndsAt)runTimerInterval();
});

function durationPickerValue(prefix){
  const h=document.getElementById(prefix+'DurationH')?.value||'00';
  const m=document.getElementById(prefix+'DurationM')?.value||'00';
  const s=document.getElementById(prefix+'DurationS')?.value||'00';
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function setDurationPicker(prefix,value){
  const formatted=formatWorkoutDuration(value)||'00:00:00';
  const [h='00',m='00',s='00']=formatted.split(':');
  const eh=document.getElementById(prefix+'DurationH');
  const em=document.getElementById(prefix+'DurationM');
  const es=document.getElementById(prefix+'DurationS');
  if(eh)eh.value=String(Math.min(23,Math.max(0,+h||0))).padStart(2,'0');
  if(em)em.value=String(Math.min(59,Math.max(0,+m||0))).padStart(2,'0');
  if(es)es.value=String(Math.min(59,Math.max(0,+s||0))).padStart(2,'0');
  const hidden=document.getElementById(prefix==='sum'?'sumDuration':'editWorkoutDuration');
  if(hidden)hidden.value=durationPickerValue(prefix);
}
function syncDurationPicker(prefix){
  const hidden=document.getElementById(prefix==='sum'?'sumDuration':'editWorkoutDuration');
  if(hidden)hidden.value=durationPickerValue(prefix);
}

function openFinish(){
  const modal=document.getElementById('finishModal');
  if(!modal)return;
  const time=document.getElementById('sumTime');
  if(time&&!time.value)time.value=currentTimeHHMM();
  setDurationPicker('sum',document.getElementById('sumDuration')?.value||'00:00:00');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}

function renderWorkout(){
  ensureScheduleState();
  const today=todayISO();
  const completedToday=state.history.some(h=>isoDate(h.date)===today);
  const isRestToday=state.nextEventType==='rest'&&state.scheduleDate===today;

  const phaseEl=document.getElementById('workoutPhase');
  const titleEl=document.getElementById('workoutTitle');
  const metaEl=document.getElementById('workoutMeta');
  const listEl=document.getElementById('exerciseList');
  const finishBtn=document.getElementById('finishBtn');

  if(isRestToday){
    if(phaseEl)phaseEl.textContent='Rest day';
    if(titleEl)titleEl.textContent='No workout scheduled today';
    if(metaEl)metaEl.textContent='Use the Home screen to acknowledge today’s rest day.';
    if(listEl)listEl.innerHTML='<p class="notice">Your next workout will appear here after the rest day is acknowledged.</p>';
    if(finishBtn)finishBtn.style.display='none';
    return;
  }

  if(completedToday){
    if(phaseEl)phaseEl.textContent='Workout complete';
    if(titleEl)titleEl.textContent='Today’s workout is finished';
    if(metaEl)metaEl.textContent='The next scheduled workout will become active on its scheduled day.';
    if(listEl)listEl.innerHTML='<p class="notice">Nothing else is scheduled for today.</p>';
    if(finishBtn)finishBtn.style.display='none';
    return;
  }

  if(finishBtn)finishBtn.style.display='';
  const p=phase(),w=current(),draft=getDraft();
  if(phaseEl)phaseEl.textContent=`${p.name} · R${state.round+1}`;
  if(titleEl)titleEl.textContent=w.name;
  if(metaEl)metaEl.textContent=`${w.ex.length} exercises · ${p.on} days on / 1 off`;
  const el=listEl;
  el.innerHTML=warmupHTML(workoutType(w.name));
  w.ex.forEach((x,i)=>{
    const [name,sets,rest,last]=x;
    const previous=latestExercise(name)||last||'—';
    let rows=sets.map((target,j)=>{
      const v=(draft.sets[i]||[])[j]||{};
      return `<div class="setrow"><div class="setnum">${j+1}</div><input data-e="${i}" data-s="${j}" data-k="weight" inputmode="decimal" placeholder="weight" value="${v.weight??''}"><input data-e="${i}" data-s="${j}" data-k="reps" inputmode="numeric" placeholder="reps · ${target}" value="${v.reps??''}"><button class="check ${v.done?'done':''}" data-e="${i}" data-s="${j}" data-rest="${rest}">✓</button></div>`;
    }).join('');
    const sub=(draft.subs||{})[i]||'';
    const isLower1Superset=(state.phase===0 && w.name==='Lower 1' && i>=w.ex.length-2);
    if(isLower1Superset && i===w.ex.length-2){
      el.insertAdjacentHTML('beforeend',`<div class="superset-callout">
        <div class="superset-label">SUPERSET – ALTERNATING EXERCISES</div>
        <div class="superset-note">Alternate between the two exercises for each set.</div>
      </div>`);
    }
    el.insertAdjacentHTML('beforeend',`<div class="exercise ${isLower1Superset?'superset-exercise':''}" data-exercise-index="${i}">
      <div class="exercise-title-row">
        <h3>${name}</h3>
        <label class="sub-toggle"><input type="checkbox" class="sub-check" data-sub-i="${i}" ${sub?'checked':''}><span>Sub?</span></label>
      </div>
      <div class="rx">${sets.length} set${sets.length>1?'s':''} · ${sets.join(' / ')}${rest?` · ${rest} rest`:''}</div>
      <div class="last">Last: ${previous}</div>
      <div class="sub-entry ${sub?'show':''}" data-sub-wrap="${i}">
        <label>Substitute movement<input class="sub-input" data-sub-input="${i}" type="text" placeholder="Type substitute movement" value="${esc(sub)}"></label>
      </div>
      ${rows}
    </div>`);
  });
  document.querySelectorAll('.warm-check').forEach((b,i)=>{
    if(draft.warm[i]){b.classList.add('done');b.closest('.warm-row').classList.add('done')}
    b.addEventListener('click',()=>{
      draft.warm[i]=!draft.warm[i];
      b.classList.toggle('done');
      b.closest('.warm-row').classList.toggle('done');
      storeDraft(draft);
    });
  });
  document.querySelectorAll('.sub-check').forEach(ch=>ch.addEventListener('change',()=>{
    const i=+ch.dataset.subI;
    draft.subs=draft.subs||{};
    const wrap=document.querySelector(`[data-sub-wrap="${i}"]`);
    const inp=document.querySelector(`[data-sub-input="${i}"]`);
    if(ch.checked){
      if(wrap)wrap.classList.add('show');
      setTimeout(()=>inp?.focus(),0);
    }else{
      delete draft.subs[i];
      if(wrap)wrap.classList.remove('show');
      if(inp)inp.value='';
    }
    storeDraft(draft);
  }));
  document.querySelectorAll('.sub-input').forEach(inp=>inp.addEventListener('input',()=>{
    const i=+inp.dataset.subInput;
    draft.subs=draft.subs||{};
    const value=inp.value.trim();
    if(value)draft.subs[i]=value; else delete draft.subs[i];
    storeDraft(draft);
  }));

  document.querySelectorAll('.setrow input').forEach(inp=>inp.addEventListener('input',()=>{
    const e=+inp.dataset.e,s=+inp.dataset.s;
    draft.sets[e]=draft.sets[e]||[];
    draft.sets[e][s]=draft.sets[e][s]||{};
    draft.sets[e][s][inp.dataset.k]=inp.value;
    storeDraft(draft);
  }));
  document.querySelectorAll('.check').forEach(b=>b.addEventListener('click',()=>{
    const e=+b.dataset.e,s=+b.dataset.s;
    draft.sets[e]=draft.sets[e]||[];
    draft.sets[e][s]=draft.sets[e][s]||{};
    draft.sets[e][s].done=!draft.sets[e][s].done;
    b.classList.toggle('done');
    storeDraft(draft);
    if(draft.sets[e][s].done&&b.dataset.rest)startTimer(b.dataset.rest);
  }));
}
function closeFinish(){document.getElementById('finishModal').classList.remove('show');document.getElementById('finishModal').setAttribute('aria-hidden','true')}
function saveWorkout(){
  ensureScheduleState();
  const w=current(),p=phase(),draft=getDraft(),sets={};
  w.ex.forEach((x,i)=>sets[x[0]]=(draft.sets[i]||[]).map(v=>({weight:v.weight||'',reps:v.reps||'',done:!!v.done})));
  const summary={duration:durationPickerValue('sum'),time:document.getElementById('sumTime')?.value||currentTimeHHMM(),totalCalories:num('sumTotalCal'),avgHr:num('sumAvgHr'),postWeight:num('sumWeight'),notes:document.getElementById('sumNotes').value.trim()};
  const date=new Date().toISOString(),completedPhaseIndex=state.phase;
  state.history.unshift({date,phase:p.name,phaseIndex:state.phase,round:state.round+1,workout:w.name,sets,substitutions:{...(draft.subs||{})},summary});
  if(summary.postWeight)state.weights[todayISO()]={...(state.weights[todayISO()]||{}),post:summary.postWeight};
  delete state.drafts[getDraftKey()];
  state.completed++;
  const completedCountFromProgramStart=programOrdinal(completedPhaseIndex,state.round,state.workout)+1;
  const restNext=completedCountFromProgramStart%(program[completedPhaseIndex]?.on||1)===0;
  advanceProgram();
  state.scheduleDate=plusDays(todayISO(),1);
  state.nextEventType=restNext?'rest':'workout';
  save();clearSummary();closeFinish();renderAll();showScreen('today');
}
function advanceProgram(){state.workout++;if(state.workout>=phase().workouts.length){state.workout=0;state.round++;if(state.round>=phase().rounds){state.round=0;state.phase++;if(state.phase>=program.length){state.phase=program.length-1;state.round=phase().rounds-1;state.workout=phase().workouts.length-1}}}}
function clearSummary(){
  ['sumTime','sumTotalCal','sumAvgHr','sumWeight','sumNotes'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  setDurationPicker('sum','00:00:00');
}

function goalsForDate(date){
  const baseGoals=state.goals||{cal:2500,p:180,c:250,f:85};
  const hist=state.goalHistory||{};
  const keys=Object.keys(hist).filter(d=>d<=date).sort();
  if(!keys.length)return {...baseGoals};
  return {...baseGoals,...hist[keys[keys.length-1]]};
}
function setGoalsFromDate(date,goals){
  state.goalHistory=state.goalHistory||{};
  state.goalHistory[date]={cal:+goals.cal||0,p:+goals.p||0,c:+goals.c||0,f:+goals.f||0};
  // Keep current/global goals aligned to the latest effective target.
  const latest=Object.keys(state.goalHistory).sort().at(-1);
  if(latest)state.goals={...state.goalHistory[latest]};
}
function renderNutrition(){const d=document.getElementById('nutritionDate').value||logDate();document.getElementById('nutritionDate').value=d;const g=goalsForDate(d);[['goalCal','cal'],['goalP','p'],['goalC','c'],['goalF','f']].forEach(([id,k])=>document.getElementById(id).value=g[k]);state.nutrition[d]=state.nutrition[d]||{foods:[]};const foods=state.nutrition[d].foods;document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);document.getElementById('foodList').innerHTML=foods.length?foods.map((f,i)=>foodRow(f,i)).join(''):'<p class="notice">No foods logged yet.</p>';document.querySelectorAll('.food-row input').forEach(inp=>inp.addEventListener('blur',foodChanged));document.querySelectorAll('.food-row button').forEach(b=>b.addEventListener('click',()=>{foods.splice(+b.dataset.i,1);save();renderNutrition();renderTodayMacros()}));}
function foodRow(f,i){return `<div class="food-row"><label class="food-name">Food<input data-i="${i}" data-k="name" value="${esc(f.name||'')}"></label><label>Wt(g)<input inputmode="decimal" data-i="${i}" data-k="weight" value="${f.weight||''}"></label><label>Cal<input inputmode="numeric" data-i="${i}" data-k="cal" value="${f.cal||''}"></label><label>P<input inputmode="decimal" data-i="${i}" data-k="p" value="${f.p||''}"></label><label>C<input inputmode="decimal" data-i="${i}" data-k="c" value="${f.c||''}"></label><label>F<input inputmode="decimal" data-i="${i}" data-k="f" value="${f.f||''}"></label><label>Time<input type="time" data-i="${i}" data-k="time" value="${f.time||''}"></label><button data-i="${i}">×</button></div>`}
function refreshNutritionTotals(d){const foods=(state.nutrition[d]?.foods)||[],g=goalsForDate(d);document.getElementById('macroTotals').innerHTML=macroBoxes(totals(foods),g);if(d===logDate()){renderTodayMacros();renderEnergyBalance();}}
function foodChanged(e){const d=document.getElementById('nutritionDate').value,foods=state.nutrition[d].foods,i=+e.target.dataset.i,k=e.target.dataset.k;foods[i][k]=(k==='name'||k==='time')?e.target.value:(parseFloat(e.target.value)||0);save();refreshNutritionTotals(d)}
function addFood(){const d=document.getElementById('nutritionDate')?.value||logDate();state.nutrition[d]=state.nutrition[d]||{foods:[]};state.nutrition[d].foods.push({name:'',weight:0,cal:0,p:0,c:0,f:0,time:currentTimeHHMM()});save();renderNutrition();renderTodayMacros();setTimeout(()=>{const inputs=document.querySelectorAll('.food-name input');inputs[inputs.length-1]?.focus()},0)}
function totals(foods){return foods.reduce((a,f)=>({cal:a.cal+(+f.cal||0),p:a.p+(+f.p||0),c:a.c+(+f.c||0),f:a.f+(+f.f||0)}),{cal:0,p:0,c:0,f:0})}
function saveGoals(){
  const d=document.getElementById('nutritionDate').value||logDate();
  const goals={cal:num('goalCal'),p:num('goalP'),c:num('goalC'),f:num('goalF')};
  setGoalsFromDate(d,goals);
  save();
  renderNutrition();
  renderTodayMacros();
  renderProgress();
  alert(`Daily targets saved from ${new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} forward.`);
}


function openWorkoutEditorByDate(date,workout,phase,round){
  const history=state.history||[];
  let index=history.findIndex(h=>
    isoDate(h.date)===date &&
    String(h.workout||'')===String(workout||'') &&
    String(h.phase||'')===String(phase||'') &&
    Number(h.round||0)===Number(round||0)
  );
  if(index<0){
    const sameDay=history.map((h,i)=>({h,i})).filter(x=>isoDate(x.h.date)===date);
    if(sameDay.length===1)index=sameDay[0].i;
    else{
      const sameWorkout=sameDay.find(x=>String(x.h.workout||'')===String(workout||''));
      if(sameWorkout)index=sameWorkout.i;
    }
  }
  if(index<0){
    alert('Could not find this completed workout. Please refresh and try again.');
    return;
  }
  openWorkoutEditor(index);
}

function openWorkoutEditor(index){
  const h=state.history[index];
  if(!h)return;
  workoutEditIndex=index;
  const s=h.summary||{};
  document.getElementById('editWorkoutName').textContent=`${h.workout} · ${h.phase} · Round ${h.round}`;
  const meta=document.getElementById('editWorkoutMeta');
  if(meta){
    const d=isoDate(h.date);
    meta.textContent=`${new Date(d+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'})}${workoutTime(h)?' · '+formatTime12(workoutTime(h)):''}`;
  }
  setDurationPicker('editWorkout',s.duration);
  document.getElementById('editWorkoutTime').value=workoutTime(h);
  document.getElementById('editWorkoutCalories').value=(s.totalCalories ?? s.activeCalories ?? '')||'';
  document.getElementById('editWorkoutAvgHr').value=s.avgHr||'';
  
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
        <button class="edit-set-done ${set.done?'is-done':''}" type="button" aria-pressed="${set.done?'true':'false'}" onclick="toggleEditSetDone(this)">${set.done?'✓':''}</button>
      </div>`).join('')}
    </div>`;
  }).join(''):'<p class="notice">No saved set details for this workout.</p>';

  const modal=document.getElementById('editWorkoutModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
function toggleEditSetDone(btn){
  const done=btn.getAttribute('aria-pressed')!=='true';
  btn.setAttribute('aria-pressed',done?'true':'false');
  btn.classList.toggle('is-done',done);
  btn.textContent=done?'✓':'';
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
    duration:durationPickerValue('editWorkout'),
    time:document.getElementById('editWorkoutTime')?.value||workoutTime(h),
    totalCalories:num('editWorkoutCalories'),
    avgHr:num('editWorkoutAvgHr'),
    
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
      done:row.querySelector('.edit-set-done')?.getAttribute('aria-pressed')==='true'
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
  const acts=state.activities[date]||[];
  const walks=acts.filter(a=>String(a.type||'').toLowerCase()==='walk');
  const runs=acts.filter(a=>['jog','run','run/jog','jog/run'].includes(String(a.type||'').toLowerCase()));
  const otherActs=acts.filter(a=>!walks.includes(a)&&!runs.includes(a));
  let parts=`<div class="eyebrow">${new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>`;

  if(state.restDays[date])parts+=`<div class="day-detail-row"><b>Rest day complete</b><small>Acknowledged</small></div>`;

  // 1 Nutrition
  if(nut){
    const t=totals(nut.foods||[]);
    parts+=`<div class="day-detail-row"><b><span class="history-icon">🍴</span>Nutrition</b><small>${Math.round(t.cal)} kcal · ${Math.round(t.p)} P · ${Math.round(t.c)} C · ${Math.round(t.f)} F</small></div>`;
  }

  // 2 Energy
  if(totals((state.nutrition[date]?.foods)||[]).cal>0){
    const e=energyForDate(date);
    const label=e.balance<0?'Estimated deficit':e.balance>0?'Estimated surplus':'Estimated balance';
    parts+=`<div class="day-detail-row energy-history-row"><b><span class="history-icon">⚡</span>Energy result</b><small>${label}: ${Math.abs(Math.round(e.balance))} kcal · ${Math.round(e.intake)} intake · ${Math.round(e.totalBurn)} estimated burn</small></div>`;
  }

  // 3 Checklist
  const cd=state.checklistDays[date];
  if(cd){const items=state.checklistItems||[],done=items.filter(x=>cd[x.id]).length;parts+=`<div class="day-detail-row"><b><span class="history-icon">☑</span>Checklist</b><small>${done} of ${items.length} complete</small></div>`}

  // 4 Weight
  if(wt)parts+=`<div class="day-detail-row"><b><span class="history-icon">⚖</span>Weight</b><small>${wt.am?`AM ${wt.am} lb · `:''}${wt.post?`Post ${wt.post} lb · `:''}${wt.pm?`PM ${wt.pm} lb`:''}</small></div>`;

  // 5 Water
  const water=state.water[date];if(water)parts+=`<div class="day-detail-row"><b><span class="history-icon">💧</span>Water</b><small>${water} oz</small></div>`;

  // 6 Walks
  walks.forEach(a=>parts+=`<div class="day-detail-row"><b>${a.time?formatTime12(a.time)+' · ':''}🚶 Walk</b><small>${a.distance?`${a.distance} mi · `:''}${Math.round((+a.minutes||0)+((+a.seconds||0)/60))} min${a.calories?` · ${a.calories} kcal`:''}</small></div>`);

  // 7 Jog/Run
  runs.forEach(a=>parts+=`<div class="day-detail-row"><b>${a.time?formatTime12(a.time)+' · ':''}🏃 ${esc(a.type||'Jog/Run')}</b><small>${a.distance?`${a.distance} mi · `:''}${Math.round((+a.minutes||0)+((+a.seconds||0)/60))} min${a.calories?` · ${a.calories} kcal`:''}</small></div>`);
  otherActs.forEach(a=>parts+=`<div class="day-detail-row"><b>${a.time?formatTime12(a.time)+' · ':''}${esc(a.type||'Cardio')}</b><small>${a.distance?`${a.distance} mi · `:''}${Math.round((+a.minutes||0)+((+a.seconds||0)/60))} min${a.calories?` · ${a.calories} kcal`:''}</small></div>`);

  // 8 Workout
  if(hs.length)hs.forEach(h=>{
    const s=h.summary||{},kcal=(s.totalCalories ?? s.activeCalories ?? 0);
    const safeWorkout=String(h.workout||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const safePhase=String(h.phase||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const durationText=s.duration?formatWorkoutDuration(s.duration):'';
    parts+=`<div class="day-detail-row workout-history-detail workout-history-tappable" onclick="openWorkoutEditorByDate('${date}','${safeWorkout}','${safePhase}',${Number(h.round||0)})">
      <div class="workout-history-main">
        <b><span class="history-icon">🏋</span>${esc(h.workout)} · ${esc(h.phase)} · Round ${h.round}</b>
        <small>${workoutTime(h)?`${formatTime12(workoutTime(h))}`:''}${kcal?`${workoutTime(h)?' · ':''}${kcal} kcal`:''}${durationText?`${(workoutTime(h)||kcal)?' · ':''}${durationText}`:''}${s.avgHr?` · ${s.avgHr} avg HR`:''}${s.postWeight?` · ${s.postWeight} lb post`:''}</small>
        ${h.substitutions&&Object.keys(h.substitutions).length?`<small class="history-notes">${Object.entries(h.substitutions).map(([i,v])=>{
          const original=program[h.phaseIndex]?.workouts?.find(w=>w.name===h.workout)?.ex?.[+i]?.[0]||`Exercise ${+i+1}`;
          return `${esc(original)} → Sub: ${esc(v)}`;
        }).join(' · ')}</small>`:''}
        ${s.notes?`<small class="history-notes">${esc(s.notes)}</small>`:''}
      </div>
      <button class="ghost compact edit-workout-history-btn" type="button" aria-label="Edit workout" onclick="event.stopPropagation();openWorkoutEditorByDate('${date}','${safeWorkout}','${safePhase}',${Number(h.round||0)})">Edit</button>
    </div>`;
  });

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
  const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(+p[valueKey])}" r="5" class="chart-dot"><title>${esc(p[labelKey])}: ${p[valueKey]}${suffix}${p.distance?` · ${p.distance} mi`:''}${p.z3Seconds?` · Z3 ${fmtDuration(p.z3Seconds)}`:''}${p.totalSeconds?` · ${fmtDuration(p.totalSeconds)} total`:''}${p.session?` · ${esc(p.session)}`:''}</title></circle>`).join('');
  const pointValues=points.length<=8
    ? points.map((p,i)=>{
        const raw=+p[valueKey];
        const text=Number.isFinite(raw)
          ? `${Number.isInteger(raw)?raw:raw.toFixed(1)}${suffix}`
          : '';
        if(!text)return '';
        const yy=Math.max(12,y(raw)-10);
        return `<text x="${x(i)}" y="${yy}" text-anchor="middle" class="chart-point-value">${esc(text)}</text>`;
      }).join('')
    : points.map((p,i)=>{
        const show=i===0||i===points.length-1||i%Math.ceil(points.length/6)===0;
        if(!show)return '';
        const raw=+p[valueKey],text=Number.isFinite(raw)?`${Number.isInteger(raw)?raw:raw.toFixed(1)}${suffix}`:'';
        const yy=Math.max(12,y(raw)-10);
        return text?`<text x="${x(i)}" y="${yy}" text-anchor="middle" class="chart-point-value">${esc(text)}</text>`:'';
      }).join('');

  return `<svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img">${grid}<path d="${path}" class="chart-line"/>${dots}${pointValues}${labels}</svg>`;
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


function weeklyCardioMiles(){
  const byWeek={};
  Object.entries(state.activities||{}).forEach(([date,acts])=>{
    const week=mondayOf(date);
    byWeek[week]=byWeek[week]||{walk:0,run:0};
    (acts||[]).forEach(a=>{
      const miles=+a.distance||0;
      if(!miles)return;
      if((a.type||'').toLowerCase()==='walk')byWeek[week].walk+=miles;
      else if(['jog','run'].includes((a.type||'').toLowerCase()))byWeek[week].run+=miles;
    });
  });
  return Object.entries(byWeek).sort((a,b)=>a[0].localeCompare(b[0])).map(([date,v])=>({
    date,
    label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),
    walk:+v.walk.toFixed(2),
    run:+v.run.toFixed(2)
  }));
}


function programOrdinal(phaseIndex,roundIndex,workoutIndex){
  const p=program?.[phaseIndex];
  if(!p)return 0;
  return (Math.max(0,+roundIndex||0)*(p.workouts?.length||0))+Math.max(0,+workoutIndex||0);
}
function refreshProgramStartOptions(){
  const phaseSel=document.getElementById('programStartPhase');
  const roundSel=document.getElementById('programStartRound');
  const workoutSel=document.getElementById('programStartWorkout');
  if(!phaseSel||!roundSel||!workoutSel||!Array.isArray(program))return;

  if(!phaseSel.options.length){
    phaseSel.innerHTML=program.map((p,i)=>`<option value="${i}">Phase ${i+1} · ${esc(p.name||`Phase ${i+1}`)}</option>`).join('');
  }

  const pi=Math.min(program.length-1,Math.max(0,+phaseSel.value||0));
  const p=program[pi];
  const previousRound=roundSel.value;
  const previousWorkout=workoutSel.value;

  roundSel.innerHTML=Array.from({length:Math.max(1,+p.rounds||1)},(_,i)=>`<option value="${i}">Round ${i+1}</option>`).join('');
  workoutSel.innerHTML=(p.workouts||[]).map((w,i)=>`<option value="${i}">${esc(w.name||`Workout ${i+1}`)}</option>`).join('');

  if(previousRound!=='' && +previousRound < roundSel.options.length)roundSel.value=previousRound;
  if(previousWorkout!=='' && +previousWorkout < workoutSel.options.length)workoutSel.value=previousWorkout;
}
function renderProgramStartControls(){
  const phaseSel=document.getElementById('programStartPhase');
  const roundSel=document.getElementById('programStartRound');
  const workoutSel=document.getElementById('programStartWorkout');
  const currentEl=document.getElementById('programStartCurrent');
  if(!phaseSel||!roundSel||!workoutSel)return;

  refreshProgramStartOptions();
  phaseSel.value=String(Math.max(0,state.phase||0));
  refreshProgramStartOptions();
  roundSel.value=String(Math.max(0,state.round||0));
  workoutSel.value=String(Math.max(0,state.workout||0));

  const p=program?.[state.phase],w=p?.workouts?.[state.workout];
  if(currentEl&&p&&w){
    currentEl.textContent=`Current starting position: ${p.name} · Round ${state.round+1} · ${w.name}`;
  }
}
function applyProgramStartingPoint(){
  const pi=+document.getElementById('programStartPhase')?.value;
  const ri=+document.getElementById('programStartRound')?.value;
  const wi=+document.getElementById('programStartWorkout')?.value;
  const p=program?.[pi],w=p?.workouts?.[wi];
  if(!p||!w)return;

  const round=Math.min(Math.max(0,ri||0),Math.max(0,(+p.rounds||1)-1));
  const workout=Math.min(Math.max(0,wi||0),Math.max(0,(p.workouts||[]).length-1));
  const label=`${p.name} · Round ${round+1} · ${w.name}`;
  if(!confirm(`Start the program from ${label}? Your existing history and tracking data will be kept.`))return;

  stopTimer();
  state.phase=pi;
  state.round=round;
  state.workout=workout;
  state.scheduleDate=todayISO();
  state.nextEventType='workout';
  state.drafts={};
  save();
  renderAll();
  renderProgramStartControls();
  alert(`Program starting point updated to ${label}.`);
}

function showMoreSection(section){
  const progress=document.getElementById('moreProgressSection');
  const workouts=document.getElementById('moreWorkoutsSection');
  const pTab=document.getElementById('moreProgressTab');
  const wTab=document.getElementById('moreWorkoutsTab');
  const isWorkouts=section==='workouts';
  if(progress)progress.style.display=isWorkouts?'none':'block';
  if(workouts)workouts.style.display=isWorkouts?'block':'none';
  if(pTab)pTab.classList.toggle('on',!isWorkouts);
  if(wTab)wTab.classList.toggle('on',isWorkouts);
  if(isWorkouts){renderProgramStartControls();renderProgramWorkoutLibrary();}
}

function workoutExerciseList(workout){
  const exercises=workout?.ex||[];
  if(!exercises.length)return '<p class="notice">No exercises listed for this workout.</p>';
  return exercises.map((ex,i)=>{
    const [name,targets,rest,last]=ex;
    const sets=Array.isArray(targets)?targets:[];
    return `<div class="program-exercise-row">
      <div class="program-exercise-name">
        <b>${esc(name||`Exercise ${i+1}`)}</b>
        <small>${sets.length} set${sets.length===1?'':'s'} · ${sets.map(esc).join(' / ')}${rest?` · ${esc(rest)} rest`:''}</small>
        ${last?`<small class="program-last">Last: ${esc(last)}</small>`:''}
      </div>
    </div>`;
  }).join('');
}

function renderProgramWorkoutLibrary(){
  const box=document.getElementById('programWorkoutLibrary');
  if(!box)return;
  if(!Array.isArray(program)||!program.length){
    box.innerHTML='<div class="card"><p class="notice">No program data found.</p></div>';
    return;
  }
  box.innerHTML=program.map((phase,pi)=>{
    const workouts=phase.workouts||[];
    return `<div class="card program-phase-card">
      <div class="eyebrow">Phase ${pi+1}</div>
      <h3>${esc(phase.name||`Phase ${pi+1}`)}</h3>
      <div class="program-workout-list">
        ${workouts.map((w,wi)=>`<button class="program-workout-row" type="button" onclick="openProgramWorkoutPreview(${pi},${wi})">
          <div>
            <b>${esc(w.name||`Workout ${wi+1}`)}</b>
            <small>${(w.ex||[]).length} exercises</small>
          </div>
          <span>View ›</span>
        </button>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function openProgramWorkoutPreview(phaseIndex,workoutIndex){
  const phase=program?.[phaseIndex];
  const workout=phase?.workouts?.[workoutIndex];
  if(!workout)return;

  document.getElementById('programWorkoutTitle').textContent=workout.name||`Workout ${workoutIndex+1}`;
  document.getElementById('programWorkoutMeta').textContent=`${phase?.name||`Phase ${phaseIndex+1}`} · ${(workout.ex||[]).length} exercises`;

  const warm=workoutType(workout.name)==='lower'?lowerWarmup:upperWarmup;
  const warmRows=`<div class="program-preview-section">
    <div class="eyebrow">Warm-up</div>
    ${warm.map(x=>`<div class="program-warm-row"><b>${esc(x[0])}</b><small>${esc(x[1])}${x[2]?` · ${esc(x[2])}`:''}</small></div>`).join('')}
  </div>`;

  document.getElementById('programWorkoutPreview').innerHTML=
    `${warmRows}<div class="program-preview-section"><div class="eyebrow">Exercises</div>${workoutExerciseList(workout)}</div>`;

  const modal=document.getElementById('programWorkoutModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}

function closeProgramWorkoutPreview(){
  const modal=document.getElementById('programWorkoutModal');
  if(!modal)return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}


function parseClockSeconds(value){
  if(value===null||value===undefined||value==='')return 0;
  const s=String(value).trim();
  if(!s)return 0;
  const parts=s.split(':').map(Number);
  if(parts.length===2&&parts.every(Number.isFinite))return parts[0]*60+parts[1];
  if(parts.length===3&&parts.every(Number.isFinite))return parts[0]*3600+parts[1]*60+parts[2];
  const n=Number(s);
  return Number.isFinite(n)?n:0;
}
function cardioWeekSummary(weekStart){
  const dates=Array.from({length:7},(_,i)=>plusDays(weekStart,i));
  let walk=0,run=0;
  dates.forEach(date=>(state.activities[date]||[]).forEach(a=>{
    const d=+a.distance||0;
    const type=String(a.type||'').toLowerCase();
    if(type==='walk')walk+=d;
    else if(type==='jog'||type==='run')run+=d;
  }));
  return {walk,run,total:walk+run};
}
function renderCardioSummary(){
  const box=document.getElementById('cardioSummary');
  if(!box)return;
  const thisStart=mondayOf(todayISO()),lastStart=plusDays(thisStart,-7);
  const current=cardioWeekSummary(thisStart),last=cardioWeekSummary(lastStart);

  // All-time weekly average: include only weeks that actually contain recorded cardio.
  const cardioDates=Object.entries(state.activities||{})
    .filter(([,acts])=>(acts||[]).some(a=>{
      const type=String(a.type||'').toLowerCase();
      return (type==='walk'||type==='jog'||type==='run') && (+a.distance||0)>0;
    }))
    .map(([date])=>date);

  const weekStarts=[...new Set(cardioDates.map(mondayOf))].sort();
  const weeks=weekStarts.map(cardioWeekSummary).filter(w=>w.total>0);
  const avg=weeks.length
    ? weeks.reduce((sum,w)=>({
        walk:sum.walk+w.walk,
        run:sum.run+w.run,
        total:sum.total+w.total
      }),{walk:0,run:0,total:0})
    : {walk:0,run:0,total:0};

  if(weeks.length){
    avg.walk/=weeks.length;
    avg.run/=weeks.length;
    avg.total/=weeks.length;
  }

  const block=(label,x)=>`<div class="cardio-summary-col">
    <small>${label}</small>
    <strong>${x.total.toFixed(2)} mi</strong>
    <span>${x.walk.toFixed(2)} walk · ${x.run.toFixed(2)} run/jog</span>
  </div>`;

  box.innerHTML=`<div class="cardio-summary-grid cardio-summary-grid-3">
    ${block('This Week',current)}
    ${block('Last Week',last)}
    ${block('Weekly Avg',avg)}
  </div>
  <p class="tiny cardio-average-note">Average includes every week with recorded cardio.</p>`;
}
function zone3RunSeries(){
  const rows=[];
  Object.entries(state.activities||{}).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([date,acts])=>{
    acts.forEach(a=>{
      const type=String(a.type||'').toLowerCase();
      if(type!=='jog'&&type!=='run')return;
      const total=activitySeconds(a),z3=parseClockSeconds(a.z3);
      if(total<=0||z3<=0)return;
      rows.push({
        date,
        label:new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),
        pct:+((z3/total)*100).toFixed(1),
        distance:+a.distance||0,
        totalSeconds:total,
        z3Seconds:z3
      });
    });
  });
  return rows;
}
function renderZone3Chart(){
  const box=document.getElementById('zone3Chart');
  if(!box)return;
  const rows=zone3RunSeries();
  box.innerHTML=rows.length
    ? svgLineChart(rows,{valueKey:'pct',suffix:'%',minPad:5,maxPad:5})
    : '<p class="notice">Add Jog/Run heart-rate zone data to build this trend.</p>';
}

function renderHistoricalProgressVisibility(){
  const enabled=state.historicalEnabled!==false;
  const checkpoint=document.getElementById('historicalCheckpointCard');
  const sessions=document.getElementById('historicalSessionsCard');
  if(checkpoint)checkpoint.style.display=enabled?'':'none';
  if(sessions)sessions.style.display=enabled?'':'none';

  const weightNote=document.getElementById('weightChartNote');
  if(weightNote)weightNote.textContent=enabled
    ? 'Historical weekly AM averages + DEXA checkpoint + new AM weights logged in the app.'
    : 'Morning weights logged in this app will build your weight trend.';

  const calNote=document.getElementById('calorieChartNote');
  if(calNote)calNote.textContent=enabled
    ? 'Session 1 selected weekly averages, Brazil weeks 1–10, and future weekly averages from your app.'
    : 'Weekly calorie averages from nutrition logged in this app.';
}

function renderProgress(){
  renderHistoricalProgressVisibility();
  const entries=Object.entries(state.weights).filter(([,v])=>v.am||v.pm).sort((a,b)=>a[0].localeCompare(b[0]));
  const ams=entries.filter(([,v])=>v.am).map(([d,v])=>({d,v:+v.am}));
  const latest=ams.at(-1),last7=ams.slice(-7);
  document.getElementById('latestWeight').textContent=latest?`${latest.v.toFixed(1)} lb`:'—';
  document.getElementById('avg7Weight').textContent=last7.length?`${(last7.reduce((s,x)=>s+x.v,0)/last7.length).toFixed(1)} lb`:'—';
  const swings=entries.filter(([,v])=>v.am&&v.pm).map(([,v])=>+v.pm-+v.am);
  document.getElementById('dailySwing').textContent=swings.length?`${(swings.reduce((a,b)=>a+b,0)/swings.length).toFixed(1)} lb`:'—';

  const allWeights=[...(state.historicalEnabled===false?[]:historicalWeight),...currentWeightSeries()].sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById('weightChart').innerHTML=allWeights.length
    ? svgLineChart(allWeights,{valueKey:'weight',suffix:'',minPad:2,maxPad:2})
    : '<p class="notice">Log morning weights to build your weight trend.</p>';
  const histNut=[...(state.historicalEnabled===false?[]:historicalCalories),...currentWeeklyNutrition()].sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById('calorieChart').innerHTML=histNut.length
    ? svgLineChart(histNut,{valueKey:'cal',minPad:150,maxPad:150})
    : '<p class="notice">Log nutrition to build weekly calorie history.</p>';
  document.getElementById('proteinChart').innerHTML=histNut.length
    ? svgLineChart(histNut,{valueKey:'protein',suffix:'g',minPad:10,maxPad:10})
    : '<p class="notice">Log nutrition to build weekly protein history.</p>';

  const cardio=weeklyCardioMiles();
  const cardioEl=document.getElementById('cardioChart');
  if(cardioEl){
    if(!cardio.length){
      cardioEl.innerHTML='<p class="notice">Add walks, jogs or runs to build weekly mileage.</p>';
    }else{
      const max=Math.max(1,...cardio.flatMap(x=>[x.walk,x.run]));
      const chartMax=max*1.2;
      cardioEl.innerHTML=`<div class="weekly-cardio-chart">
        ${cardio.map(x=>`<div class="weekly-cardio-group">
          <div class="weekly-cardio-bars">
            <div class="weekly-cardio-bar walk" style="height:${(x.walk/chartMax)*100}%"><span>${x.walk||''}</span></div>
            <div class="weekly-cardio-bar run" style="height:${(x.run/chartMax)*100}%"><span>${x.run||''}</span></div>
          </div>
          <small>${x.label}</small>
        </div>`).join('')}
      </div>
      <div class="weekly-cardio-legend"><span>Walk</span><span>Run/Jog</span></div>`;
    }
  }

  renderCardioSummary();
  renderZone3Chart();

  const energy=dailyEnergySeries();
  document.getElementById('energyChart').innerHTML=energy.length?svgLineChart(energy,{valueKey:'energy',suffix:'',minPad:150,maxPad:150}):'<p class="notice">Your energy graph will appear after you log nutrition.</p>';

  const today=todayISO(),weekStart=mondayOf(today);
  const weekDays=Array.from({length:7},(_,i)=>plusDays(weekStart,i));
  const rows=weekDays.map(date=>{
    const n=totals(state.nutrition[date]?.foods||[]);
    const ex=exerciseTotalsForDate(date);
    if(!n.cal)return {date,exerciseCalories:ex.calories||0};
    return {date,...n,exerciseCalories:ex.calories||0,energy:energyForDate(date).balance};
  });
  const logged=rows.filter(x=>x.cal);
  const avg=logged.length?{
    cal:logged.reduce((s,x)=>s+x.cal,0)/logged.length,
    p:logged.reduce((s,x)=>s+x.p,0)/logged.length,
    c:logged.reduce((s,x)=>s+x.c,0)/logged.length,
    f:logged.reduce((s,x)=>s+x.f,0)/logged.length,
    exerciseCalories:logged.reduce((s,x)=>s+(x.exerciseCalories||0),0)/logged.length,
    energy:logged.reduce((s,x)=>s+x.energy,0)/logged.length
  }:null;
  document.getElementById('currentWeekSnapshot').innerHTML=`<div class="weekly-table current-week-table compact-macro-table">
    <div class="weekly-row weekly-head"><span>Day</span><span>Cal</span><span>P</span><span>C</span><span>F</span><span>Ex Cal</span><span>Energy</span></div>
    ${rows.map(x=>`<div class="weekly-row"><span>${new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})} (${new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{month:'numeric',day:'numeric'})})</span><span>${x.cal?Math.round(x.cal):'—'}</span><span>${x.cal?Math.round(x.p):'—'}</span><span>${x.cal?Math.round(x.c):'—'}</span><span>${x.cal?Math.round(x.f):'—'}</span><span>${Math.round(x.exerciseCalories||0)}</span><span>${x.cal?signedKcal(x.energy):'—'}</span></div>`).join('')}
    <div class="weekly-row weekly-average"><span>Average</span><span>${avg?Math.round(avg.cal):'—'}</span><span>${avg?Math.round(avg.p):'—'}</span><span>${avg?Math.round(avg.c):'—'}</span><span>${avg?Math.round(avg.f):'—'}</span><span>${avg?Math.round(avg.exerciseCalories):'—'}</span><span>${avg?signedKcal(avg.energy):'—'}</span></div>
  </div>`;

  const weeks=currentWeeklyMacroEnergy();
  const all=weeks.length?{
    cal:weeks.reduce((s,x)=>s+x.cal,0)/weeks.length,
    p:weeks.reduce((s,x)=>s+x.p,0)/weeks.length,
    c:weeks.reduce((s,x)=>s+x.c,0)/weeks.length,
    f:weeks.reduce((s,x)=>s+x.f,0)/weeks.length,
    exerciseCalories:weeks.reduce((s,x)=>s+(x.exerciseCalories||0),0)/weeks.length,
    energy:weeks.reduce((s,x)=>s+x.energy,0)/weeks.length
  }:null;
  document.getElementById('weeklyAverageHistory').innerHTML=weeks.length?`<div class="weekly-table weekly-history-table history-exercise-table compact-macro-table">
    <div class="weekly-row weekly-head"><span>Week</span><span>Cal</span><span>P</span><span>C</span><span>F</span><span>Ex Cal</span><span>Energy</span></div>
    ${weeks.map(x=>`<div class="weekly-row"><span><b>${x.label}</b><small>${x.range} · ${x.days}d</small></span><span>${Math.round(x.cal)}</span><span>${Math.round(x.p)}</span><span>${Math.round(x.c)}</span><span>${Math.round(x.f)}</span><span>${Math.round(x.exerciseCalories||0)}</span><span>${signedKcal(x.energy)}</span></div>`).join('')}
    <div class="weekly-row weekly-average"><span>All weeks avg</span><span>${Math.round(all.cal)}</span><span>${Math.round(all.p)}</span><span>${Math.round(all.c)}</span><span>${Math.round(all.f)}</span><span>${Math.round(all.exerciseCalories||0)}</span><span>${signedKcal(all.energy)}</span></div>
  </div>`:'<p class="notice">Weekly averages will appear after you log nutrition.</p>';

  const dailyRows=Object.keys(state.nutrition).sort().map(date=>{
    const n=totals(state.nutrition[date]?.foods||[]);
    if(!n.cal)return null;
    const ex=exerciseTotalsForDate(date);
    return {date,...n,exerciseCalories:ex.calories||0,energy:energyForDate(date).balance};
  }).filter(Boolean);
  const dailyAvg=dailyRows.length?{
    cal:dailyRows.reduce((s,x)=>s+x.cal,0)/dailyRows.length,
    p:dailyRows.reduce((s,x)=>s+x.p,0)/dailyRows.length,
    c:dailyRows.reduce((s,x)=>s+x.c,0)/dailyRows.length,
    f:dailyRows.reduce((s,x)=>s+x.f,0)/dailyRows.length,
    exerciseCalories:dailyRows.reduce((s,x)=>s+(x.exerciseCalories||0),0)/dailyRows.length,
    energy:dailyRows.reduce((s,x)=>s+x.energy,0)/dailyRows.length
  }:null;
  document.getElementById('dailyMacroEnergyHistory').innerHTML=dailyRows.length?`<div class="weekly-table daily-history-table history-exercise-table compact-macro-table">
    <div class="weekly-row weekly-head"><span>Date</span><span>Cal</span><span>P</span><span>C</span><span>F</span><span>Ex Cal</span><span>Energy</span></div>
    ${dailyRows.map(x=>`<div class="weekly-row"><span><b>${new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</b><small>${new Date(x.date+'T12:00:00').toLocaleDateString(undefined,{month:'numeric',day:'numeric',year:'2-digit'})}</small></span><span>${Math.round(x.cal)}</span><span>${Math.round(x.p)}</span><span>${Math.round(x.c)}</span><span>${Math.round(x.f)}</span><span>${Math.round(x.exerciseCalories||0)}</span><span>${signedKcal(x.energy)}</span></div>`).join('')}
    <div class="weekly-row weekly-average"><span>Average</span><span>${Math.round(dailyAvg.cal)}</span><span>${Math.round(dailyAvg.p)}</span><span>${Math.round(dailyAvg.c)}</span><span>${Math.round(dailyAvg.f)}</span><span>${Math.round(dailyAvg.exerciseCalories||0)}</span><span>${signedKcal(dailyAvg.energy)}</span></div>
  </div>`:'<p class="notice">Daily macro and energy history will appear after you log nutrition.</p>';

  document.getElementById('weightHistory').innerHTML=entries.length?entries.slice(-10).reverse().map(([d,v])=>`<div class="weight-line"><span>${new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><b>${v.am?`AM ${v.am}`:'—'}</b><b>${v.pm?`PM ${v.pm}`:(v.post?`Post ${v.post}`:'—')}</b></div>`).join(''):'<p class="notice">Start entering morning and evening weights to build your current trend.</p>';
}

function downloadBackup(){
 const payload={app:'Matt Fitness Public',version:12,exportedAt:new Date().toISOString(),state};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`matt-fitness-public-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
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
 await photoDeleteAll();state=JSON.parse(JSON.stringify(base));state.profile={name};state.goals={cal,p,c,f};state.goalHistory={[todayISO()]:{cal,p,c,f}};state.bmr=bmr;state.tdee=tdee;state.waterGoal=waterGoal;state.historicalEnabled=false;state.photoCheckins=[];state.photoDays={};state.scheduleDate=todayISO();state.nextEventType='workout';if(startWeight)state.weights[todayISO()]={am:startWeight};
 save();closeNewUser();renderAll();showScreen('today');
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


function downloadTextFile(filename,text,type='text/plain'){
  const blob=new Blob([text],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function csvCell(v){
  if(v===null||v===undefined)return '';
  const s=String(v);
  return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}
function dailyExportRows(){
  const dates=new Set([
    ...Object.keys(state.weights||{}),
    ...Object.keys(state.nutrition||{}),
    ...Object.keys(state.activities||{}),
    ...Object.keys(state.water||{}),
    ...Object.keys(state.checklistDays||{}),
    ...Object.keys(state.photoDays||{})
  ]);
  (state.history||[]).forEach(h=>{if(h?.date)dates.add(isoDate(h.date));});
  return [...dates].sort().map(date=>{
    const n=totals(state.nutrition[date]?.foods||[]);
    const ex=exerciseTotalsForDate(date);
    const en=energyForDate(date);
    const wt=state.weights[date]||{};
    const acts=state.activities[date]||[];
    const distance=acts.reduce((s,a)=>s+(+a.distance||0),0);
    const water=+(state.water?.[date]||0);
    const checklist=state.checklistDays?.[date]||{};
    const checked=Object.values(checklist).filter(Boolean).length;
    const photos=state.photoDays?.[date]||{};
    const photoCount=Object.values(photos).filter(Boolean).length;
    return {
      date,
      amWeight:wt.am||'',
      pmWeight:wt.pm||'',
      postWorkoutWeight:wt.post||'',
      calories:Math.round(n.cal||0),
      protein:+(n.p||0).toFixed(1),
      carbs:+(n.c||0).toFixed(1),
      fat:+(n.f||0).toFixed(1),
      exerciseMinutes:+(ex.minutes||0).toFixed(1),
      exerciseCalories:Math.round(ex.calories||0),
      energyBalance:Math.round(en.balance||0),
      waterOz:water,
      cardioDistanceMi:+distance.toFixed(2),
      checklistCompleted:checked,
      progressPhotoAngles:photoCount
    };
  });
}
function exportDailyCSV(){
  const rows=dailyExportRows();
  const headers=[
    'Date','AM Weight','PM Weight','Post-workout Weight',
    'Calories','Protein (g)','Carbs (g)','Fat (g)',
    'Exercise Minutes','Exercise Calories','Energy Balance (kcal)',
    'Water (oz)','Cardio Distance (mi)','Checklist Completed','Progress Photo Angles'
  ];
  const keys=[
    'date','amWeight','pmWeight','postWorkoutWeight',
    'calories','protein','carbs','fat',
    'exerciseMinutes','exerciseCalories','energyBalance',
    'waterOz','cardioDistanceMi','checklistCompleted','progressPhotoAngles'
  ];
  const csv=[headers.map(csvCell).join(',')]
    .concat(rows.map(r=>keys.map(k=>csvCell(r[k])).join(',')))
    .join('\n');
  downloadTextFile(`fitness-daily-log-${todayISO()}.csv`,csv,'text/csv;charset=utf-8');
}
function exportFullBackup(){
  const backup={exportedAt:new Date().toISOString(),appVersion:40,state};
  downloadTextFile(
    `fitness-full-backup-${todayISO()}.json`,
    JSON.stringify(backup,null,2),
    'application/json'
  );
}

async function resetForNewUser(){
  const ok=confirm('Reset this app for a new user? This permanently clears all saved workout, nutrition, weight, activity, checklist, water, progress-photo tracking, historical charts, checkpoints and historical session data on this device.');
  if(!ok)return;
  try{
    localStorage.removeItem(PUBLIC_STATE_KEY);
    
    if(typeof photoClear==='function'){
      try{await photoClear()}catch(e){}
    }
  }catch(e){}
  state=JSON.parse(JSON.stringify(base));
  state.profile={name:'User'};
  state.historicalEnabled=false;
  state.photoDays={};
  state.photoCheckins=[];
  state.scheduleDate=todayISO();
  state.nextEventType='workout';
  sessionStorage.removeItem('mfRestTimerEndsAt');
  save();
  calendarCursor=new Date();
  calendarCursor.setDate(1);
  activityEditIndex=null;
  workoutEditIndex=null;
  renderAll();
  alert('App reset complete. Ready for a new user.');
}

function renderAll(){renderToday();renderWorkout();renderNutrition();renderChecklist();renderHistory();renderProgress();renderProgramStartControls()}
function num(id){return parseFloat(document.getElementById(id).value)||0}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));document.getElementById('startBtn').addEventListener('click',()=>showScreen('workout'));
document.getElementById('ackRestBtn').addEventListener('click',acknowledgeRest);document.getElementById('closeFinish').addEventListener('click',closeFinish);document.getElementById('saveWorkoutBtn').addEventListener('click',saveWorkout);document.getElementById('skipTimer').addEventListener('click',stopTimer);document.getElementById('saveWeightBtn').addEventListener('click',saveWeights);document.getElementById('nutritionDate').addEventListener('change',renderNutrition);document.getElementById('saveGoalsBtn').addEventListener('click',saveGoals);document.getElementById('prevMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderHistory()});document.getElementById('nextMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderHistory()});document.getElementById('activityType').addEventListener('change',setHrDefaultsForType);






document.getElementById('newChecklistItem').addEventListener('keydown',e=>{if(e.key==='Enter')addChecklistItem()});
document.getElementById('backupBtn')?.addEventListener('click',downloadBackup);
document.getElementById('restoreInput')?.addEventListener('change',e=>{restoreBackupFile(e.target.files[0]);e.target.value=''});
document.getElementById('newUserBtn')?.addEventListener('click',openNewUser);
document.getElementById('closeNewUserBtn')?.addEventListener('click',closeNewUser);
document.getElementById('confirmNewUserBtn')?.addEventListener('click',createNewUser);

['sum','editWorkout'].forEach(prefix=>{
  ['H','M','S'].forEach(part=>{
    const el=document.getElementById(prefix+'Duration'+part);
    if(el)el.addEventListener('change',()=>syncDurationPicker(prefix));
  });
});

document.getElementById('nutritionDate').value=logDate();setHrDefaultsForType();renderAll();bindPhotoInputs();save();

setTimeout(bindPhotoInputs,0);



document.getElementById('nutritionDate')?.addEventListener('change',e=>{
  const d=e.target.value;
  if(!d||d>todayISO())return;
  selectedLogDate=d;
  renderDailyLogDate();
  renderNutrition();
  renderTodayMacros();
  renderEnergyBalance();
});



document.addEventListener('DOMContentLoaded',()=>{
  restoreRestTimer();
});
