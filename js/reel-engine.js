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
    // A continuous strip: filler symbols are immediately followed by the final
    // five symbols, so the viewport is never empty during the roll.
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
    const count=turbo?22:30;
    const duration=turbo?Math.max(620,HorusConfig.TURBO_REEL_ROLL_DURATION):Math.max(1350,HorusConfig.REEL_ROLL_DURATION);
    const stagger=turbo?Math.max(70,HorusConfig.TURBO_REEL_STOP_STAGGER):Math.max(145,HorusConfig.REEL_STOP_STAGGER);
    const settle=turbo?Math.max(110,HorusConfig.REEL_SETTLE):Math.max(220,HorusConfig.REEL_SETTLE);

    this.root.innerHTML=''; this.root.classList.add('rolling'); this.columns=[]; this.running=true;
    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.makeSpinColumn(grid.map(row=>row[c]),mode,count);
      this.root.appendChild(made.col); this.columns.push(made);
      made.track.style.setProperty('--spin-duration',`${duration}ms`);
      made.track.style.setProperty('--spin-delay',`${c*stagger}ms`);
    }

    // Measure the actual rendered pitch. This avoids the last-frame jump caused
    // by estimating the distance as a percentage when CSS gaps are present.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      this.columns.forEach(({track,count})=>{
        const first=track.querySelector('.cell');
        const pitch=first?first.getBoundingClientRect().height + parseFloat(getComputedStyle(track).rowGap || getComputedStyle(track).gap || '0'):0;
        const distance=Math.max(0,count*pitch);
        track.style.setProperty('--spin-distance',`${distance}px`);
        track.style.transform='translate3d(0,0,0)';
        requestAnimationFrame(()=>{
          track.classList.add('spinning');
          track.style.transform=`translate3d(0,-${distance}px,0)`;
        });
      });
    }));

    const total=duration+stagger*(HorusConfig.COLS-1)+settle+60;
    return new Promise(res=>setTimeout(()=>{
      this.running=false;
      // Render only after the slow settle phase has completed. The reel therefore
      // lands visually on the final symbols instead of snapping while still moving.
      this.render(grid); res();
    },total));
  };

  Reel.prototype.remove=function(){document.querySelectorAll('.cell.win').forEach(e=>e.classList.add('removing'))};
  window.HorusReelEngine=Reel;
})();
