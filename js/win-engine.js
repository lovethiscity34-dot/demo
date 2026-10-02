"use strict";
(function(){
 function WinEngine(symbolEngine){this.symbols=symbolEngine;}
 WinEngine.prototype.findWins=function(grid){
  const counts={};
  grid.flat().forEach(id=>{if(id!=="scatter"&&id)counts[id]=(counts[id]||0)+1;});
  return Object.entries(counts).filter(([,n])=>n>=HorusConfig.NORMAL_MIN_MATCH).map(([id,n])=>({id,n,cells:grid.reduce((a,row,r)=>{row.forEach((v,c)=>{if(v===id)a.push({r,c})});return a},[])}));
 };
 WinEngine.prototype.calculate=function(wins,bet,grid){
  return Math.floor(wins.reduce((sum,w)=>{const s=this.symbols.get(w.id);const mult=w.n>=20?12:w.n>=16?8:w.n>=12?5:3;let local=bet*s.value/10*mult;if(grid){const ms=w.cells.map(p=>grid[p.r][p.c].multiplier||1);local*=Math.max(1,...ms);}return sum+local;},0));
 };
 WinEngine.prototype.scatterCount=function(grid){return grid.flat().filter(x=>x==="scatter").length;};
 window.HorusWinEngine=WinEngine;
})();
