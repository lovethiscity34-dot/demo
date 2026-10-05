(function(){
  function tier(n){if(n<=9)return'green';if(n<=19)return'blue';if(n<=49)return'purple';if(n<=99)return'magenta';if(n<=249)return'gold';if(n<=499)return'cyan';if(n<=999)return'solar';return'divine'}
  function resolve(grid){let max=1,count=0;grid.flat().forEach(c=>{if(c&&c.multiplier>0&&c.id!=='scatter'){count++;max=Math.max(max,c.multiplier)}});return{multiplier:max,count}}
  function resolveWinning(list){let max=1,count=0;(list||[]).forEach(n=>{if(Number(n)>0){count++;max=Math.max(max,Number(n))}});return{multiplier:max,count}}
  window.HorusMultiplierEngine={tier,resolve,resolveWinning};
})();
