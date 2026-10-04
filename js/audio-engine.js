(function(){
function HorusAudio(){
  this.enabled=true;
  this.ctx=null;
  this.bgm=null;
  this.scatterBgm=null;
  this.reelRoll=null
}
HorusAudio.prototype.init=function(){
  if(this.ctx)return;
  try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
};
HorusAudio.prototype.file=function(path,loop=false){
  if(!this.enabled)return null;
  const a=new window.Audio(path);
  a.loop=loop;
  a.volume=.28;
  a.play().catch(()=>{});
  return a
};
HorusAudio.prototype.stop=function(a){
  if(a){a.pause();a.currentTime=0}
};
HorusAudio.prototype.startReelRoll=function(mode='normal'){
  if(!this.enabled)return;
  this.stopReelRoll();
  const folder=mode==='SCATTER'?'scatter':'normal';
  const a=this.file(`audio/${folder}/reel-roll.mp3`,true);
  if(a)a.volume=0.13;
  this.reelRoll=a;
};
HorusAudio.prototype.stopReelRoll=function(){
  if(this.reelRoll){this.stop(this.reelRoll);this.reelRoll=null}
};
HorusAudio.prototype.normalBgm=function(){
  if(!this.enabled)return;
  this.stop(this.scatterBgm);
  if(this.bgm){
    this.bgm.loop=true;
    this.bgm.play().catch(()=>{});
  }else{
    this.bgm=this.file('audio/normal/normal-bg.mp3',true)
  }
};
HorusAudio.prototype.scatterMode=function(){
  if(!this.enabled)return;
  this.stop(this.bgm);
  if(this.scatterBgm){
    this.scatterBgm.loop=true;
    this.scatterBgm.play().catch(()=>{});
  }else{
    this.scatterBgm=this.file('audio/scatter/scatter-bg.mp3',true)
  }
};
HorusAudio.prototype.sfx=function(name,mode='normal'){
  if(this.enabled)this.file(`audio/${mode}/${name}.mp3`)
};
HorusAudio.prototype.setEnabled=function(v){
  this.enabled=v;
  if(!v){
    this.stop(this.bgm);
    this.stop(this.scatterBgm);
    this.stopReelRoll()
  }
};
window.HorusAudioEngine=HorusAudio
})();
