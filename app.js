const upperWarmup=[
 ['Bar Hang','As long as possible','Wrap thumbs around bar'],
 ['Scapular Pushups','10 reps',''],
 ['DB Pause Bench Press','Light set of 10','Maximize stretch; inhale maximally as you lower the dumbbells to your shoulder'],
 ['Suspension I Delt Fly','5 reps',''],
 ['Suspension Y Deltoid Fly','5 reps',''],
 ['Suspension T Deltoid Fly','5 reps','']
];
const lowerWarmup=[
 ['Cardio of Choice','5 min',''],
 ['Bench Thoracic Mobility','30 sec',''],
 ['Supine Piriformis Stretch','15 sec each leg',''],
 ['Superband Good Morning','30 sec',''],
 ['Dynamic Side Lunge Stretch','30 sec',''],
 ['Deep Squat Mobility','At least 30 sec','As long as needed'],
 ['Bodyweight Split Squat','10 per leg','Weak leg first']
];
function workoutType(name){return /lower|legs/i.test(name)?'lower':'upper'}
function warmupHTML(type){const data=type==='lower'?lowerWarmup:upperWarmup;return `<div class="warmup"><div class="eyebrow">${type==='lower'?'Lower':'Upper'} warm-up · 1 round</div><h3>Warm-up</h3>${data.map(x=>`<div class="warm-row"><b>${x[0]}</b><small>${x[1]}${x[2]?` · ${x[2]}`:''}</small></div>`).join('')}</div>`}
const total=program.reduce((s,p)=>s+p.workouts.length*p.rounds,0);
let state=JSON.parse(localStorage.getItem('mwState')||'{"phase":0,"round":0,"workout":0,"completed":0,"streak":0,"history":[]}');
let timerInterval=null,timerLeft=0;
function save(){localStorage.setItem('mwState',JSON.stringify(state))}
function current(){return program[state.phase].workouts[state.workout]}
function phase(){return program[state.phase]}
function renderHome(){const p=phase(),w=current();document.getElementById('phaseLabel').textContent=`${p.name} · Round ${state.round+1} of ${p.rounds}`;document.getElementById('nextWorkout').textContent=w.name;document.getElementById('sessionLabel').textContent=`Workout ${Math.min(state.completed+1,total)} of ${total}`;document.getElementById('completedStat').textContent=state.completed;document.getElementById('phaseStat').textContent=`${state.phase+1} / 3`;document.getElementById('overallProgress').style.width=`${state.completed/total*100}%`;document.getElementById('progressText').textContent=`${state.completed} of ${total} workouts completed`;document.getElementById('todayLabel').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});document.getElementById('startBtn').textContent=state.completed>=total?'Program complete':'Start workout'}
function renderWorkout(){const p=phase(),w=current();document.getElementById('workoutPhase').textContent=`${p.name} · R${state.round+1}`;document.getElementById('workoutTitle').textContent=w.name;document.getElementById('workoutMeta').textContent=`${w.ex.length} exercises · ${p.on} days on / 1 off`;const el=document.getElementById('exerciseList');el.innerHTML=warmupHTML(workoutType(w.name));w.ex.forEach((x,i)=>{const [name,sets,rest,last]=x;let rows=sets.map((target,j)=>`<div class="setrow"><div class="setnum">${j+1}</div><input inputmode="decimal" placeholder="weight"><input inputmode="numeric" placeholder="reps · ${target}"><button class="check" data-rest="${rest}">✓</button></div>`).join('');el.insertAdjacentHTML('beforeend',`<div class="exercise"><div class="ex-head"><div><h3>${name}</h3><div class="rx">${sets.length} set${sets.length>1?'s':''} · ${sets.join(' / ')}${rest?` · ${rest} rest`:''}</div></div></div><div class="last">Last: ${last||'—'}</div>${rows}</div>`)});document.querySelectorAll('.check').forEach(b=>b.onclick=()=>{b.classList.toggle('done');if(b.classList.contains('done')&&b.dataset.rest) startTimer(b.dataset.rest)});}
function parseRest(s){if(!s)return 0;let [m,sec]=s.split(':').map(Number);return m*60+sec}
function startTimer(rest){stopTimer();timerLeft=parseRest(rest);if(!timerLeft)return;document.getElementById('timer').classList.add('show');tick();timerInterval=setInterval(()=>{timerLeft--;tick();if(timerLeft<=0)stopTimer()},1000)}
function tick(){let m=Math.floor(timerLeft/60),s=timerLeft%60;document.getElementById('timerText').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;document.getElementById('timer').classList.remove('show')}
function finishWorkout(){if(state.completed>=total)return;const w=current(),p=phase();state.history.unshift({date:new Date().toISOString(),phase:p.name,round:state.round+1,workout:w.name});state.completed++;state.streak++;state.workout++;if(state.workout>=p.workouts.length){state.workout=0;state.round++;if(state.round>=p.rounds){state.round=0;state.phase++;if(state.phase>=program.length){state.phase=program.length-1;state.round=program[state.phase].rounds-1;state.workout=program[state.phase].workouts.length-1;}}}save();renderAll();showScreen('home')}
function renderHistory(){const el=document.getElementById('historyList');if(!state.history.length){el.innerHTML='<p class="notice">No newly completed sessions yet. Your old 2026 stats are already used as reference numbers inside the workouts.</p>';return}el.innerHTML=state.history.map(h=>`<div class="history-item"><b>${h.workout}</b><small>${h.phase} · Round ${h.round} · ${new Date(h.date).toLocaleDateString()}</small></div>`).join('')}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.screen===id));if(id==='workout')renderWorkout();if(id==='history')renderHistory()}
function renderAll(){renderHome();renderWorkout();renderHistory()}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));document.getElementById('startBtn').onclick=()=>showScreen('workout');document.getElementById('finishBtn').onclick=finishWorkout;document.getElementById('resetBtn').onclick=()=>{if(confirm('Reset all prototype progress?')){state={phase:0,round:0,workout:0,completed:0,streak:0,history:[]};save();renderAll();showScreen('home')}};renderAll();