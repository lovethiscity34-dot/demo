"use strict";
(function(){
  function GameEngine(){
    this.credit=new HorusCreditEngine(); this.bet=new HorusBetEngine(); this.symbols=new HorusSymbolEngine(); this.wins=new HorusWinEngine(this.symbols); this.reels=new HorusReelEngine(this.symbols);
    this.grid=[]; this.busy=false; this.turbo=false; this.auto=false; this.freeSpins=0; this.totalWin=0; this.state=HorusGameState.IDLE; this.sound=true;
    this.normalMode=new HorusNormalMode(this); this.scatterMode=new HorusScatterMode(this);
  }
  GameEngine.prototype.setState=function(s){this.state=s;};
  GameEngine.prototype.canSpin=function(free){return !this.busy && (free || this.credit.canAfford(this.bet.value));};
  GameEngine.prototype.startSpin=async function(opts={}){ if(opts.free) return this.scatterMode.spin(); return this.normalMode.spin(); };
  GameEngine.prototype._runSpin=async function({free,mode}){
    if(this.busy) return; if(!free && !this.credit.canAfford(this.bet.value)){this.ui.toast("Kredit tidak cukup untuk taruhan ini."); return;}
    this.busy=true; this.setState(mode==="SCATTER"?HorusGameState.SCATTER_SPINNING:HorusGameState.SPINNING); this.ui.setBusy(true);
    if(!free) this.credit.spend(this.bet.value); this.ui.update();
    this.grid=this.symbols.randomGrid();
    await this.reels.animateSpin(this.grid,this.turbo);
    const scatterCount=this.wins.scatterCount(this.grid);
    this.setState(mode==="SCATTER"?HorusGameState.SCATTER_TUMBLING:HorusGameState.TUMBLING);
    const tumble=new HorusTumbleEngine({reels:this.reels,wins:this.wins,bet:()=>this.bet.value,getTurbo:()=>this.turbo,markWins:w=>this.ui.markWins(w),recordWin:(win,w)=>{this.totalWin+=win;this.ui.addHistory("Win kombinasi",win);}});
    const spinWin=await tumble.run(this.grid);
    if(mode==="NORMAL" && scatterCount>=HorusConfig.SCATTER_TRIGGER){const added=this.scatterMode.addFreeSpins(scatterCount); this.freeSpins += added; this.setState(HorusGameState.SCATTER_INTRO); this.ui.toast(`${scatterCount} SCATTER! +${added} FREE SPIN`);}
    if(spinWin>0){this.credit.add(spinWin); if(spinWin>=this.bet.value*20)this.ui.bigWin(spinWin);}
    if(this.credit.resetIfNeeded()) this.ui.toast("Kredit di bawah Rp 10.000 → diisi ulang menjadi Rp 100.000.");
    this.ui.update(); this.busy=false; this.setState(this.freeSpins>0?HorusGameState.SCATTER:HorusGameState.IDLE); this.ui.setBusy(false);
    if(this.auto){setTimeout(()=>this.startSpin(),this.turbo?90:350);} else if(this.freeSpins>0){this.freeSpins--; this.ui.update(); setTimeout(()=>this.startSpin({free:true}),this.turbo?90:450);}
  };
  GameEngine.prototype.increaseBet=function(){if(!this.busy){this.bet.increase();this.ui.update();}};
  GameEngine.prototype.decreaseBet=function(){if(!this.busy){this.bet.decrease();this.ui.update();}};
  GameEngine.prototype.buyFree=function(){if(this.busy)return; const cost=this.bet.value*100; if(!this.credit.canAfford(cost)){this.ui.toast(`Kredit kurang untuk membeli Free Spin (${this.ui.fmt(cost)}).`);return;} this.credit.spend(cost); this.freeSpins=15; this.setState(HorusGameState.SCATTER); this.ui.update(); this.ui.toast("15 FREE SPIN dibeli untuk demo.");};
  window.HorusGameEngine=GameEngine;
})();
