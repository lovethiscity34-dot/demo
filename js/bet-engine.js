"use strict";
(function(){
  function BetEngine(initial=HorusConfig.DEFAULT_BET){ this.value=initial; }
  BetEngine.prototype.next=function(){
    if(this.value < HorusConfig.BET_TRANSITION) return Math.min(HorusConfig.BET_TRANSITION, this.value+HorusConfig.BETS_BELOW_OR_EQUAL_4000_STEP);
    if(this.value===HorusConfig.BET_TRANSITION) return HorusConfig.BET_FIRST_HIGH;
    return this.value*HorusConfig.BET_HIGH_MULTIPLIER;
  };
  BetEngine.prototype.previous=function(){
    if(this.value<=100) return 100;
    if(this.value<=HorusConfig.BET_TRANSITION) return this.value-HorusConfig.BETS_BELOW_OR_EQUAL_4000_STEP;
    if(this.value===HorusConfig.BET_FIRST_HIGH) return HorusConfig.BET_TRANSITION;
    return Math.max(HorusConfig.BET_FIRST_HIGH, Math.floor(this.value/HorusConfig.BET_HIGH_MULTIPLIER));
  };
  BetEngine.prototype.increase=function(){this.value=this.next(); return this.value;};
  BetEngine.prototype.decrease=function(){this.value=this.previous(); return this.value;};
  window.HorusBetEngine=BetEngine;
})();
