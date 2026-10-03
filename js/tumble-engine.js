(function(){function Tumble(game){this.game=game}
Tumble.prototype.run=async function(grid,mode){let total=0;for(let round=0;round<HorusConfig.MAX_TUMBLE_ROUNDS;round++){
  this.game.setState(HorusGameState.WIN_CHECK);const wins=this.game.wins.find(grid,mode);if(!wins.length)break;
  this.game.ui.markWins(wins);this.game.setState(HorusGameState.WIN_PRESENT);await this.game.wait(this.game.turbo?130:360);
  const payout=this.game.wins.payout(wins,this.game.bet.value);total+=payout;this.game.totalWin+=payout;this.game.ui.addHistory(`${mode==='SCATTER'?'SCATTER':'WIN'} • ${wins.length} Kombinasi`,payout);
  this.game.setState(HorusGameState.REMOVE);this.game.reels.remove?.();wins.flatMap(w=>w.cells).forEach(p=>grid[p.r][p.c]=null);await this.game.wait(this.game.turbo?55:170);
  this.game.setState(HorusGameState.TUMBLE);for(let c=0;c<HorusConfig.COLS;c++){
    const keep=[];for(let r=HorusConfig.ROWS-1;r>=0;r--)if(grid[r][c])keep.push(grid[r][c]);
    while(keep.length<HorusConfig.ROWS)keep.push({id:this.game.symbols.weighted(mode),multiplier:mode==='SCATTER'?this.game.symbols.rollMultiplier():0});
    for(let r=HorusConfig.ROWS-1,i=0;r>=0;r--,i++)grid[r][c]=keep[i];
  }
  this.game.setState(HorusGameState.REFILL);this.game.reels.render(grid);await this.game.wait(this.game.turbo?HorusConfig.TURBO_TUMBLE_DELAY:HorusConfig.TUMBLE_DELAY);
}this.game.ui.markWins([]);return total};window.HorusTumbleEngine=Tumble})();
