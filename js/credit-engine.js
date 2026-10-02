"use strict";
(function(){
  function CreditEngine(start=HorusConfig.STARTING_CREDIT){ this.value=start; }
  CreditEngine.prototype.canAfford=function(amount){ return this.value>=amount; };
  CreditEngine.prototype.spend=function(amount){ if(!this.canAfford(amount)) return false; this.value-=amount; return true; };
  CreditEngine.prototype.add=function(amount){ this.value+=Math.max(0,amount); };
  CreditEngine.prototype.resetIfNeeded=function(){ if(this.value < HorusConfig.RESET_BELOW){ this.value=HorusConfig.STARTING_CREDIT; return true; } return false; };
  window.HorusCreditEngine=CreditEngine;
})();
