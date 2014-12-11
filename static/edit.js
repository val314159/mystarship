fs={
    load:function(_1,_2){rpcSend("load",[_1,_2],e.return_load)},
    save:function(_1,_2){rpcSend("save",[_1,_2])},
    system:function(_1,_2,_3){rpcSend("system",[_1,_2,_3],e.return_system)},
    reboot:function()     {rpcSend("reboot",[]);    }
}
function Edit(cfg){
    var text=$E(cfg.text);
    var path=$E(cfg.path);
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
	    fs.system(cmd,cfg.text,path.value)
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
	fs.load(path.value,cfg.text);
    }
    self.return_system=function(x){
	$E(cfg.command).innerHTML = x.result[0];
	$E(cfg.stdout ).innerHTML = x.result[1];
	$E(cfg.stderr ).innerHTML = x.result[2];
    }
    self.return_load=function(x){
	var _0 = x.result[0];
	var _1 = x.result[1];
	if (typeof(_0)=="string") {
	    _0 = _0.replace('&','&amp;');
	    _0 = _0.replace('>','&gt;');
	    _0 = _0.replace('<','&lt;');
	    $E(_1).innerHTML = _0;
	} else {
	    var path = $E(cfg.path).value
	    $E(cfg.dir).innerHTML = ''
	    for (var n=0; n<_0.length; n++) {
		var k=path+'/'+_0[n];
		var link = "<a href='#"+k+"' "+
		    "onclick=e.load('"+k+"')>"+k+"</a>";
		$E(cfg.dir).innerHTML += link+'<br>';
	    }
	}
    }
}
