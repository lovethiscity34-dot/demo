(function(){
  function Reel(symbols){this.symbols=symbols;this.root=document.querySelector('#reels');this.columns=[];this.running=false}

  Reel.prototype.ensurePhysicalReelStyle=function(){
    if(document.getElementById('horus-physical-reel-v3'))return;
    const style=document.createElement('style');
    style.id='horus-physical-reel-v3';
    style.textContent=`
      /* Physical reel stagger v3: rolling/blur is controlled per column. */
      .reels.rolling .reel-window.reel-active .cell{animation:none!important}
      .reels.rolling .reel-window.reel-active .reel-track{filter:blur(1.5px)}
      .reels.rolling .reel-window.reel-active .cell img{filter:blur(1.1px) drop-shadow(0 7px 8px rgba(0,0,0,.45));transform:translate(-50%,-50%) scaleY(1.08)}
      .reels.rolling .reel-window.reel-slowing .cell{animation:none!important}
      .reels.rolling .reel-window.reel-slowing .reel-track{filter:blur(.7px)}
      .reels.rolling .reel-window.reel-slowing .cell img{filter:blur(.55px) drop-shadow(0 7px 8px rgba(0,0,0,.45));transform:translate(-50%,-50%) scaleY(1.04)}
      .reels.rolling .reel-window.reel-stopped .cell{animation:none!important}
      .reels.rolling .reel-window.reel-stopped .reel-track{filter:none!important}
      .reels.rolling .reel-window.reel-stopped .cell img{filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))!important;transform:translate(-50%,-50%)!important}
      /* Mobile/tablet cells use normal grid centering, so do not apply the desktop
         absolute-position translate(-50%,-50%) correction there. */
      @media (max-width:850px){
        .reels.rolling .reel-window.reel-active .cell img{transform:scaleY(1.08)!important}
        .reels.rolling .reel-window.reel-slowing .cell img{transform:scaleY(1.04)!important}
        .reels.rolling .reel-window.reel-stopped .cell img{transform:none!important}
      }
      .reels.rolling .reel-window.reel-stopped{box-shadow:inset 0 0 10px rgba(53,217,255,.05)}
      .reels.rolling .reel-window.reel-slowing{box-shadow:inset 0 0 22px rgba(246,198,75,.10)}
    `;
    document.head.appendChild(style);
  };

  Reel.prototype.cell=function(cell,r,c){
    const s=this.symbols.get(cell.id); const d=document.createElement('div'); d.className='cell';
    d.dataset.r=r; d.dataset.c=c; d.dataset.id=s.id;
    d.innerHTML=`<img src="${s.png}" alt="${s.name}">`;
    if(s.scatter)d.insertAdjacentHTML('beforeend','<span class="scatter-label">SCATTER</span>');
    if(cell.multiplier>0)d.insertAdjacentHTML('beforeend',`<span class="multiplier ${HorusMultiplierEngine.tier(cell.multiplier)}">x${cell.multiplier}</span>`);
    return d;
  };

  Reel.prototype.makeSpinColumn=function(finalCol,mode,count){
    const col=document.createElement('div'); col.className='reel-window reel-active';
    const track=document.createElement('div'); track.className='reel-track';
    // Physical direction is TOP -> BOTTOM. Final symbols are placed first,
    // above the viewport, then a continuous filler strip follows them.
    // The track travels from a negative Y position toward 0, so symbols
    // continuously enter from the TOP and leave through the BOTTOM.
    finalCol.forEach((cell,i)=>track.appendChild(this.cell(cell,i,0)));
    for(let i=0;i<count;i++){
      const filler={id:this.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0};
      track.appendChild(this.cell(filler,i,count));
    }
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
    this.ensurePhysicalReelStyle();

    /* PHYSICAL REEL V5
     * All reels start together and move continuously TOP -> BOTTOM.
     * Each later reel receives a longer cruise phase, so it is still visibly
     * rolling while the previous reel has already stopped. No blank reel is
     * shown between stops.
     */
    const count=turbo?42:52;
    const cruiseMs=turbo?1050:1450;
    const stopGap=turbo?190:300;
    const decelMs=turbo?260:430;
    const settle=turbo?90:140;
    const speed=turbo?1.55:1.25;
    const stopEase='cubic-bezier(.12,.76,.18,1)';

    this.root.innerHTML='';
    this.root.classList.add('rolling');
    this.columns=[];
    this.running=true;

    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.makeSpinColumn(grid.map(row=>row[c]),mode,count);
      made.col.className='reel-window reel-active';
      made.track.style.transition='none';
      made.track.style.animation='none';
      made.track.style.transform='translate3d(0,0,0)';
      this.root.appendChild(made.col);
      this.columns.push(made);
    }

    return new Promise(resolve=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        const jobs=[];

        this.columns.forEach(({track,count},c)=>{
          const reelWindow=this.columns[c].col;
          const first=track.querySelector('.cell');
          const cs=getComputedStyle(track);
          const gap=parseFloat(cs.rowGap||cs.gap||'')||parseFloat(cs.columnGap||'')||6;
          const pitch=first ? first.getBoundingClientRect().height+gap : 0;
          if(!pitch){jobs.push(Promise.resolve());return;}

          // Start far enough above the viewport that there is always a full
          // stream of symbols while the reel is travelling downward.
          const cruiseDistance=Math.max(pitch*18,Math.round(cruiseMs*speed));
          const decelDistance=Math.max(pitch*3,Math.round(decelMs*speed*.92));
          const totalDistance=cruiseDistance+decelDistance;
          const startY=-totalDistance;
          const cruiseY=-(decelDistance);
          const endY=0;
          const stopDelay=c*stopGap;

          reelWindow.classList.remove('reel-slowing','reel-stopped');
          reelWindow.classList.add('reel-active');
          track.classList.add('spinning');

          // Extend the filler strip so no later reel can ever expose an empty
          // area before its own stop.
          const required=Math.ceil(totalDistance/pitch)+HorusConfig.ROWS+6;
          while(track.children.length<required){
            const item={id:this.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0};
            track.appendChild(this.cell(item,0,c));
          }

          // Initial position is ABOVE the window. Positive Y movement brings
          // symbols DOWN through the viewport, exactly like the requested
          // physical slot direction.
          track.style.transform=`translate3d(0,${startY}px,0)`;

          const cruise=track.animate(
            [
              {transform:`translate3d(0,${startY}px,0)`},
              {transform:`translate3d(0,${cruiseY}px,0)`}
            ],
            {duration:cruiseMs+stopDelay,easing:'linear',fill:'forwards',iterations:1}
          );

          const job=new Promise(done=>{
            setTimeout(()=>{
              reelWindow.classList.remove('reel-active');
              reelWindow.classList.add('reel-slowing');

              const decel=track.animate(
                [
                  {transform:`translate3d(0,${cruiseY}px,0)`},
                  {transform:`translate3d(0,${endY}px,0)`}
                ],
                {duration:decelMs,easing:stopEase,fill:'forwards',iterations:1}
              );

              decel.finished.then(()=>{
                track.style.transform=`translate3d(0,${endY}px,0)`;
                track.classList.remove('spinning');
                reelWindow.classList.remove('reel-slowing','reel-active');
                reelWindow.classList.add('reel-stopped');
                done();
              }).catch(()=>done());
            },cruiseMs+stopDelay);
          });
          jobs.push(job);
        });

        Promise.all(jobs).then(()=>{
          this.root.classList.remove('rolling');
          setTimeout(()=>{
            this.running=false;
            this.render(grid);
            resolve();
          },settle);
        });
      }));
    });
  };

  /*
   * Real tumble / gravity:
   * - winning cells disappear first;
   * - surviving cells keep their order and fall toward the bottom;
   * - only the empty spaces at the TOP receive new symbols;
   * - new symbols enter from above and fall into those spaces.
   * FLIP animation is used so the movement is smooth instead of snapping.
   */
  Reel.prototype.tumble=async function(grid,wins,mode='NORMAL',turbo=false){
    const winKeys=new Set();
    wins.forEach(w=>w.cells.forEach(p=>winKeys.add(`${p.r}:${p.c}`)));
    const removeWait=turbo?300:560;
    const fallDuration=turbo?380:620;
    const stagger=turbo?35:55;

    this.root.classList.add('tumbling');
    document.querySelectorAll('.cell.win').forEach(el=>el.classList.add('removing'));
    await new Promise(r=>setTimeout(r,removeWait));

    for(let c=0;c<HorusConfig.COLS;c++){
      const col=this.columns[c]||{};
      const track=col.track||this.root.querySelectorAll('.reel-window')[c]?.querySelector('.reel-track');
      if(!track)continue;

      const current=Array.from(track.children);
      const oldByKey=new Map();
      current.forEach(el=>oldByKey.set(`${el.dataset.r}:${el.dataset.c}`,el));

      const survivors=[];
      for(let r=0;r<HorusConfig.ROWS;r++){
        if(!winKeys.has(`${r}:${c}`) && grid[r][c]) survivors.push({cell:grid[r][c],el:oldByKey.get(`${r}:${c}`)});
      }

      // Keep survivor order exactly as it was, then pack them at the bottom.
      const newCount=HorusConfig.ROWS-survivors.length;
      const fresh=[];
      for(let i=0;i<newCount;i++){
        const item={id:this.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0};
        fresh.push(item);
      }

      const beforeRects=new Map();
      survivors.forEach(s=>{if(s.el)beforeRects.set(s.el,s.el.getBoundingClientRect())});

      // Remove only the winning DOM nodes. Survivors are reused, not recreated.
      current.forEach(el=>{if(winKeys.has(`${el.dataset.r}:${el.dataset.c}`))el.remove()});

      // Final column order: NEW symbols at the top, existing survivors at the bottom.
      const finalCells=[];
      fresh.forEach((item,i)=>{
        const el=this.cell(item,i,c);
        el.classList.add('tumble-new');
        track.appendChild(el);
        finalCells.push({cell:item,el,isNew:true,index:i});
      });
      survivors.forEach((s,i)=>{
        const row=newCount+i;
        s.el.dataset.r=row;s.el.dataset.c=c;s.el.dataset.id=s.cell.id;
        s.el.classList.remove('win','removing');
        track.appendChild(s.el);
        finalCells.push({cell:s.cell,el:s.el,isNew:false,index:row});
      });

      // Build the new grid now, while the visual animation is still running.
      for(let r=0;r<HorusConfig.ROWS;r++)grid[r][c]=finalCells[r].cell;

      // FLIP: surviving symbols animate from their old screen position to the new row.
      finalCells.forEach(item=>{
        const el=item.el;
        const finalRect=el.getBoundingClientRect();
        let offset=0;
        if(item.isNew){
          const pitch=finalRect.height + (parseFloat(getComputedStyle(track).rowGap||getComputedStyle(track).gap||'0')||0);
          offset=-(newCount-item.index)*pitch;
        }else{
          const oldRect=beforeRects.get(el);
          if(oldRect)offset=oldRect.top-finalRect.top;
        }
        el.style.transition='none';
        el.style.transform=`translate3d(0,${offset}px,0)`;
        el.style.willChange='transform';
      });

      // Force the browser to commit the initial transform before animating.
      track.getBoundingClientRect();
      finalCells.forEach((item,i)=>{
        const el=item.el;
        requestAnimationFrame(()=>{
          el.style.transition=`transform ${fallDuration}ms cubic-bezier(.16,.84,.22,1) ${i*stagger}ms`;
          el.style.transform='translate3d(0,0,0)';
        });
      });

      await new Promise(r=>setTimeout(r,fallDuration+stagger*(HorusConfig.ROWS-1)+30));
      finalCells.forEach(item=>{item.el.style.transition='';item.el.style.transform='';item.el.style.willChange='';item.el.classList.remove('tumble-new')});
    }

    this.root.classList.remove('tumbling');
    this.render(grid);
    return grid;
  };

  Reel.prototype.remove=function(){document.querySelectorAll('.cell.win').forEach(e=>e.classList.add('removing'))};
  window.HorusReelEngine=Reel;
})();
