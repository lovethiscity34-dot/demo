(function(){
  function Horus(){this.el=document.querySelector('#horusArt');this.stateEl=document.querySelector('#horusState');this.set('GUARDIAN • IDLE')}
  Horus.prototype.set=function(state){this.stateEl.textContent=state;let file='idle';if(/SPIN/.test(state))file='spin';else if(/BIG|DIVINE/.test(state))file='bigwin';else if(/ULTIMATE|AWAKENED/.test(state))file='ultimate';else if(/SCATTER/.test(state))file='scatter';else if(/WIN/.test(state))file='win';this.el.src=`assets/horus/horus-${file}.webp`;document.body.dataset.horus=file};
  window.HorusController=Horus;
})();
