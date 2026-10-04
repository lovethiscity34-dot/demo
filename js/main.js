(function(){
  const $=s=>document.querySelector(s),fmt=n=>'Rp '+Math.max(0,Math.round(n||0)).toLocaleString('id-ID');
  const game=new HorusGameEngine();
  game.ui={
    fmt,
    toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(this.tt);this.tt=setTimeout(()=>t.classList.remove('show'),2400)},
    setBusy(b){$('#spinBtn').disabled=b;$('#buyBtn').disabled=b},
    state(s){document.body.dataset.state=s},
    update(){
      const scatter=game.mode==='SCATTER';
      $('#credit').textContent=fmt(game.credit.value);$('#bet').textContent=fmt(game.bet.value);
      $('#autoBtn').textContent=game.auto?'■ HENTIKAN AUTO':'↻ AUTO';$('#autoBtn').classList.toggle('active',game.auto);
      $('#turboBtn').classList.toggle('active',game.turbo);$('#spinBtn').textContent=game.freeSpins>0?`FREE ${game.freeSpins}`:'SPIN';
      $('#modeKicker').textContent=scatter?'TEMPLE AWAKENED':'TEMPLE OF THE SKY';$('#modeBadge').textContent=scatter?'FREE SPIN • MULTIPLIER':'DEMO • KREDIT VIRTUAL';
      document.body.dataset.mode=scatter?'SCATTER':'NORMAL';
      $('#winMeter').style.width=Math.min(100,(game.totalWin/Math.max(1,game.bet.value))*2)+'%';$('#winMeterText').textContent=Math.min(100,Math.round((game.totalWin/Math.max(1,game.bet.value))*2))+'%';
      this.setBusy(game.busy);
    },
    markWins(wins){document.querySelectorAll('.cell.win').forEach(e=>e.classList.remove('win'));wins.flatMap(w=>w.cells).forEach(p=>{const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(e)e.classList.add('win')})},
    addHistory(label,amount){const h=$('#history'),d=document.createElement('div');d.innerHTML=`<span>${label}</span><strong>${amount?'+'+fmt(amount):'—'}</strong>`;h.prepend(d);while(h.children.length>8)h.lastElementChild.remove()},
    bigWin(amount){$('#bigWinAmount').textContent=fmt(amount);$('#bigWin').classList.add('show');setTimeout(()=>$('#bigWin').classList.remove('show'),1800)},
    showMultiplier(m){if(!m||!m.count)return;},showScatterNotification(count,spins){const box=$('#scatterNotify');if(!box)return;$('#scatterNotifyTitle').textContent='SCATTER AKTIF';$('#scatterNotifySpins').textContent=`${count} SCATTER • ${spins} FREE SPIN`;box.classList.add('show');clearTimeout(this.scatterNotifyTimer);this.scatterNotifyTimer=setTimeout(()=>box.classList.remove('show'),1900)},showScatterResult(data){return new Promise(resolve=>{const box=$('#scatterResult');$('#scatterResultTotal').textContent=fmt(data.totalWin);$('#scatterResultSpins').textContent=`${data.spinsPlayed} / ${data.totalSpins}`;$('#scatterResultMultiplier').textContent=`x${Math.max(1,data.maxMultiplier)}`;box.classList.add('show');const done=()=>{box.classList.remove('show');$('#scatterResultOk').removeEventListener('click',done);resolve()};$('#scatterResultOk').addEventListener('click',done,{once:true})})},
    openModal(title,body){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modal').classList.add('show')},
    closeModal(){$('#modal').classList.remove('show')},
    paytable(){const rows=game.symbols.symbols.filter(s=>!s.scatter).slice().reverse();$('#paytable').innerHTML=rows.map(s=>`<div class="payrow"><img src="${s.svg}" alt="${s.name}"><b>${s.name}</b><span>×${s.value}</span></div>`).join('')}
  };
  game.horus=new HorusController();
  $('#spinBtn').onclick=()=>{game.audio.init();game.startSpin()};
  $('#betUp').onclick=()=>game.increaseBet();$('#betDown').onclick=()=>game.decreaseBet();
  $('#turboBtn').onclick=()=>{game.turbo=!game.turbo;game.ui.update()};
  $('#autoBtn').onclick=()=>{game.auto=!game.auto;game.ui.update();if(game.auto&&!game.busy)game.startSpin()};
  $('#buyBtn').onclick=()=>{
    if(game.busy)return;
    const cost=game.bet.value*100;
    game.ui.openModal('Beli Scatter',`<div class="scatter-buy"><div class="scatter-buy-art"><img src="assets/symbols/scatter.svg" alt="Scatter"></div><p class="scatter-buy-label">HARGA SCATTER</p><strong class="scatter-buy-price">${fmt(cost)}</strong><p class="scatter-buy-note">Konfirmasi untuk masuk ke Scatter Mode dan mendapatkan ${HorusConfig.SCATTER_BASE_SPINS} Free Spin.</p><div class="scatter-buy-actions"><button id="scatterCancel" class="scatter-cancel" type="button">✕</button><button id="scatterConfirm" class="scatter-confirm" type="button">✓</button></div></div>`);
    $('#scatterCancel').onclick=()=>game.ui.closeModal();
    $('#scatterConfirm').onclick=async()=>{game.ui.closeModal();game.audio.init();await game.buyFree()};
  };
  $('#soundBtn').onclick=()=>{game.audio.init();game.audio.setEnabled(!game.audio.enabled);$('#soundBtn').textContent=game.audio.enabled?'🔊':'🔇';if(game.audio.enabled)game.audio.sfx('button','ui')};
  $('#closeModal').onclick=()=>game.ui.closeModal();$('#modal').onclick=e=>{if(e.target===$('#modal'))game.ui.closeModal()};
  const rules=`<h4>Permainan</h4><ul><li>Grid 5×5.</li><li>7+ simbol identik membentuk kombinasi win pada putaran biasa.</li><li>Simbol menang dihapus dan grid tumble/refill.</li><li>4+ Scatter memicu sesi Scatter.</li></ul><h4>Scatter</h4><ul><li>15 Free Spin dasar; setiap 3 Scatter menambah 5 spin.</li><li>Horus berubah ke Ultimate / Divine Flight.</li><li>Multiplier muncul independen dari x1 sampai x1000.</li><li>Tingkat warna: x1–9 hijau, x10–19 biru, x20–49 ungu, x50–99 magenta, x100–249 gold, x250–499 cyan, x500–999 solar, x1000 divine.</li></ul><h4>Bet & Kredit</h4><ul><li>Mulai Rp100.000 virtual.</li><li>Sampai Rp4.000: +Rp100.</li><li>Rp4.000 → Rp5.000 → Rp10.000 → selanjutnya ×2.</li><li>Bet di atas kredit diblokir.</li><li>Jika saldo turun di bawah Rp10.000, demo diisi ulang menjadi Rp100.000.</li></ul>`;
  $('#rulesBtn').onclick=()=>game.ui.openModal('Aturan Game',rules);$('#infoBtn').onclick=()=>game.ui.openModal('Cara Bermain',rules);
  game.ui.paytable();
  const preload=[
    'assets/symbols/horus.svg','assets/symbols/eye.svg','assets/symbols/ankh.svg','assets/symbols/scarab.svg','assets/symbols/sun.svg','assets/symbols/falcon.svg','assets/symbols/crown.svg','assets/symbols/lotus.svg','assets/symbols/scatter.svg','assets/symbols/horus.svg',
    'assets/horus/horus-idle.svg','assets/horus/horus-spin.svg','assets/horus/horus-win.svg','assets/horus/horus-bigwin.svg','assets/horus/horus-scatter.svg','assets/horus/horus-ultimate.svg',
    'assets/backgrounds/normal-bg.svg','assets/backgrounds/scatter-bg.svg','assets/backgrounds/ultimate-bg.svg','assets/effects/energy-ring.svg','assets/effects/divine-ray.svg'
  ];
  function preloadImages(){return Promise.all(preload.map(src=>new Promise(resolve=>{const im=new Image();im.onload=resolve;im.onerror=resolve;im.src=src})));}
  function finishLoading(){const screen=$('#loadingScreen');screen.classList.add('loaded');setTimeout(()=>screen.remove(),500);game.start()}
  (async()=>{await preloadImages();setTimeout(finishLoading,450)})();
  window.HorusGame=game;
})();
