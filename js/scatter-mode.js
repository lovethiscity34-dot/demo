(function(){
  function Scatter(game){this.game=game}
  // 4+ total Scatter symbols trigger/retrigger. Adjacency is irrelevant.
  // 4–5 => +15, 6–7 => +20, 8–9 => +25, 10–11 => +30, ...
  Scatter.prototype.addFreeSpins=function(n){if(n<4)return 0;return HorusConfig.SCATTER_BASE_SPINS+Math.floor((n-4)/2)*HorusConfig.SCATTER_EXTRA_PER_3};
  Scatter.prototype.begin=function(spins){
    this.game.freeSpins=spins||HorusConfig.SCATTER_BASE_SPINS;
    this.game.mode='SCATTER'; this.game.multiplier=1;
    this.game.setState(HorusGameState.SCATTER_TRANSITION);
    document.body.dataset.scatter='entering';
    document.body.dataset.mode='SCATTER';
    this.game.audio.sfx('scatter-trigger','scatter'); this.game.audio.scatterMode();
    this.game.horus.set('ULTIMATE • AWAKENED'); this.game.ui.update();
    return this.game.wait(this.game.turbo?500:1050).then(()=>{document.body.dataset.scatter='active';this.game.ui.update()});
  };
  Scatter.prototype.spin=function(){return this.game.runSpin(true,'SCATTER')};
  window.HorusScatterMode=Scatter;
})();
