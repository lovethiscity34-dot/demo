(function(){
  function tier(n){if(n<=9)return'green';if(n<=19)return'blue';if(n<=49)return'purple';if(n<=99)return'magenta';if(n<=249)return'gold';if(n<=499)return'cyan';if(n<=999)return'solar';return'divine'}
  function resolveWinning(values){
    const valid=(values||[]).filter(v=>Number(v)>0);
    if(!valid.length)return{multiplier:1,count:0,tier:'green'};
    const max=Math.max.apply(Math,valid);
    return{multiplier:max,count:valid.length,tier:tier(max)};
  }
  // Kept for compatibility with older code: this now resolves only supplied valid values.
  function resolve(grid){
    const values=[];
    (grid||[]).flat().forEach(c=>{if(c&&c.multiplier>0)values.push(c.multiplier)});
    return resolveWinning(values);
  }
  window.HorusMultiplierEngine={tier,resolveWinning,resolve};
})();