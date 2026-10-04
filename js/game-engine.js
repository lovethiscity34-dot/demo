(function(){
  function Game(){this.credit=new HorusCreditEngine();this.bet=new HorusBetEngine();this.symbols=new HorusSymbolEngine();this.wins=new HorusWinEngine();this.reels=new HorusReelEngine(this.symbols);this.tumble=new HorusTumbleEngine(this);this.multiplier=1;this.grid=[];this.busy=false;this.turbo=false;this.auto=false;this.freeSpins=0;this.totalWin=0;this.mode='NORMAL';this.state=HorusGameState.IDLE;this.audio=new HorusAudioEngine();this.horus=null;this.ui=null;this.scatterSession=0;this.scatterTotalWin=0;this.scatterSpinsPlayed=0;this.scatterTotalSpins=0;this.scatterMaxMultiplier=1}
  Game.prototype.setState=function(s){this.state=s;if(this.ui)this.ui.state(s)};
  Game.prototype.wait=function(ms){return new Promise(r=>setTimeout(r,ms))};
  Game.prototype.start=function(){this.grid=this.symbols.randomGrid('NORMAL');this.reels.render(this.grid);this.ui.update()};
  Game.prototype.enterScatter=function(spins){const sm=new HorusScatterMode(this);this.scatterSession++;this.scatterTotalWin=0;this.scatterSpinsPlayed=0;this.scatterTotalSpins=spins||HorusConfig.SCATTER_BASE_SPINS;this.scatterMaxMultiplier=1;return sm.begin(this.scatterTotalSpins)};
  Game.prototype.runSpin=async function(free,mode){
    if(this.busy)return; if(!free&&!this.credit.canAfford(this.bet.value)){this.ui.toast('Kredit tidak cukup untuk taruhan ini.');return}
    this.busy=true; this.mode=mode; this.setState(free?HorusGameState.SCATTER_SPIN:HorusGameState.SPIN_START);
    if(!free)this.credit.spend(this.bet.value);
    this.audio.sfx('reel-start',mode==='SCATTER'?'scatter':'normal');
    if(mode==='SCATTER'){this.audio.scatterMode();this.horus.set('ULTIMATE • SPIN')}else{this.audio.normalBgm();this.horus.set('GUARDIAN • SPIN')}
    this.ui.update(); this.grid=this.symbols.randomGrid(mode); this.setState(HorusGameState.ROLLING);
    await this.reels.animate(this.grid,this.turbo,mode); this.audio.sfx('reel-stop',mode==='SCATTER'?'scatter':'normal'); this.setState(HorusGameState.RESULT);
    const scatterCount=this.wins.scatterCount(this.grid);
    const win=await this.tumble.run(this.grid,mode);
    let payout=win;
    if(mode==='SCATTER'){
      // A multiplier is valid only when its cell belonged to a real connected win.
      // TumbleEngine collects those cells before they are removed/refilled.
      const m=HorusMultiplierEngine.resolveWinning(this.tumble.lastWinningMultipliers||[]);
      this.multiplier=m.multiplier;
      this.scatterMaxMultiplier=Math.max(this.scatterMaxMultiplier,m.multiplier||1);
      if(m.count){
        const multiplierWin=Math.floor(win*m.multiplier);
        this.ui.addHistory(`MULTIPLIER TERHUBUNG • x${m.multiplier}`,multiplierWin);
        this.audio.sfx(m.multiplier>=100?'big-multiplier':'multiplier','scatter');
        if(win>0)payout=multiplierWin;
        this.ui.showMultiplier(m);
      }
    }
    if(payout>0){this.credit.add(payout);if(mode==='SCATTER')this.scatterTotalWin+=payout;this.audio.sfx(payout>=this.bet.value*10?'big-win':'small-win',mode==='SCATTER'?'scatter':'normal');if(payout>=this.bet.value*20){this.setState(HorusGameState.BIG_WIN);this.horus.set('DIVINE • SUPER WIN');this.ui.bigWin(payout);await this.wait(this.turbo?550:900)}else this.horus.set(mode==='SCATTER'?'ULTIMATE • WIN':'GUARDIAN • WIN')}
    if(!free&&scatterCount>=HorusConfig.SCATTER_TRIGGER){
      const add=new HorusScatterMode(this).addFreeSpins(scatterCount);
      await this.enterScatter(add);
      this.ui.showScatterEvent({count:scatterCount,spins:add,retrigger:false});
    }else if(free){
      // Scatter retrigger: 4–5 => +15, 6–7 => +20, 8–9 => +25, etc.
      // The current spin is consumed after the retrigger is awarded.
      if(scatterCount>=HorusConfig.SCATTER_TRIGGER){
        const extra=new HorusScatterMode(this).addFreeSpins(scatterCount);
        this.freeSpins+=extra;
        this.scatterTotalSpins+=extra;
        this.ui.showScatterEvent({count:scatterCount,spins:extra,retrigger:true});
      }
      this.scatterSpinsPlayed++;
      this.freeSpins=Math.max(0,this.freeSpins-1);
      if(this.freeSpins===0){this.setState(HorusGameState.SCATTER_END);this.audio.sfx('scatter-end','scatter');this.audio.stop(this.audio.scatterBgm);this.mode='NORMAL';document.body.dataset.scatter='ending';this.horus.set('GUARDIAN • RETURN');this.ui.update();await this.wait(this.turbo?250:650);document.body.dataset.scatter='ending';this.audio.normalBgm();this.busy=false;this.setState(HorusGameState.IDLE);this.ui.update();await this.ui.showScatterResult({totalWin:this.scatterTotalWin,totalSpins:this.scatterTotalSpins,spinsPlayed:this.scatterSpinsPlayed,maxMultiplier:this.scatterMaxMultiplier});document.body.dataset.scatter='';}
    }
    if(this.credit.resetIfNeeded())this.ui.toast('Demo reset: kredit kembali ke Rp 100.000.');
    if(this.busy){this.busy=false;this.setState(this.freeSpins>0?HorusGameState.SCATTER:HorusGameState.IDLE);this.ui.update();}
    if(this.auto||this.freeSpins>0)setTimeout(()=>this.startSpin(),this.turbo?120:520);
  };
  Game.prototype.startSpin=function(){if(this.busy)return this.startSpinPromise;this.startSpinPromise=(this.freeSpins>0?new HorusScatterMode(this).spin():new HorusNormalMode(this).spin()).finally(()=>{this.startSpinPromise=null});return this.startSpinPromise};
  Game.prototype.increaseBet=function(){if(!this.busy){this.bet.increase();this.audio.sfx('bet','ui');this.ui.update()}};
  Game.prototype.decreaseBet=function(){if(!this.busy){this.bet.decrease();this.audio.sfx('bet','ui');this.ui.update()}};
  Game.prototype.buyFree=async function(){
    if(this.busy)return false;
    this.busy=true;
    const cost=this.bet.value*100;
    if(!this.credit.canAfford(cost)){this.busy=false;this.ui.update();this.ui.toast(`Kredit kurang untuk membeli Free Spin (${this.ui.fmt(cost)}).`);return false}
    this.credit.spend(cost); this.auto=false; this.freeSpins=0; this.multiplier=1; this.totalWin=0;
    await this.enterScatter(HorusConfig.SCATTER_BASE_SPINS);
    this.busy=false;this.ui.update();this.ui.showScatterEvent({count:0,spins:HorusConfig.SCATTER_BASE_SPINS,retrigger:false,activation:true});
    this.startSpin(); return true;
  };
  window.HorusGameEngine=Game;
})();
