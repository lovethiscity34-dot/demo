(function(){function Tumble(game){this.game=game}
Tumble.prototype.run=async function(grid,mode){let total=0;for(let round=0;round<HorusConfig.MAX_TUMBLE_ROUNDS;round++){
  this.game.setState(HorusGameState.WIN_CHECK);const wins=this.game.wins.find(grid,mode);if(!wins.length)break;
  this.game.ui.markWins(wins);this.game.audio.sfx('connect',mode==='SCATTER'?'scatter':'normal');this.game.setState(HorusGameState.WIN_PRESENT);
  // Keep the connected symbols visible long enough to read the result.
  await this.game.wait(this.game.turbo?520:820);
  const payout=this.game.wins.payout(wins,this.game.bet.value);total+=payout;this.game.totalWin+=payout;this.game.ui.addHistory(`${mode==='SCATTER'?'SCATTER':'WIN'} • ${wins.length} Kombinasi`,payout);
  this.game.setState(HorusGameState.REMOVE);
  // The reel engine performs the actual gravity/tumble animation. It removes
  // winning cells, drops survivors downward, then brings NEW cells from above.
  this.game.reels.remove?.();
  await this.game.wait(this.game.turbo?90:180);
  this.game.setState(HorusGameState.TUMBLE);
  await this.game.reels.tumble(grid,wins,mode,this.game.turbo);
  this.game.setState(HorusGameState.REFILL);
  await this.game.wait(this.game.turbo?HorusConfig.TURBO_TUMBLE_DELAY:HorusConfig.TUMBLE_DELAY);
}this.game.ui.markWins([]);return total};window.HorusTumbleEngine=Tumble})();
