"use strict";
(function(){
  function TumbleEngine({reels,wins,bet,getTurbo,markWins,recordWin}){Object.assign(this,{reels,wins,bet,getTurbo,markWins,recordWin});}
  TumbleEngine.prototype.run=async function(grid){let total=0,rounds=0; while(rounds<HorusConfig.MAX_TUMBLE_ROUNDS){const found=this.wins.findWins(grid); if(!found.length) break; this.markWins(found); const win=this.wins.calculate(found,this.bet()); total+=win; this.recordWin(win,found); await new Promise(r=>setTimeout(r,this.getTurbo()?HorusConfig.TURBO_TUMBLE_DELAY:HorusConfig.NORMAL_TUMBLE_DELAY)); this.reels.removeWinningSymbols(grid,found); this.reels.collapse(grid); this.reels.render(grid,true); rounds++;} return total;};
  window.HorusTumbleEngine=TumbleEngine;
})();
