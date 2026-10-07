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
        const s=cells.length>=21?20:cells.length>=17?12:cells.length>=13?7:4;
        out.push({id,cells,mult:s});
      }
    });
    return out;
  };
  Wins.prototype.scatterCount=function(grid){
    let n=0;grid.flat().forEach(c=>{if(c&&c.id==='scatter')n++});return n
  };
  Wins.prototype.payout=function(wins,bet){
    return wins.reduce((a,w)=>a+Math.floor(bet*w.mult*(w.cells.length/8)),0)
  };
  window.HorusWinEngine=Wins;
})();
