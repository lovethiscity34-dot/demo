"use strict";
(function(){
 const symbols=[
  {id:"eye",name:"Mata Horus",value:8,svg:"#sym-eye"},{id:"ankh",name:"Ankh",value:12,svg:"#sym-ankh"},
  {id:"scarab",name:"Scarab",value:18,svg:"#sym-scarab"},{id:"sun",name:"Matahari Ra",value:25,svg:"#sym-sun"},
  {id:"falcon",name:"Elang Horus",value:40,svg:"#sym-falcon"},{id:"crown",name:"Mahkota Firaun",value:60,svg:"#sym-crown"},
  {id:"lotus",name:"Lotus",value:85,svg:"#sym-lotus"},{id:"horus",name:"Horus",value:150,svg:"#sym-horus"},
  {id:"scatter",name:"SCATTER",value:0,svg:"#sym-scatter",scatter:true}
 ];
 function SymbolEngine(){this.symbols=symbols;}
 SymbolEngine.prototype.get=function(id){return this.symbols.find(s=>s.id===id)||symbols[0];};
 SymbolEngine.prototype.weighted=function(scatterProb){const bag=scatterProb===HorusConfig.SCATTER_SCATTER_PROB?HorusConfig.SCATTER_SYMBOL_BAG:HorusConfig.SYMBOL_BAG;if(Math.random()<scatterProb)return "scatter";return bag[Math.floor(Math.random()*bag.length)];};
 SymbolEngine.prototype.randomGrid=function(mode){const p=mode==="SCATTER"?HorusConfig.SCATTER_SCATTER_PROB:HorusConfig.NORMAL_SCATTER_PROBABILITY;return Array.from({length:HorusConfig.ROWS},()=>Array.from({length:HorusConfig.COLS},()=>this.weighted(p)));};
 window.HorusSymbolEngine=SymbolEngine;
})();
