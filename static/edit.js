fs={
    load:function(_1,_2){rpcSend("load",[_1,_2],e.return_load)},
    save:function(_1,_2){rpcSend("save",[_1,_2])},
    system:function(_1,_2,_3){rpcSend("system",[_1,_2,_3],e.return_system)},
    reboot:function()     {rpcSend("reboot",[]);    }
}
function Edit(cfg){
    LOG("CTOR EDIT:"+str(cfg));
    var text=$E(cfg.text);
    LOG("CTOR EDIT2:"+text);
    var dirname =$E(cfg.dirname);
    LOG("DIRNAME:"+dirname);
    var filename=$E(cfg.filename);
    LOG("DIRNAME:"+filename);
    var getPath=function(){
	return dirname.value+'/'+filename.value;
    }
    LOG("CTOR EDIT3");
    text.contentEditable=true;
    LOG("CTOR EDIT4");
    text.onkeydown=function(e){
	if(e.keyCode==9) { // '^I' / Tab
	    e.preventDefault();
	    document.execCommand("InsertHTML",false,"&#09;");
	}else if(e.keyCode==83 && e.ctrlKey) { // '^S'
	    self.save();
	}
    }
    var mode = 0;
    document.onkeydown=function(e){
	//LOG(" --- MODE:" + mode + "EKC:"+e.keyCode);
	if(mode){
	    //LOG(" --- MODE:" + mode + "EKC:"+e.keyCode);
	    if(e.keyCode==17){
	    }else{
		if(e.keyCode==65 && e.ctrlKey) { // '^A'
		    LOG("no thing");
		}else{
		    e.preventDefault();
		    LOG("DO THE THING!!!!");
		}
		mode=0;
	    }
	}else if(e.keyCode==65 && e.ctrlKey) { // '^A'
	    mode=1;
	    e.preventDefault();
	    LOG("^AEAT IT");
	}else if((e.keyCode==49||e.keyCode==90) && e.ctrlKey) { // '^!'
	    e.preventDefault();
	    var cmd = prompt("system command?","");
	    fs.system(cmd,cfg.text,dirname.value)
	}else if(e.keyCode==76 && e.ctrlKey) { // '^L'
	    e.preventDefault();
	    fs.load()
	}
    }
    var self=this;
    self.data={};
    self.data.text='';
    self.data.dirname='';
    self.data.filename='';
    self.save=function(){
	var txt = text.innerHTML;
	txt = html2text( txt );
	fs.save(getPath(),txt);
    }
    self.load=function(filename){
	if (filename)
	    path.value=filename;
	fs.load(getPath(),cfg.text);
    }
    self.return_system=function(x){
	$E(cfg.command).innerHTML = x.result[0];
	$E(cfg.stdout ).innerHTML = x.result[1];
	$E(cfg.stderr ).innerHTML = x.result[2];
    }
    self.setText=function(_0){
	self.data.text = _0;
	_0 = _0.replace(/&/g,'&amp;');
	_0 = _0.replace(/>/g,'&gt;');
	_0 = _0.replace(/</g,'&lt;');
	text.innerHTML = _0;
    }
    self.getText=function(){
	var txt = text.innerHTML;
	return txt;
    }
    self.return_load=function(x){
	LOG(" **** RET LOAD **** " +str(x));
	var _0 = x.result[0];
	var _1 = x.result[1];
	LOG("LLLL:22:"+x.result[2]);
	LOG("LLLL:33:"+x.result[3]);
	LOG("LLLL:22:"+dirname)
	LOG("LLLL:22:"+filename)
	dirname.value  = x.result[2];
	filename.value = x.result[3];
	self.data.dirname = x.result[2];
	self.data.filename = x.result[3];
	if (typeof(_0)=="string") {
	    self.setText(_0);
	} else {
	    var dname = $E(cfg.dirname).value
	    $E(cfg.dir).innerHTML = ''
	    for (var n=0; n<_0.length; n++) {
		var k=dname+'/'+_0[n];
		var link = "<a href='#"+k+"' "+
		    "onclick=e.load('"+k+"')>"+k+"</a>";
		$E(cfg.dir).innerHTML += link+'<br>';
	    }
	}
    }
}
