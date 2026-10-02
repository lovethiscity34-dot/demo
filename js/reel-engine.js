"use strict";
(function(){
  function ReelEngine(symbolEngine){this.symbols=symbolEngine; this.root=document.querySelector("#reels");}

  ReelEngine.prototype.createCell=function(id,fresh=false){
    const s=this.symbols.get(id);
    const d=document.createElement("div");
    d.className="cell"+(fresh?" new":"");
    d.dataset.id=id;
    d.innerHTML=`<svg viewBox="0 0 100 100" aria-label="${s.name}"><use href="${s.svg}"></use></svg>`;
    return d;
  };

  ReelEngine.prototype.render=function(grid,fresh=false){
    this.root.innerHTML="";
    for(let c=0;c<HorusConfig.COLS;c++){
      const reel=document.createElement("div"); reel.className="reel";
      for(let r=0;r<HorusConfig.ROWS;r++) reel.appendChild(this.createCell(grid[r][c],fresh));
      this.root.appendChild(reel);
    }
  };

  ReelEngine.prototype._setColumn=function(c,ids){
    const reel=this.root.children[c];
    if(!reel) return;
    for(let r=0;r<HorusConfig.ROWS;r++){
      const cell=reel.children[r], id=ids[r], s=this.symbols.get(id);
      cell.dataset.id=id;
      cell.innerHTML=`<svg viewBox="0 0 100 100" aria-label="${s.name}"><use href="${s.svg}"></use></svg>`;
    }
  };

  ReelEngine.prototype._randomColumn=function(){
    return Array.from({length:HorusConfig.ROWS},()=>this.symbols.weighted());
  };

  // Normal mode: all reels roll, then stop from left to right.
  ReelEngine.prototype.animateSpin=async function(finalGrid,turbo=false){
    this.render(this._randomGrid(),false);
    const step=turbo?55:HorusConfig.NORMAL_ROLL_STEP;
    const gap=turbo?35:HorusConfig.NORMAL_REEL_STOP_GAP;
    const cycles=turbo?2:4;
    const stopPromises=[];
    const rolling=new Array(HorusConfig.COLS).fill(true);
    Array.from(this.root.children).forEach(reel=>reel.classList.add("rolling"));

    for(let c=0;c<HorusConfig.COLS;c++){
      const promise=(async()=>{
        for(let i=0;i<cycles+c;i++){
          if(!rolling[c]) break;
          this._setColumn(c,this._randomColumn());
          await new Promise(r=>setTimeout(r,step));
        }
        rolling[c]=false;
        this._setColumn(c,finalGrid.map(row=>row[c]));
        const reel=this.root.children[c];
        if(reel){reel.classList.remove("rolling"); reel.classList.add("stopped"); setTimeout(()=>reel.classList.remove("stopped"),220);}
      })();
      stopPromises.push(promise);
      if(c< HorusConfig.COLS-1) await new Promise(r=>setTimeout(r,gap));
    }
    await Promise.all(stopPromises);
    this.render(finalGrid,false);
  };

  ReelEngine.prototype._randomGrid=function(){
    return Array.from({length:HorusConfig.ROWS},()=>Array.from({length:HorusConfig.COLS},()=>this.symbols.weighted()));
  };

  ReelEngine.prototype.removeWinningSymbols=function(grid,wins){
    const remove=new Set(wins.map(w=>w.id));
    for(let r=0;r<HorusConfig.ROWS;r++) for(let c=0;c<HorusConfig.COLS;c++) if(remove.has(grid[r][c])) grid[r][c]=null;
  };

  ReelEngine.prototype.collapse=function(grid){
    for(let c=0;c<HorusConfig.COLS;c++){
      const kept=[];
      for(let r=HorusConfig.ROWS-1;r>=0;r--) if(grid[r][c]!=null) kept.push(grid[r][c]);
      while(kept.length<HorusConfig.ROWS) kept.push(this.symbols.weighted());
      for(let r=HorusConfig.ROWS-1,i=0;r>=0;r--,i++) grid[r][c]=kept[i];
    }
  };

  window.HorusReelEngine=ReelEngine;
})();
