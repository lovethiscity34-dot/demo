"use strict";
(function(){
 function HorusController(){this.card=document.querySelector(".horus-card");this.state=document.querySelector(".horus-state");}
 HorusController.prototype.set=function(state){this.card.dataset.state=state;this.state.textContent=state;};
 window.HorusController=HorusController;
})();
