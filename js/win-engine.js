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
    const seen=new Set(), comps=[]; const rows=HorusConfig.ROWS, cols=HorusConfig.COLS; const key=(r,c)=>r+','+c;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const cell=grid[r]&&grid[r][c];if(!cell||cell.id!=='scatter'||seen.has(key(r,c)))continue;const q=[[r,c]];seen.add(key(r,c));let count=0;while(q.length){const [cr,cc]=q.shift();count++;for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=cr+dr,nc=cc+dc,k=key(nr,nc);if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!seen.has(k)&&grid[nr][nc]&&grid[nr][nc].id==='scatter'){seen.add(k);q.push([nr,nc]);}}}comps.push(count)}
    return comps.length?Math.max(...comps):0;
  };
  Wins.prototype.payout=function(wins,bet){
    return wins.reduce((a,w)=>a+Math.floor(bet*w.mult*(w.cells.length/8)),0)
  };
  window.HorusWinEngine=Wins;
})();
