"use strict";
(function(){
  function WinEngine(symbolEngine){this.symbols=symbolEngine;}
  WinEngine.prototype.findWins=function(grid){ const counts={}; grid.flat().forEach(id=>{if(id!=="scatter") counts[id]=(counts[id]||0)+1;}); return Object.entries(counts).filter(([,n])=>n>=8).map(([id,n])=>({id,n})); };
  WinEngine.prototype.calculate=function(wins,bet){ return wins.reduce((sum,w)=>{const s=this.symbols.get(w.id); const mult=w.n>=20?12:w.n>=16?8:w.n>=12?5:3; return sum+bet*s.value/10*mult;},0); };
  WinEngine.prototype.scatterCount=function(grid){return grid.flat().filter(x=>x==="scatter").length;};
  window.HorusWinEngine=WinEngine;
})();
