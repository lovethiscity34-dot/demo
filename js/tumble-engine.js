"use strict";
(function(){
 function TumbleEngine({engine}){this.engine=engine;}
 TumbleEngine.prototype.run=async function(grid,mode){let total=0,rounds=0;while(rounds<HorusConfig.MAX_TUMBLE_ROUNDS){const found=this.engine.wins.findWins(grid);if(!found.length)break;this.engine.ui.markWins(found);const win=this.engine.wins.calculate(found,this.engine.bet.value,grid);total+=win;this.engine.totalWin+=win;this.engine.ui.addHistory(mode==="SCATTER"?"Scatter Win":"Win kombinasi",win);this.engine.audio.win();await new Promise(r=>setTimeout(r,this.engine.turbo?HorusConfig.TURBO_TUMBLE_DELAY:HorusConfig.NORMAL_WIN_FLASH_DELAY));this.engine.reels.removeWinningSymbols(grid,found);this.engine.reels.collapse(grid,mode);this.engine.reels.render(grid,true);await new Promise(r=>setTimeout(r,this.engine.turbo?HorusConfig.TURBO_TUMBLE_DELAY:HorusConfig.NORMAL_TUMBLE_DELAY));rounds++;}return total;};window.HorusTumbleEngine=TumbleEngine;
})();
