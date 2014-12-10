fs={
    load:  function(_1,_2){rpcSend("load",[_1,_2]); },
    save:  function(_1,_2){rpcSend("save",[_1,_2]); },
    system:function(_1,_2){rpcSend("system",[_1,_2])},
    reboot:function()     {rpcSend("reboot",[]);    }
}
function html2text(text) {
    text = text.replace(/<div><br><\/div>/g,'\r\n')
    text = text.replace(/<\/div><div>/g,'\r\n')
    text = text.replace(/<div>/g,'\r\n')
    text = text.replace(/<\/div>/g,'')
    text = text.replace(/<br>/g,'\r\n')
    //text = text.replace(/<.*?>/g,'')
    text = text.replace(/&lt;/g,'<')
    text = text.replace(/&gt;/g,'>')
    text = text.replace(/&amp;/g,'&')
    return text;
}
function Edit(textEltName,pathEltName){
    var text=$E(textEltName);
    var path=$E(pathEltName);
    text.contentEditable=true;
    text.onkeydown=function(e){
	if(e.keyCode==9) {
	    e.preventDefault();
	    document.execCommand("InsertHTML",false,"&#09;");
	}
    }
    document.onkeydown=function(e){
	//LOG("EKC:"+e.keyCode);
	if(e.keyCode==49 && e.ctrlKey) { // '^!'
	    e.preventDefault();
	    var cmd = prompt("system command?","");
	    alert("CMD:", cmd);
	    fs.system(cmd)
	}
    }
    var self=this;
    self.save=function(){
	var txt = text.innerHTML;
	txt = html2text( txt );
	fs.save(path.value,txt);
    }
    self.load=function(filename){
	if (filename)
	    path.value=filename;
	fs.load(path.value,textEltName);
    }
}
