(function(){
  const defs=[
    ['eye','Eye of Horus',1,9],['ankh','Ankh',1.1,9],['scarab','Scarab',1.2,8],['sun','Solar Disc',1.35,7],
    ['falcon','Falcon',1.6,6],['crown','Royal Crown',2,5],['lotus','Lotus',2.4,4],['horus','Horus',3.2,3],['scatter','Scatter',0,0]
  ];
  function Symbols(){this.symbols=defs.map(x=>({id:x[0],name:x[1],value:x[2],weight:x[3],scatter:x[0]==='scatter',svg:`assets/symbols/${x[0]}.svg`}));}
  Symbols.prototype.get=function(id){return this.symbols.find(s=>s.id===id)||this.symbols[0]};
  Symbols.prototype.weighted=function(mode){
    const pool=[]; this.symbols.forEach(s=>{if(s.scatter)return;for(let i=0;i<s.weight;i++)pool.push(s.id)});
    const p=mode==='SCATTER'?HorusConfig.SCATTER_SCATTER_PROBABILITY:HorusConfig.NORMAL_SCATTER_PROBABILITY;
    if(Math.random()<p)return 'scatter';
    return pool[(Math.random()*pool.length)|0];
  };
  Symbols.prototype.randomGrid=function(mode){
    return Array.from({length:HorusConfig.ROWS},()=>Array.from({length:HorusConfig.COLS},()=>{
      const id=this.weighted(mode);
      return {id,multiplier:mode==='SCATTER'&&id!=='scatter'?this.rollMultiplier():0};
    }));
  };
  Symbols.prototype.rollMultiplier=function(){
    if(Math.random()>.01)return 0; const r=Math.random();
    if(r<.64)return 1+((Math.random()*9)|0); if(r<.84)return 10+((Math.random()*10)|0); if(r<.94)return 20+((Math.random()*30)|0);
    if(r<.975)return 50+((Math.random()*50)|0); if(r<.992)return 100+((Math.random()*150)|0); if(r<.998)return 250+((Math.random()*250)|0); if(r<.9997)return 500+((Math.random()*500)|0); return 1000;
  };
  window.HorusSymbolEngine=Symbols;
})();
