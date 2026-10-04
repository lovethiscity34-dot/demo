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
      .reels.rolling .reel-window.reel-active .cell img{filter:blur(1.1px) drop-shadow(0 7px 8px rgba(0,0,0,.45));transform:scaleY(1.08)}
      .reels.rolling .reel-window.reel-slowing .cell{animation:none!important}
      .reels.rolling .reel-window.reel-slowing .reel-track{filter:blur(.7px)}
      .reels.rolling .reel-window.reel-slowing .cell img{filter:blur(.55px) drop-shadow(0 7px 8px rgba(0,0,0,.45));transform:scaleY(1.04)}
      .reels.rolling .reel-window.reel-stopped .cell{animation:none!important}
      .reels.rolling .reel-window.reel-stopped .reel-track{filter:none!important}
      .reels.rolling .reel-window.reel-stopped .cell img{filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))!important;transform:none!important}
      .reels.rolling .reel-window.reel-stopped{box-shadow:inset 0 0 10px rgba(53,217,255,.05)}
      .reels.rolling .reel-window.reel-slowing{box-shadow:inset 0 0 22px rgba(246,198,75,.10)}
    `;
    document.head.appendChild(style);
  };

  Reel.prototype.cell=function(cell,r,c){
    const s=this.symbols.get(cell.id); const d=document.createElement('div'); d.className='cell';
    d.dataset.r=r; d.dataset.c=c; d.dataset.id=s.id;
    d.innerHTML=`<img src="${s.svg}" alt="${s.name}">`;
    if(s.scatter)d.insertAdjacentHTML('beforeend','<span class="scatter-label">SCATTER</span>');
    if(cell.multiplier>0)d.insertAdjacentHTML('beforeend',`<span class="multiplier ${HorusMultiplierEngine.tier(cell.multiplier)}">x${cell.multiplier}</span>`);
    return d;
  };

  Reel.prototype.makeSpinColumn=function(finalCol,mode,count){
    const col=document.createElement('div'); col.className='reel-window reel-active';
    const track=document.createElement('div'); track.className='reel-track';
    // Continuous strip: symbol -> symbol -> symbol, never a blank reel while rolling.
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
    this.ensurePhysicalReelStyle();

    /*
     * PHYSICAL REEL V4
     * -----------------
     * The important difference from the previous versions is that there is
     * ONE continuous motion loop per column. All five columns are moving at
     * the same time. We do NOT let a column finish its whole animation while
     * the others are changing state together.
     *
     * Timeline (normal):
     *   0ms       : C1 C2 C3 C4 C5 all roll
     *   ~1500ms   : C1 brakes -> stops, C2-C5 still roll
     *   ~1800ms   : C2 brakes -> stops, C3-C5 still roll
     *   ~2100ms   : C3 brakes -> stops, C4-C5 still roll
     *   ~2400ms   : C4 brakes -> stops, C5 still rolls
     *   ~2700ms   : C5 brakes -> stops
     *
     * Every reel owns its own blur state. Therefore a stopped reel becomes
     * perfectly sharp while the next reels remain visibly blurred/moving.
     */
    const count=turbo?34:42;
    const pitchGapFallback=6;
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
          const gap=parseFloat(cs.rowGap||cs.gap||'')||parseFloat(cs.columnGap||'')||pitchGapFallback;
          const pitch=first ? first.getBoundingClientRect().height+gap : 0;
          if(!pitch){jobs.push(Promise.resolve());return;}

          /*
           * All reels use the same physical cruise speed. The only difference
           * is WHEN braking starts. This is what makes C2-C5 continue rolling
           * while C1 is already stopped.
           */
          const stopDelay=c*stopGap;
          const cruiseDistance=Math.max(pitch*12,Math.round(cruiseMs*speed));
          const decelDistance=Math.max(pitch*3,Math.round(decelMs*speed*.92));
          const totalDistance=cruiseDistance+decelDistance;

          reelWindow.classList.remove('reel-slowing','reel-stopped');
          reelWindow.classList.add('reel-active');
          track.classList.add('spinning');

          /*
           * The strip contains enough real cells to cover the complete path.
           * We deliberately leave a generous tail so there can never be an
           * empty window while a later reel is still spinning.
           */
          const required=Math.ceil(totalDistance/pitch)+HorusConfig.ROWS+4;
          while(track.children.length<required){
            const item={id:this.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.symbols.rollMultiplier():0};
            track.insertBefore(this.cell(item,0,c),track.lastElementChild);
          }

          const cruise=()=>track.animate(
            [
              {transform:'translate3d(0,0,0)'},
              {transform:`translate3d(0,-${cruiseDistance}px,0)`}
            ],
            {duration:cruiseMs+stopDelay,easing:'linear',fill:'forwards',iterations:1}
          );

          /*
           * All reels are launched immediately. For C2-C5 the linear phase is
           * simply longer. There is NO pause and NO blank frame between phases.
           */
          const cruiseAnim=cruise();

          const job=new Promise(done=>{
            setTimeout(()=>{
              reelWindow.classList.remove('reel-active');
              reelWindow.classList.add('reel-slowing');

              const decelStart=`translate3d(0,-${cruiseDistance}px,0)`;
              const decelEnd=`translate3d(0,-${totalDistance}px,0)`;
              const decel=track.animate(
                [
                  {transform:decelStart},
                  {transform:decelEnd}
                ],
                {duration:decelMs,easing:stopEase,fill:'forwards',iterations:1}
              );

              decel.finished.then(()=>{
                /* Snap only this reel. Other reels are untouched. */
                track.style.transform=decelEnd;
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
