"use strict";
(function(){
 const M={
  roll(){const r=Math.random();if(r>HorusConfig.MULTIPLIER_PROBABILITY)return 1;if(r<0.00015)return 1000;if(r<0.0008)return 500+Math.floor(Math.random()*500);if(r<0.0025)return 250+Math.floor(Math.random()*250);if(r<0.008)return 100+Math.floor(Math.random()*150);if(r<0.02)return 50+Math.floor(Math.random()*50);if(r<0.045)return 20+Math.floor(Math.random()*30);if(r<0.075)return 10+Math.floor(Math.random()*10);return 1+Math.floor(Math.random()*9);},
  tier(x){if(x<=9)return"m-green";if(x<=19)return"m-blue";if(x<=49)return"m-purple";if(x<=99)return"m-magenta";if(x<=249)return"m-gold";if(x<=499)return"m-cyan";if(x<=999)return"m-solar";return"m-divine";},
  decorate(grid){let max=1;for(let r=0;r<HorusConfig.ROWS;r++)for(let c=0;c<HorusConfig.COLS;c++){if(grid[r][c].id!=="scatter"){const m=this.roll();grid[r][c].multiplier=m;if(m>max)max=m;}}return max;}
 };window.HorusMultiplierEngine=M;
})();
