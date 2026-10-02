"use strict";
(function(){
 const $=s=>document.querySelector(s),fmt=n=>"Rp "+Math.max(0,Math.round(n)).toLocaleString("id-ID");
 const game=new HorusGameEngine();
 game.ui={
  fmt,
  toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(this.toast.t);this.toast.t=setTimeout(()=>t.classList.remove("show"),2400);},
  setBusy(b){$("#spinBtn").disabled=b;},
  update(){
   $("#credit").textContent=fmt(game.credit.value);$("#bet").textContent=fmt(game.bet.value);
   $("#autoBtn").textContent=game.auto?"■ HENTIKAN OTOMATIS":"↻ MAIN OTOMATIS";$("#autoBtn").classList.toggle("active",game.auto);$("#turboBtn").classList.toggle("active",game.turbo);
   $("#spinBtn").textContent=game.freeSpins>0?`FREE ${game.freeSpins}`:"SPIN";
   $("#winMeter").style.width=Math.min(100,(game.totalWin/Math.max(1,game.bet.value))*2)+"%";$("#winMeterText").textContent=Math.min(100,Math.round((game.totalWin/Math.max(1,game.bet.value))*2))+"%";
   document.body.classList.toggle("scatter-mode",game.mode==="SCATTER");$("#modeCaption").textContent=game.mode==="SCATTER"?"DIVINE FLIGHT • SCATTER":"SKY • WAR • PROTECTION";$("#modeKicker").textContent=game.mode==="SCATTER"?"TEMPLE AWAKENED":"TEMPLE OF THE SKY";$("#modeRibbon").textContent=game.mode==="SCATTER"?"SCATTER MODE • DIVINE FLIGHT":"NORMAL MODE";$("#modeBadge").textContent=game.mode==="SCATTER"?"FREE SPIN • MULTIPLIER":"DEMO • KREDIT VIRTUAL";
  },
  markWins(wins){document.querySelectorAll(".cell.win").forEach(e=>e.classList.remove("win"));wins.flatMap(w=>w.cells).forEach(p=>{const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(e)e.classList.add("win");});},
  addHistory(label,amount){const h=$("#history"),d=document.createElement("div");d.innerHTML=`<span>${label}</span><strong>+${fmt(amount)}</strong>`;h.prepend(d);while(h.children.length>8)h.lastChild.remove();},
  bigWin(amount){$("#bigWinAmount").textContent=fmt(amount);$("#bigWin").classList.add("show");setTimeout(()=>$("#bigWin").classList.remove("show"),1800);},
  openModal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").classList.add("show");},
  paytable(){$("#paytable").innerHTML=game.symbols.symbols.filter(s=>!s.scatter).slice().reverse().map(s=>`<div class="payrow"><svg viewBox="0 0 100 100"><use href="${s.svg}"></use></svg><b>${s.name}</b><span>×${s.value}</span></div>`).join("");}
 };
 $("#spinBtn").onclick=()=>game.startSpin();$("#betUp").onclick=()=>game.increaseBet();$("#betDown").onclick=()=>game.decreaseBet();
 $("#turboBtn").onclick=()=>{game.turbo=!game.turbo;game.ui.update();};$("#autoBtn").onclick=()=>{game.auto=!game.auto;game.ui.update();if(game.auto&&!game.busy)game.startSpin();};
 $("#buyBtn").onclick=()=>game.buyFree();$("#soundBtn").onclick=()=>{game.sound=!game.sound;game.audio.enabled=game.sound;$("#soundBtn").textContent=game.sound?"🔊":"🔇";if(game.sound)game.audio.tone(440,.05);};
 $("#closeModal").onclick=()=>$("#modal").classList.remove("show");$("#modal").onclick=e=>{if(e.target===$("#modal"))$("#modal").classList.remove("show");};
 const rules=`<h4>Normal Mode</h4><ul><li>Grid 6×5.</li><li>8+ simbol identik membentuk win.</li><li>Simbol menang di-highlight, dihapus, lalu reel tumble dan refill.</li><li>4+ Scatter memicu Scatter Mode.</li></ul><h4>Scatter Mode</h4><ul><li>Free Spin otomatis berjalan.</li><li>Horus berubah menjadi Ultimate / Divine Flight.</li><li>Multiplier x1–x1000 muncul secara independen.</li><li>x1–x9 hijau, x10–x19 biru, x20–x49 ungu, x50–x99 magenta, x100–x249 gold, x250–x499 cyan, x500–x999 solar, x1000 divine.</li></ul><h4>Bet & Kredit</h4><ul><li>Rp100.000 virtual.</li><li>Sampai Rp4.000: +Rp100.</li><li>Rp4.000 → Rp5.000 → Rp10.000 → selanjutnya ×2.</li><li>Bet tidak boleh melebihi kredit.</li><li>Jika saldo di bawah Rp10.000, demo reset ke Rp100.000.</li></ul><p>Demo gratis, tanpa uang nyata.</p>`;
 $("#rulesBtn").onclick=()=>game.ui.openModal("Aturan Game",rules);$("#infoBtn").onclick=()=>game.ui.openModal("Cara Bermain",rules);
 game.ui.paytable();game.grid=game.symbols.randomGrid("NORMAL");game.reels.render(game.grid);game.ui.update();window.HorusGame=game;
})();
