(function(){
function HorusAudio(){this.enabled=true;this.ctx=null;this.bgm=null;this.scatterBgm=null;this.reelRoll=null;this.cache={};this.unlocked=false}
HorusAudio.prototype.init=function(){
  if(this.ctx){try{if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){};return}
  try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}
};
HorusAudio.prototype.preload=function(paths){
  const self=this, list=[...new Set(paths||[])];
  return Promise.all(list.map(function(path){
    return new Promise(function(resolve){
      if(self.cache[path]&&self.cache[path].readyState>=2){resolve();return}
      const a=self.cache[path]||new window.Audio();a.preload='auto';a.src=path;self.cache[path]=a;
      let done=false;const finish=function(){if(done)return;done=true;cleanup();resolve()};
      const cleanup=function(){a.removeEventListener('canplaythrough',finish);a.removeEventListener('loadeddata',finish);a.removeEventListener('error',finish)};
      a.addEventListener('canplaythrough',finish,{once:true});a.addEventListener('loadeddata',finish,{once:true});a.addEventListener('error',finish,{once:true});
      a.load();setTimeout(finish,7000);
    });
  }));
};
HorusAudio.prototype.unlock=function(){
  if(this.unlocked||!this.enabled)return;this.init();
  const a=this.cache['audio/normal/reel-start.mp3']||this.cache['audio/normal/symbol-win.mp3'];
  if(!a)return;
  try{a.muted=true;const p=a.play();if(p&&p.then)p.then(function(){a.pause();a.currentTime=0;a.muted=false}).catch(function(){a.muted=false});else{a.pause();a.currentTime=0;a.muted=false}this.unlocked=true}catch(e){}
};
HorusAudio.prototype.file=function(path,loop=false,volume=.28){
  if(!this.enabled)return null;
  const base=this.cache[path]||new window.Audio(path);base.preload='auto';this.cache[path]=base;
  const a=base.cloneNode(true);a.loop=loop;a.volume=volume;a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{});return a
};
HorusAudio.prototype.stop=function(a){if(a){a.pause();try{a.currentTime=0}catch(e){}}};
HorusAudio.prototype.normalBgm=function(){if(!this.enabled)return;this.stop(this.scatterBgm);if(this.bgm){this.bgm.loop=true;this.bgm.play().catch(()=>{})}else this.bgm=this.file('audio/normal/normal-bg.mp3',true,.28)};
HorusAudio.prototype.scatterMode=function(){if(!this.enabled)return;this.stop(this.bgm);if(this.scatterBgm){this.scatterBgm.loop=true;this.scatterBgm.play().catch(()=>{})}else this.scatterBgm=this.file('audio/scatter/scatter-bg.mp3',true,.28)};
HorusAudio.prototype.startReelRoll=function(mode='normal'){if(!this.enabled)return;this.init();this.unlock();this.stopReelRoll();const path=mode==='scatter'?'audio/scatter/reel-roll.mp3':'audio/normal/reel-roll.mp3';this.reelRoll=this.file(path,true,mode==='scatter'?.34:.38)};
HorusAudio.prototype.stopReelRoll=function(){this.stop(this.reelRoll);this.reelRoll=null};
HorusAudio.prototype.sfx=function(name,mode='normal',volume=.32){if(this.enabled){this.init();this.unlock();this.file(`audio/${mode}/${name}.mp3`,false,volume)}};
HorusAudio.prototype.setEnabled=function(v){this.enabled=v;if(!v){this.stop(this.bgm);this.stop(this.scatterBgm);this.stopReelRoll()}};
window.HorusAudioEngine=HorusAudio
})();
