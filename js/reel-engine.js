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
    const count=turbo?22:30;
    // Semua kolom mulai bersamaan. Perbedaan hanya pada berapa lama fase cruise
    // berlangsung; kolom berikutnya melakukan 1 putaran ekstra sehingga tetap bergerak
    // saat kolom sebelumnya sudah masuk fase deselerasi.
    const decelMs=turbo?240:420;
    const settle=turbo?100:180;
    const stopEase='cubic-bezier(.08,.72,.16,1)';
    const spinSpeed=turbo?1.35:0.92;

    this.root.innerHTML=''; this.root.classList.add('rolling'); this.columns=[]; this.running=true;
    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.makeSpinColumn(grid.map(row=>row[c]),mode,count);
      this.root.appendChild(made.col); this.columns.push(made);
      made.track.style.transition='none';
      made.track.style.transform='translate3d(0,0,0)';
    }

    return new Promise(resolve=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        const finishPromises=[];

        this.columns.forEach(({track,count},c)=>{
          const first=track.querySelector('.cell');
          const cs=getComputedStyle(track);
          const gap=parseFloat(cs.rowGap||cs.gap||'0')||0;
          const pitch=first?first.getBoundingClientRect().height+gap:0;
          if(!pitch){finishPromises.push(Promise.resolve());return}

          const baseDistance=count*pitch;
          // Setiap column berikutnya mendapat satu siklus simbol ekstra.
          // Karena kecepatannya sama, semua mulai bersama tetapi stop terlihat berurutan.
          const extraCycles=c;
          const totalDistance=baseDistance + extraCycles*(HorusConfig.ROWS*pitch);
          const decelDistance=Math.max(pitch*2.5,Math.min(pitch*3.5,totalDistance-pitch));
          const cruiseDistance=Math.max(pitch,totalDistance-decelDistance);
          const cruiseDuration=Math.max(760,Math.round(cruiseDistance/spinSpeed));

          // Setiap reel punya status visual sendiri. Ini penting agar setelah
          // column 1 berhenti, blur/rolling column 1 langsung hilang sementara
          // column 2-5 tetap terlihat benar-benar bergerak.
          const reelWindow=this.columns[c].col;
          reelWindow.classList.add('reel-active');
          reelWindow.classList.remove('reel-slowing','reel-stopped');

          track.style.setProperty('--spin-distance',`${totalDistance}px`);
          track.style.setProperty('--spin-duration',`${cruiseDuration+decelMs}ms`);
          track.style.setProperty('--spin-delay','0ms');
          track.classList.add('spinning');

          // Fase 1 — semua column bergerak bersamaan dengan kecepatan konstan.
          const cruise=track.animate(
            [
              {transform:'translate3d(0,0,0)'},
              {transform:`translate3d(0,-${cruiseDistance}px,0)`}
            ],
            {duration:cruiseDuration,easing:'linear',fill:'forwards',iterations:1}
          );

          // Fase 2 — hanya setelah cruise masing-masing selesai, column masuk fast→slow.
          const finish=cruise.finished.then(()=>{
            // Hanya reel yang akan berhenti yang masuk fase slow-down.
            // Reel setelahnya tetap dalam cruise penuh sampai gilirannya.
            reelWindow.classList.remove('reel-active');
            reelWindow.classList.add('reel-slowing');

            const decel=track.animate(
              [
                {transform:`translate3d(0,-${cruiseDistance}px,0)`},
                {transform:`translate3d(0,-${totalDistance}px,0)`}
              ],
              {duration:decelMs,easing:stopEase,fill:'forwards',iterations:1}
            );
            return decel.finished.then(()=>{
              // Reel benar-benar sudah terkunci. Hapus blur hanya dari reel ini,
              // bukan dari seluruh machine.
              track.style.transform=`translate3d(0,-${totalDistance}px,0)`;
              track.classList.remove('spinning');
              reelWindow.classList.remove('reel-slowing','reel-active');
              reelWindow.classList.add('reel-stopped');
            }).catch(()=>null);
          }).catch(()=>null);

          finishPromises.push(finish);
        });

        Promise.all(finishPromises).then(()=>{
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
