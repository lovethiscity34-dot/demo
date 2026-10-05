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
    // Scatter trigger/retrigger uses TOTAL Scatter symbols on the 5x5 result.
    // Any 4 or more Scatter symbols count, regardless of position/adjacency.
    let count=0;
    for(let r=0;r<HorusConfig.ROWS;r++)for(let c=0;c<HorusConfig.COLS;c++){
      if(grid[r][c]&&grid[r][c].id==='scatter')count++;
    }
    return count;
  };
  Wins.prototype.payout=function(wins,bet){
    return wins.reduce((a,w)=>a+Math.floor(bet*w.mult*(w.cells.length/8)),0)
  };
  window.HorusWinEngine=Wins;
})();
