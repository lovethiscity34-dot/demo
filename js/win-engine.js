(function(){
  function Wins(){}
  Wins.prototype.find=function(grid,mode){
    const out=[],counts={},needed=7;
    for(let r=0;r<HorusConfig.ROWS;r++)for(let c=0;c<HorusConfig.COLS;c++){
      const cell=grid[r][c];
      if(!cell||cell.id==='scatter')continue;
      (counts[cell.id]??=[]).push({r,c});
    }
    Object.entries(counts).forEach(([id,cells])=>{
      if(cells.length>=needed){
        const s=cells.length>=21?12:cells.length>=17?8:cells.length>=13?5:3;
        out.push({id,cells,mult:s});
      }
    });
    return out;
  };
  Wins.prototype.scatterCount=function(grid){
    const seen=new Set();let best=0;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let r=0;r<HorusConfig.ROWS;r++)for(let c=0;c<HorusConfig.COLS;c++){
      const key=r+':'+c;if(!grid[r][c]||grid[r][c].id!=='scatter'||seen.has(key))continue;
      const q=[[r,c]];seen.add(key);let size=0;
      while(q.length){const [rr,cc]=q.shift();size++;for(const [dr,dc] of dirs){const nr=rr+dr,nc=cc+dc,k=nr+':'+nc;if(nr>=0&&nr<HorusConfig.ROWS&&nc>=0&&nc<HorusConfig.COLS&&!seen.has(k)&&grid[nr][nc]&&grid[nr][nc].id==='scatter'){seen.add(k);q.push([nr,nc])}}}
      best=Math.max(best,size);
    }
    return best
  };
  Wins.prototype.payout=function(wins,bet){
    return wins.reduce((a,w)=>a+Math.floor(bet*w.mult*(w.cells.length/8)),0)
  };
  window.HorusWinEngine=Wins;
})();
