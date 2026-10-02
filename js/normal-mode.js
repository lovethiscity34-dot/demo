"use strict";
(function(){
  function NormalMode(engine){this.engine=engine;}
  NormalMode.prototype.spin=async function(){return this.engine._runSpin({free:false,mode:"NORMAL"});};
  window.HorusNormalMode=NormalMode;
})();
