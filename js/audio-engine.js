(function(){
function HorusAudio(){this.enabled=true;this.ctx=null;this.bgm=null;this.scatterBgm=null;this.reelRoll=null}
HorusAudio.prototype.init=function(){
  if(this.ctx){try{if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){};return}
  try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}
};
HorusAudio.prototype.file=function(path,loop=false,volume=.28){
  if(!this.enabled)return null;
  const a=new window.Audio(path);a.preload='auto';a.loop=loop;a.volume=volume;a.load();
  const p=a.play();if(p&&p.catch)p.catch(()=>{});return a
};
HorusAudio.prototype.stop=function(a){if(a){a.pause();try{a.currentTime=0}catch(e){}}};
HorusAudio.prototype.normalBgm=function(){if(!this.enabled)return;this.stop(this.scatterBgm);if(this.bgm){this.bgm.loop=true;this.bgm.play().catch(()=>{})}else this.bgm=this.file('audio/normal/normal-bg.mp3',true,.17)};
HorusAudio.prototype.scatterMode=function(){if(!this.enabled)return;this.stop(this.bgm);if(this.scatterBgm){this.scatterBgm.loop=true;this.scatterBgm.play().catch(()=>{})}else this.scatterBgm=this.file('audio/scatter/scatter-bg.mp3',true,.17)};
HorusAudio.prototype.startReelRoll=function(mode='normal'){
  if(!this.enabled)return;
  this.init();
  this.stopReelRoll();
  const path=mode==='scatter'?'audio/scatter/reel-roll.mp3':'audio/normal/reel-roll.mp3';
  this.reelRoll=this.file(path,true,mode==='scatter'?.62:.58);
};
HorusAudio.prototype.stopReelRoll=function(){this.stop(this.reelRoll);this.reelRoll=null};
HorusAudio.prototype.sfx=function(name,mode='normal',volume){if(this.enabled){this.init();if(volume==null)volume=(name==='symbol-win'?0.62:0.32);this.file(`audio/${mode}/${name}.mp3`,false,volume)}};
HorusAudio.prototype.setEnabled=function(v){this.enabled=v;if(!v){this.stop(this.bgm);this.stop(this.scatterBgm);this.stopReelRoll()}};
window.HorusAudioEngine=HorusAudio
})();
