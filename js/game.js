
(() => {
"use strict";
const C=window.HorusConfig, R=C.ROWS, COLS=C.COLS;
const SYMBOLS=[
 {id:"eye",name:"Eye of Horus",base:1.2,pay:3,weight:17},
 {id:"ankh",name:"Ankh",base:1.4,pay:3.5,weight:16},
 {id:"scarab",name:"Scarab",base:1.8,pay:4,weight:14},
 {id:"sun",name:"Solar Disc",base:2.2,pay:5,weight:12},
 {id:"falcon",name:"Falcon",base:2.8,pay:6,weight:10},
 {id:"crown",name:"Crown",base:3.4,pay:7,weight:8},
 {id:"lotus",name:"Lotus",base:4.2,pay:9,weight:6},
 {id:"horus",name:"Horus",base:5.5,pay:12,weight:4}
];
const ids=SYMBOLS.map(s=>s.id), $=id=>document.getElementById(id);
let credit=C.STARTING_CREDIT, bet=C.DEFAULT_BET, turbo=false, auto=false, busy=false;
let mode="normal", freeSpins=0, totalWin=0, meter=0, sound=true, audioCtx=null, grid=[], currentMulti=1, history=[];
const app=$("app"), reels=$("reels");

function money(n){return "Rp "+Math.max(0,Math.round(n)).toLocaleString("id-ID")}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function rand(){return Math.random()}
function weightedId(){let sum=SYMBOLS.reduce((a,s)=>a+s.weight,0),x=rand()*sum;for(const s of SYMBOLS){x-=s.weight;if(x<=0)return s.id}return ids[0]}
function multTier(x){if(x<=9)return"m-green";if(x<=19)return"m-blue";if(x<=49)return"m-purple";if(x<=99)return"m-magenta";if(x<=249)return"m-gold";if(x<=499)return"m-cyan";if(x<=999)return"m-solar";return"m-divine"}
function randomMultiplier(){const roll=rand();if(roll>.095)return 1;if(roll<.00025)return 1000;if(roll<.001)return 500+Math.floor(rand()*500);if(roll<.004)return 250+Math.floor(rand()*250);if(roll<.012)return 100+Math.floor(rand()*150);if(roll<.03)return 50+Math.floor(rand()*50);if(roll<.055)return 20+Math.floor(rand()*30);if(roll<.075)return 10+Math.floor(rand()*10);return 1+Math.floor(rand()*9)}
function scatterChance(){return mode==="scatter"?C.SCATTER_SCATTER_PROB:C.NORMAL_SCATTER_PROB}
function randomSymbol(){if(rand()<scatterChance())return"scatter";return weightedId()}
function makeGrid(){return Array.from({length:R},()=>Array.from({length:COLS},()=>({id:randomSymbol(),multi:0,new:true})))}
function renderGrid(anim=true){
 reels.innerHTML="";
 for(let c=0;c<COLS;c++){const col=document.createElement("div");col.className="reel";col.dataset.col=c;
  for(let r=0;r<R;r++){const cell=document.createElement("div");cell.className="cell"+(grid[r][c].new&&anim?" new":"");cell.dataset.r=r;cell.dataset.c=c;
   const svg=document.createElementNS("http://www.w3.org/2000/svg","http://www.w3.org/2000/svg");svg.setAttribute("viewBox","0 0 100 100");const use=document.createElementNS("http://www.w3.org/2000/svg","use");use.setAttribute("href","#sym-"+grid[r][c].id);svg.appendChild(use);cell.appendChild(svg);
   if(grid[r][c].id==="scatter"){const l=document.createElement("div");l.className="label";l.textContent="SCATTER";cell.appendChild(l)}
   if(grid[r][c].multi>1){const m=document.createElement("div");m.className="multiplier "+multTier(grid[r][c].multi);m.textContent="x"+grid[r][c].multi;cell.appendChild(m)}
   col.appendChild(cell);grid[r][c].new=false;
  } reels.appendChild(col);
 }
}
function highlight(cells,on=true){for(const p of cells){const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(e)e.classList.toggle("win",on)}}
function findWins(){
 const groups=new Map(), scat=[];
 for(let r=0;r<R;r++)for(let c=0;c<COLS;c++){const id=grid[r][c].id;if(id==="scatter")scat.push({r,c});else{if(!groups.has(id))groups.set(id,[]);groups.get(id).push({r,c})}}
 const wins=[];for(const [id,cells] of groups)if(cells.length>=8)wins.push({id,cells,count:cells.length});
 return {wins,scat};
}
function baseWin(w){const s=SYMBOLS.find(x=>x.id===w.id);let mult=w.count>=20?12:w.count>=16?8:w.count>=12?5:3;return bet*s.pay*mult*(w.count/8)}
function reelStart(){document.querySelectorAll(".reel").forEach(e=>e.classList.add("rolling"))}
async function reelStop(){const delay=turbo?C.TURBO_SPIN_DELAY:C.NORMAL_SPIN_DELAY;for(let c=0;c<COLS;c++){await sleep(delay);const e=document.querySelector(`.reel[data-col="${c}"]`);if(e){e.classList.remove("rolling");e.classList.add("stopping");setTimeout(()=>e.classList.remove("stopping"),300)}}}
function flash(){const f=$("flash");f.classList.remove("on");void f.offsetWidth;f.classList.add("on")}
async function tumble(removeCells){
 const set=new Set(removeCells.map(p=>p.r+","+p.c));for(const p of removeCells){const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(e)e.classList.add("removing")}
 await sleep(turbo?120:330);
 for(let c=0;c<COLS;c++){const kept=[];for(let r=R-1;r>=0;r--)if(!set.has(r+","+c))kept.push(grid[r][c]);for(let r=R-1,i=0;r>=0;r--,i++)grid[r][c]=kept[i]||{id:randomSymbol(),multi:0,new:true};}
 renderGrid(true);await sleep(turbo?100:260);
}
function addHistory(label,amount){history.unshift({label,amount});history=history.slice(0,8);$("history").innerHTML=history.map(x=>`<div><span>${x.label}</span><strong>${x.amount?money(x.amount):"—"}</strong></div>`).join("")}
function update(){
 $("credit").textContent=money(credit);$("bet").textContent=money(bet);$("freeSpins").textContent=freeSpins;$("currentMulti").textContent="x"+currentMulti;
 $("turboBtn").classList.toggle("active",turbo);$("autoBtn").classList.toggle("active",auto);$("spinBtn").disabled=busy;
 $("winMeter").style.width=Math.min(100,meter)+"%";$("winMeterText").textContent=Math.round(meter)+"%";
 $("modeRibbon").textContent=mode==="scatter"?"SCATTER MODE • DIVINE FLIGHT":"NORMAL MODE";
 $("modeCaption").textContent=mode==="scatter"?"DIVINE FLIGHT • SCATTER":"TEMPLE OF THE SKY • NORMAL";
 $("modeKicker").textContent=mode==="scatter"?"TEMPLE AWAKENED":"TEMPLE OF THE SKY";
 $("horusState").textContent=mode==="scatter"?"ULTIMATE • SKY AVATAR":"GUARDIAN";
 $("modeHint").textContent=mode==="scatter"?"Scatter aktif: RNG lebih tinggi, multiplier x1–x1000 dapat muncul, dan Free Spin terus berjalan.":"8+ simbol identik membentuk kemenangan. 4+ Scatter membuka Scatter Mode.";
}
function setMode(next){
 mode=next;app.classList.toggle("scatter-mode",mode==="scatter");app.classList.toggle("normal-mode",mode==="normal");
 if(mode==="normal"){freeSpins=0;currentMulti=1}
 update();
}
function paytable(){ $("paytable").innerHTML=SYMBOLS.slice().reverse().map(s=>`<div class="payrow"><svg viewBox="0 0 100 100"><use href="#sym-${s.id}"/></svg><b>${s.name}</b><span>${s.pay}x</span></div>`).join("")}
function creditSpend(){if(bet>credit){toast("Kredit tidak cukup untuk taruhan ini.");return false}credit-=bet;return true}
function resetCreditIfNeeded(){if(credit<C.RESET_BELOW){credit=C.STARTING_CREDIT;addHistory("Demo reset","");toast("Demo di-reset ke Rp 100.000");}}
function nextBet(dir){
 if(dir>0){if(bet<C.BET_TRANSITION){bet+=C.BET_STEP;if(bet>C.BET_TRANSITION)bet=C.BET_FIRST_HIGH}else if(bet===C.BET_TRANSITION)bet=C.BET_FIRST_HIGH;else bet*=2}
 else{if(bet<=C.BET_FIRST_HIGH){bet=Math.max(C.BET_STEP,bet-C.BET_STEP);if(bet===4000)return bet}else if(bet===C.BET_FIRST_HIGH)bet=C.BET_TRANSITION;else bet=Math.floor(bet/2);if(bet<5000&&bet>4000)bet=4000}
 return bet
}
function beep(freq=440,dur=.07,type="sine"){if(!sound)return;if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.045,audioCtx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur+.02)}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1900)}
async function bigWin(amount,title="HORUS MEMBERKATI",sub="WIN"){if(amount<=0)return;$("bigWinTitle").textContent=title;$("bigWinAmount").textContent=money(amount);$("bigWinSub").textContent=sub;$("bigWin").classList.add("show");beep(880,.18,"triangle");await sleep(1500);$("bigWin").classList.remove("show")}
async function spin(free=false){
 if(busy)return;if(!free&&!creditSpend())return;
 busy=true;currentMulti=1;update();beep(180,.08,"square");reelStart();grid=makeGrid();renderGrid(false);await reelStop();beep(330,.06);
 let rounds=0,spinWin=0,scatterCount=0;
 while(rounds++<C.MAX_TUMBLE_ROUNDS){
   const found=findWins();scatterCount=found.scat.length;
   if(!found.wins.length)break;
   const all=[];let roundWin=0;
   for(const w of found.wins){const mCells=w.cells.filter(p=>grid[p.r][p.c].multi>0);let wv=baseWin(w);if(mCells.length){const mx=Math.max(...mCells.map(p=>grid[p.r][p.c].multi));wv*=mx;currentMulti=mx}roundWin+=wv;all.push(...w.cells)}
   spinWin+=roundWin;meter=Math.min(100,meter+Math.min(22,roundWin/Math.max(1,bet)*3));highlight(all,true);flash();$("winBanner").classList.add("show");setTimeout(()=>$("winBanner").classList.remove("show"),650);beep(520,.09,"triangle");
   await sleep(turbo?220:520);highlight(all,false);await tumble(all);
 }
 if(mode==="scatter"){
   // Scatter mode multiplier symbols are placed independently after the tumble result.
   for(let r=0;r<R;r++)for(let c=0;c<COLS;c++)if(grid[r][c].id!=="scatter"&&rand()<.035){grid[r][c].multi=randomMultiplier()}
   renderGrid(false);
   const mults=[];for(let r=0;r<R;r++)for(let c=0;c<COLS;c++)if(grid[r][c].multi>1)mults.push(grid[r][c].multi);
   if(mults.length){currentMulti=Math.max(...mults);spinWin*=currentMulti;await sleep(turbo?120:240)}
 }
 credit+=spinWin;totalWin+=spinWin;addHistory(mode==="scatter"?"Scatter Win":"Spin Win",spinWin);if(spinWin)await bigWin(spinWin>=bet*C.BIG_WIN_X?spinWin:0,spinWin>=bet*C.BIG_WIN_X?"HORUS SUPER WIN":"WIN",spinWin>=bet*C.BIG_WIN_X?"BIG WIN":"");
 if(scatterCount>=C.SCATTER_TRIGGER&&mode==="normal"){freeSpins=C.SCATTER_BASE_SPINS+(scatterCount>=6?10:0);setMode("scatter");toast(`${scatterCount} SCATTER! +${freeSpins} FREE SPIN`);beep(740,.2,"sawtooth")}
 else if(mode==="scatter"){freeSpins--;if(freeSpins<=0){setMode("normal");toast("Scatter selesai. Kembali ke Normal Mode.");beep(220,.18,"sine")}}
 resetCreditIfNeeded();busy=false;update();
 if(auto&&!busy){await sleep(turbo?180:500);spin(mode==="scatter")}
}
function showRules(){
 $("modalTitle").textContent="Horus Super Win 1000";$("modalBody").innerHTML=`<h4>Normal Mode</h4><ul><li>Grid 6×5.</li><li>8+ simbol identik membentuk win.</li><li>Win dapat tumble beberapa kali.</li><li>4+ Scatter memicu Scatter Mode.</li></ul><h4>Scatter Mode</h4><ul><li>Free Spin dimulai otomatis.</li><li>RNG win lebih tinggi daripada Normal.</li><li>Multiplier muncul independen: x1–x1000.</li><li>x1000 adalah tier Divine dan dibuat sangat langka.</li></ul><h4>Bet & Kredit</h4><ul><li>Mulai Rp100.000 virtual.</li><li>Sampai Rp4.000 naik Rp100.</li><li>Rp4.000 → Rp5.000 → Rp10.000 → dua kali lipat seterusnya.</li><li>Taruhan tidak boleh melebihi kredit.</li><li>Jika demo turun di bawah Rp10.000, kredit di-reset ke Rp100.000.</li></ul><h4>Catatan</h4><p>Ini demo gratis tanpa uang nyata dan tanpa pembayaran.</p>`;$("modal").classList.add("show")}
$("spinBtn").onclick=()=>spin(mode==="scatter");$("betUp").onclick=()=>{if(!busy){bet=nextBet(1);update()}};$("betDown").onclick=()=>{if(!busy){bet=nextBet(-1);update()}};
$("turboBtn").onclick=()=>{turbo=!turbo;update()};$("autoBtn").onclick=()=>{auto=!auto;update();if(auto&&!busy)spin(mode==="scatter")};
$("soundBtn").onclick=()=>{sound=!sound;$("soundBtn").textContent=sound?"🔊":"🔇";if(sound)beep(440,.06)};$("rulesBtn").onclick=showRules;$("infoBtn").onclick=showRules;$("closeModal").onclick=()=>$("modal").classList.remove("show");$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.remove("show")};
$("buyBtn").onclick=()=>toast("Free Spin diperoleh lewat Scatter 4+ dalam demo ini.");
paytable();grid=makeGrid();renderGrid(false);update();
})();
