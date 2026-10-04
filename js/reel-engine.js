(function(){
  function Reel(symbols){this.symbols=symbols;this.root=document.querySelector('#reels');this.columns=[];this.running=false}
  Reel.prototype.cell=function(cell,r,c){
    const s=this.symbols.get(cell.id); const d=document.createElement('div'); d.className='cell';
    d.dataset.r=r; d.dataset.c=c; d.dataset.id=s.id;
    d.innerHTML=`<img src="${s.svg}" alt="${s.name}">`;
    if(s.scatter)d.insertAdjacentHTML('beforeend','<span class="scatter-label">SCATTER</span>');
    if(cell.multiplier>0)d.insertAdjacentHTML('beforeend',`<span class="multiplier ${HorusMultiplierEngine.tier(cell.multiplier)}">x${cell.multiplier}</span>`);
    return d;
  };
  Reel.prototype.makeSpinColumn=function(finalCol,mode,count){
    const col=document.createElement('div'); col.className='reel-window';
    const track=document.createElement('div'); track.className='reel-track';
    for(let i=0;i<count;i++){
      const filler={id:this.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0};
      track.appendChild(this.cell(filler,i,0));
    }
    finalCol.forEach((cell,i)=>track.appendChild(this.cell(cell,i,count)));
    col.appendChild(track); return {col,track,count};
  };
  Reel.prototype.render=function(grid){
    this.root.innerHTML=''; this.root.classList.remove('rolling'); this.columns=[];
    for(let c=0;c<HorusConfig.COLS;c++){
      const col=document.createElement('div'); col.className='reel-window final-reel';
      const track=document.createElement('div'); track.className='reel-track settled';
      for(let r=0;r<HorusConfig.ROWS;r++) track.appendChild(this.cell(grid[r][c],r,c));
      col.appendChild(track); this.root.appendChild(col); this.columns.push({col,track});
    }
  };
  Reel.prototype.animate=function(grid,turbo,mode='NORMAL'){
    const count=turbo?18:26;
    const duration=turbo?HorusConfig.TURBO_REEL_ROLL_DURATION:HorusConfig.REEL_ROLL_DURATION;
    const stagger=turbo?HorusConfig.TURBO_REEL_STOP_STAGGER:HorusConfig.REEL_STOP_STAGGER;
    this.root.innerHTML=''; this.root.classList.add('rolling'); this.columns=[]; this.running=true;
    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.makeSpinColumn(grid.map(row=>row[c]),mode,count);
      this.root.appendChild(made.col); this.columns.push(made);
      made.track.style.setProperty('--spin-duration',`${duration}ms`);
      made.track.style.setProperty('--spin-delay',`${c*stagger}ms`);
      made.track.style.setProperty('--spin-distance',`-${count * 100}%`);
    }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      this.columns.forEach(({track,count:c})=>{
        track.classList.add('spinning');
        track.style.transform=`translateY(calc(-1 * (${c} * (var(--cell-h) + var(--gap)))))`;
      });
    }));
    const total=duration+stagger*(HorusConfig.COLS-1)+HorusConfig.REEL_SETTLE+40;
    return new Promise(res=>setTimeout(()=>{this.running=false;this.render(grid);res()},total));
  };
  Reel.prototype.remove=function(){document.querySelectorAll('.cell.win').forEach(e=>e.classList.add('removing'))};
  window.HorusReelEngine=Reel;
})();
