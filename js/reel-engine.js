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
    const count=turbo?22:30;
    // Semua kolom MULAI bersamaan. Perbedaan hanya terjadi pada waktu STOP.
    const baseDuration=turbo?Math.max(620,HorusConfig.TURBO_REEL_ROLL_DURATION):Math.max(1350,HorusConfig.REEL_ROLL_DURATION);
    const stopStagger=turbo?Math.max(80,HorusConfig.TURBO_REEL_STOP_STAGGER):Math.max(150,HorusConfig.REEL_STOP_STAGGER);
    const settle=turbo?Math.max(110,HorusConfig.REEL_SETTLE):Math.max(220,HorusConfig.REEL_SETTLE);
    const stopEase='cubic-bezier(.08,.70,.18,1)';

    this.root.innerHTML=''; this.root.classList.add('rolling'); this.columns=[]; this.running=true;
    for(let c=0;c<HorusConfig.COLS;c++){
      const made=this.makeSpinColumn(grid.map(row=>row[c]),mode,count);
      this.root.appendChild(made.col); this.columns.push(made);
      // Matikan transition lama per kolom. Animasi spin dikendalikan langsung oleh WAAPI
      // agar seluruh kolom mulai bersamaan tetapi selesai secara berurutan.
      made.track.style.transition='none';
      made.track.style.transform='translate3d(0,0,0)';
    }

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const animations=[];
      this.columns.forEach(({track,count},c)=>{
        const first=track.querySelector('.cell');
        const cs=getComputedStyle(track);
        const gap=parseFloat(cs.rowGap||cs.gap||'0')||0;
        const pitch=first?first.getBoundingClientRect().height+gap:0;
        const distance=Math.max(0,count*pitch);
        const duration=baseDuration + c*stopStagger;

        track.style.setProperty('--spin-distance',`${distance}px`);
        track.style.setProperty('--spin-duration',`${duration}ms`);
        track.style.setProperty('--spin-delay','0ms');
        track.classList.add('spinning');

        // Semua animation.play() dipanggil pada frame yang sama.
        // Column 1 selesai dulu, lalu column 2, dst.
        const anim=track.animate(
          [
            {transform:'translate3d(0,0,0)'},
            {transform:`translate3d(0,-${distance}px,0)`}
          ],
          {duration,easing:stopEase,fill:'forwards',iterations:1}
        );
        animations.push(anim);
      });

      Promise.all(animations.map(a=>a.finished.catch(()=>null))).then(()=>{
        this.root.classList.remove('rolling');
      });
    }));

    const total=baseDuration+stopStagger*(HorusConfig.COLS-1)+settle+80;
    return new Promise(res=>setTimeout(()=>{
      this.running=false;
      this.render(grid);
      res();
    },total));
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
