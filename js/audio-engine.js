"use strict";
(function(){
 function AudioEngine(){this.enabled=true;this.ctx=null;}
 AudioEngine.prototype.ensure=function(){if(!this.enabled)return;if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==="suspended")this.ctx.resume();};
 AudioEngine.prototype.tone=function(freq,dur=.08,type="sine",gain=.035){if(!this.enabled)return;this.ensure();const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(gain,this.ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+dur);o.connect(g).connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+dur+.02);};
 AudioEngine.prototype.spin=function(){this.tone(180,.07,"square");};AudioEngine.prototype.stop=function(){this.tone(330,.05,"sine");};AudioEngine.prototype.win=function(){this.tone(560,.1,"triangle");setTimeout(()=>this.tone(760,.12,"triangle"),70);};AudioEngine.prototype.scatter=function(){[440,660,880].forEach((f,i)=>setTimeout(()=>this.tone(f,.18,"sawtooth",.04),i*90));};AudioEngine.prototype.big=function(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,.2,"triangle",.05),i*100));};
 window.HorusAudioEngine=AudioEngine;
})();
