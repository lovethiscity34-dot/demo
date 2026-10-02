"use strict";
(function(){
  function ScatterMode(engine){this.engine=engine;}
  ScatterMode.prototype.addFreeSpins=function(scatterCount){ return HorusConfig.SCATTER_BASE_SPINS + (scatterCount>=6 ? 10 : 5); };
  ScatterMode.prototype.spin=async function(){ return this.engine._runSpin({free:true,mode:"SCATTER"}); };
  window.HorusScatterMode=ScatterMode;
})();
