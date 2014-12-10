fs={
    load:function(_1,_2){rpcSend("load",[_1,_2],e.return_load)},
    save:function(_1,_2){rpcSend("save",[_1,_2])},
system:function(_1,_2){rpcSend("system",[_1,_2],e.return_system)}
    reboot:function()     {rpcSend("reboot",[]);    }
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
    self.return_system=function(x){
	$E('#command').innerHTML = x.result[0];
	$E('#stdout').innerHTML = x.result[1];
	$E('#stderr').innerHTML = x.result[2];
    }
    self.return_load=function(x){
	var _0 = x.result[0];
	var _1 = x.result[1];
	if (typeof(_0)=="string") {
	    $E(_1).innerHTML = _0;
	} else {
	    var path = $E('#path').value
	    $E('#dir').innerHTML = ''
	    for (var n=0; n<_0.length; n++) {
		var k=path+'/'+_0[n];
		var link = "<a href='#"+k+"' "+
		    "onclick=e.load('"+k+"')>"+k+"</a>";
		$E('#dir').innerHTML += link+'<br>';
	    }
	}

    }
}
