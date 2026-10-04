(function(){
  function Horus(){
    this.el=document.querySelector('#horusArt');
    this.stateEl=document.querySelector('#horusState');
    this.heroAsset='assets/horus/horus-falcon-hero.webp';
    if(this.el)this.el.src=this.heroAsset;
    this.set('GUARDIAN • IDLE');
  }
  Horus.prototype.set=function(state){
    if(!this.el)return;
    this.stateEl.textContent=state;
    let file='idle';
    if(/SPIN/.test(state))file='spin';
    else if(/BIG|DIVINE/.test(state))file='bigwin';
    else if(/ULTIMATE|AWAKENED/.test(state))file='ultimate';
    else if(/SCATTER/.test(state))file='scatter';
    else if(/WIN/.test(state))file='win';
    document.body.dataset.horus=file;
    /* Keep the new Falcon Humanoid artwork as the single character source.
       State changes only drive the lightweight CSS motion layer. */
    if(this.el.getAttribute('src')!==this.heroAsset)this.el.src=this.heroAsset;
  };
  window.HorusController=Horus;
})();
