(function(){
  /*
   * Continuous reel-strip renderer.
   * The viewport is always filled with symbols while spinning; there is no
   * "empty gap" between one symbol and the next. Each reel is a long strip
   * that is translated vertically and then settles on the requested result.
   */
  function Reel(symbols){
    this.symbols=symbols;
    this.root=document.querySelector('#reels');
    this.columns=[];
    this.running=false;
  }

  Reel.prototype.cell=function(cell,r,c){
    const s=this.symbols.get(cell.id);
    const d=document.createElement('div');
    d.className='cell';
    d.dataset.r=r;
    d.dataset.c=c;
    d.dataset.id=s.id;
    d.innerHTML=`<img src="${s.svg}" alt="${s.name}">`;
    if(s.scatter)d.insertAdjacentHTML('beforeend','<span class="scatter-label">SCATTER</span>');
    if(cell.multiplier>0)d.insertAdjacentHTML('beforeend',`<span class="multiplier ${HorusMultiplierEngine.tier(cell.multiplier)}">x${cell.multiplier}</span>`);
    return d;
  };

  Reel.prototype.randomCell=function(mode){
    return {
      id:this.symbols.weighted(mode),
      multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0
    };
  };

  Reel.prototype.render=function(grid){
    this.root.innerHTML='';
    this.root.classList.remove('rolling');
    this.columns=[];

    for(let c=0;c<HorusConfig.COLS;c++){
      const col=document.createElement('div');
      col.className='reel-window final-reel';
      const track=document.createElement('div');
      track.className='reel-track settled';

      for(let r=0;r<HorusConfig.ROWS;r++){
        track.appendChild(this.cell(grid[r][c],r,c));
      }

      col.appendChild(track);
      this.root.appendChild(col);
      this.columns.push({col,track});
    }
  };

  Reel.prototype.measure=function(col){
    const cs=getComputedStyle(col);
    const gap=parseFloat(cs.getPropertyValue('--gap')) || 0;
    const h=col.getBoundingClientRect().height;
    const cellH=(h-gap*(HorusConfig.ROWS-1))/HorusConfig.ROWS;
    return {gap,cellH,step:cellH+gap};
  };

  Reel.prototype.prepareStrip=function(finalCol,mode,count){
    const col=document.createElement('div');
    col.className='reel-window spinning-window';
    const track=document.createElement('div');
    track.className='reel-track spin-strip';

    // A long, dense strip. The visible window is never allowed to expose an
    // empty area during the roll.
    for(let i=0;i<count;i++){
      track.appendChild(this.cell(this.randomCell(mode),i,0));
    }

    // Final result is physically placed at the end of the strip.
    finalCol.forEach((cell,i)=>track.appendChild(this.cell(cell,i,count)));

    col.appendChild(track);
    this.root.appendChild(col);
    return {col,track,count};
  };

  Reel.prototype.animate=function(grid,turbo,mode='NORMAL'){
    if(this.running)return Promise.resolve();

    this.root.innerHTML='';
    this.root.classList.add('rolling');
    this.columns=[];
    this.running=true;

    // More symbols = a longer, more convincing reel travel. Turbo is still
    // visually dense; it simply traverses the strip faster.
    const count=turbo?22:30;
    const base=turbo?620:1500;
    const stagger=turbo?70:125;

    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.prepareStrip(grid.map(row=>row[c]),mode,count);
      this.columns.push(made);
    }

    // The DOM must be laid out before measuring the actual responsive cell
    // height. This avoids percentage-height rounding that previously caused
    // visible gaps on some screen sizes.
    const measurements=this.columns.map(({col})=>this.measure(col));

    this.columns.forEach((item,c)=>{
      const {track,count:travelCount}=item;
      const {cellH,step}=measurements[c];

      track.querySelectorAll('.cell').forEach(el=>{
        el.style.height=`${cellH}px`;
        el.style.minHeight='0';
        el.style.flex='0 0 auto';
      });

      // Start with a completely filled strip. No blank cells exist anywhere
      // inside the viewport while the track is moving.
      track.style.gap=`${measurements[c].gap}px`;
      track.style.transform='translate3d(0,0,0)';
      track.style.transition='none';
      track.style.filter=turbo?'blur(1.15px)':'blur(1.65px)';
      track.style.willChange='transform,filter';

      // Force the initial position to be committed before starting travel.
      void track.offsetHeight;

      const distance=travelCount*step;
      const duration=base+c*stagger;
      const delay=c*stagger;

      track.style.transition=`transform ${duration}ms cubic-bezier(.12,.76,.12,1) ${delay}ms, filter ${Math.min(380,duration)}ms ease-out ${delay}ms`;
      requestAnimationFrame(()=>{
        track.style.transform=`translate3d(0,-${distance}px,0)`;
        track.style.filter='blur(0px)';
      });
    });

    const total=base+stagger*(HorusConfig.COLS-1)+120;

    return new Promise(resolve=>{
      setTimeout(()=>{
        // Replace the moving strip with the authoritative result so the next
        // spin starts from a clean, stable reel state.
        this.running=false;
        this.render(grid);
        resolve();
      },total);
    });
  };

  Reel.prototype.remove=function(){
    document.querySelectorAll('.cell.win').forEach(e=>e.classList.add('removing'));
  };

  window.HorusReelEngine=Reel;
})();
