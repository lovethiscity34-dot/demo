"use strict";
(function(){function ScatterMode(engine){this.engine=engine;}ScatterMode.prototype.addFreeSpins=function(n){return HorusConfig.SCATTER_BASE_SPINS+(n>=6?10:(n>=5?5:0));};ScatterMode.prototype.spin=async function(){return this.engine._runSpin({free:true,mode:"SCATTER"});};window.HorusScatterMode=ScatterMode;})();
