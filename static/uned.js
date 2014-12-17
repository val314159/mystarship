if (!window.G) G={};
G.BufEd=function(eltName){
    var self=this;
    var elt=document.getElementById(eltName);
    elt.onkeydown=function(e){
        switch(e.keyCode){
	case 9 : // '^I' / Tab
	  e.preventDefault();
	  document.execCommand("InsertHTML",false,"&#09;");
	  break;
	case 83: // '^S'
	  if(e.ctrlKey) save(self,'#bufed_a.path');
	  break;
        }
    }
    this.getValue=function(){
	var txt = elt.innerHTML;
	txt = txt.replace(/&lt;/g,'<')
	txt = txt.replace(/&gt;/g,'>')
	txt = txt.replace(/&amp;/g,'&')
	return txt;
    }
    this.init2=function(){
	elt.contentEditable=false;
    }
    this.init=function(){
	elt.contentEditable=true;
	elt.style.spellcheck=false;
	elt.style.autocorrect=false;
	elt.spellcheck=false;
	elt.autocorrect=false;
    }
    this.setValue=function(txt){
	txt = txt.replace(/&/g,'&amp;')
	txt = txt.replace(/>/g,'&gt;')
	txt = txt.replace(/</g,'&lt;')
	elt.innerHTML = txt;
    }
    this.focus=function(){elt.focus();}

    this.init();
    this.focus();
}
