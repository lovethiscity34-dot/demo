"use strict";
(function(){
  const $=s=>document.querySelector(s); const fmt=n=>"Rp "+Math.max(0,Math.round(n)).toLocaleString("id-ID");
  const game=new HorusGameEngine();
  game.ui={
    fmt, toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(this.toast.t);this.toast.t=setTimeout(()=>t.classList.remove("show"),2400);},
    setBusy(b){$("#spinBtn").disabled=b;},
    update(){$("#credit").textContent=fmt(game.credit.value);$("#bet").textContent=fmt(game.bet.value);$("#autoBtn").textContent=game.auto?"■ HENTIKAN OTOMATIS":"↻ MAIN OTOMATIS";$("#autoBtn").classList.toggle("active",game.auto);$("#turboBtn").classList.toggle("active",game.turbo);$("#spinBtn").textContent=game.freeSpins>0?`FREE\n${game.freeSpins}`:"SPIN";},
    markWins(wins){const ids=new Set(wins.map(w=>w.id));document.querySelectorAll(".cell").forEach(el=>{if(ids.has(el.dataset.id))el.classList.add("win");});},
    addHistory(label,amount){const h=$("#history"),d=document.createElement("div");d.innerHTML=`<span>${label}</span><strong>+${fmt(amount)}</strong>`;h.prepend(d);while(h.children.length>8)h.lastChild.remove();},
    bigWin(amount){$("#bigWinAmount").textContent=fmt(amount);$("#bigWin").classList.add("show");setTimeout(()=>$("#bigWin").classList.remove("show"),1600);},
    openModal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").classList.add("show");},
    paytable(){$("#paytable").innerHTML=game.symbols.symbols.filter(s=>!s.scatter).slice().reverse().map(s=>`<div class="payrow"><svg viewBox="0 0 100 100"><use href="${s.svg}"></use></svg><b>${s.name}</b><span>×${s.value}</span></div>`).join("");}
  };
  $("#spinBtn").onclick=()=>game.startSpin(); $("#betUp").onclick=()=>game.increaseBet(); $("#betDown").onclick=()=>game.decreaseBet();
  $("#turboBtn").onclick=()=>{game.turbo=!game.turbo;game.ui.update();};
  $("#autoBtn").onclick=()=>{game.auto=!game.auto;game.ui.update();if(game.auto&&!game.busy)game.startSpin();};
  $("#buyBtn").onclick=()=>game.buyFree(); $("#soundBtn").onclick=()=>{game.sound=!game.sound;$("#soundBtn").textContent=game.sound?"🔊":"🔇";};
  $("#closeModal").onclick=()=>$("#modal").classList.remove("show"); $("#modal").onclick=e=>{if(e.target===$("#modal"))$("#modal").classList.remove("show");};
  $("#rulesBtn").onclick=()=>game.ui.openModal("Aturan Game",`<h4>Horus Super Win 1000</h4><p>Demo dengan kredit virtual.</p><h4>Taruhan</h4><p>Sampai Rp 4.000 naik Rp 100. Setelah itu: Rp 5.000, Rp 10.000, Rp 20.000, Rp 40.000 dan seterusnya ×2.</p><h4>Scatter</h4><p>4+ Scatter memasuki fondasi Scatter Mode. Sistem multiplier akan ditambahkan pada tahap berikutnya.</p><h4>Kredit</h4><p>Kredit awal Rp 100.000. Jika saldo turun di bawah Rp 10.000, demo mengisi ulang ke Rp 100.000.</p>`);
  $("#infoBtn").onclick=()=>game.ui.openModal("Cara Bermain",`<ul><li>Pilih taruhan dengan − / +.</li><li>SPIN untuk bermain.</li><li>TURBO mempercepat animasi.</li><li>MAIN OTOMATIS menjalankan spin berulang.</li><li>BELI FREE SPIN memakai 100× taruhan virtual.</li></ul>`);
  game.ui.paytable(); game.grid=game.symbols.randomGrid(); game.reels.render(game.grid); game.ui.update(); window.HorusGame=game;
})();
