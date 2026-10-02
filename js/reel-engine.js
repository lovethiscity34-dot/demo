"use strict";
(function(){
  function ReelEngine(symbolEngine){this.symbols=symbolEngine;}
  ReelEngine.prototype.createCell=function(id,fresh=false){const s=this.symbols.get(id); const d=document.createElement("div"); d.className="cell"+(fresh?" new":""); d.dataset.id=id; d.innerHTML=`<svg viewBox="0 0 100 100" aria-label="${s.name}"><use href="${s.svg}"></use></svg>`; return d;};
  ReelEngine.prototype.render=function(grid,fresh=false){const root=document.querySelector("#reels"); root.innerHTML=""; for(let c=0;c<HorusConfig.COLS;c++){const reel=document.createElement("div"); reel.className="reel"; for(let r=0;r<HorusConfig.ROWS;r++) reel.appendChild(this.createCell(grid[r][c],fresh)); root.appendChild(reel);} };
  ReelEngine.prototype.removeWinningSymbols=function(grid,wins){const remove=new Set(wins.map(w=>w.id)); for(let r=0;r<HorusConfig.ROWS;r++) for(let c=0;c<HorusConfig.COLS;c++) if(remove.has(grid[r][c])) grid[r][c]=null;};
  ReelEngine.prototype.collapse=function(grid){for(let c=0;c<HorusConfig.COLS;c++){const kept=[]; for(let r=HorusConfig.ROWS-1;r>=0;r--) if(grid[r][c]!=null) kept.push(grid[r][c]); while(kept.length<HorusConfig.ROWS) kept.push(this.symbols.weighted()); for(let r=HorusConfig.ROWS-1,i=0;r>=0;r--,i++) grid[r][c]=kept[i];}};
  window.HorusReelEngine=ReelEngine;
})();
