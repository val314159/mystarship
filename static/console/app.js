function extra(x){
    LOG("EXTRA:"+str(x));
    var stdout=x.params.output[0];
    var stderr=x.params.output[1];
    $E('#cmded_a_stdout' ).innerHTML += stdout;
    $E('#cmded_a_stderr' ).innerHTML += stderr;

}
var RPC=new WS("/ws",function(x){$E('#status').innerHTML=x},extra);
function mkThing(_1,_2){
  var _0=_1+'/'+_2;
  return("<a onclick=load('_0') href='#_0'>_0</a><br>"
    .replace(/_0/g,_0).replace(/_2/g,_2));
}
function save(buf,pathEltname) {
    var fname = $E('#bufed_a.path').innerHTML;
    var txt = buf.getValue();
    RPC.rpcSend("save",[fname,txt],function(x){
      LOG("SAVED!"+str(x.result));
    })
}
function loadDir(x){
    var elt=$E('#dired_a');
    elt.innerHTML = ''
    var files = x.result[0];
    for (var n=0; n<files.length; n++) {
	    var a=files[n][0];
	    var b=files[n][1];
	    for (var m=0; m<b.length; m++) {
            //        LOG("::"+a+"//"+b[m]);
            elt.innerHTML += mkThing(a,b[m])
	    }
    }
    var path=x.result[2]+'/'+x.result[3];
    LOG("PATH:"+path);
    $E('#dired_a.path').innerHTML = path;
    $E('#combo_a.path').innerHTML = path;
}
function loadFile(x){
    var _0 = x.result[0];
    editor1.setValue(_0)
    var path=x.result[2]+'/'+x.result[3];
    LOG("PATH:"+path);
    $E('#bufed_a.path').innerHTML = path;
    $E('#combo_a.path').innerHTML = path;
}
function load(filename){
  RPC.rpcSend("load",[filename],function(x){
    LOG("LOADED2!"+str(x.result));
    if (typeof(x.result[0])=="string") loadFile(x); else loadDir(x);
  })
  LOG("REQ SENT");
}
document.onkeydown=function(e){
    //LOG("KC " + e.keyCode);
    var cmd;
    switch(e.keyCode){
    case 81: // 'Q'
    	if (e.ctrlKey) {
	        e.preventDefault();
	        spawn();
    	}
    	break;
    case 82: // 'R'
    	if (e.ctrlKey) {
	        e.preventDefault();
	        restart();
    	}
    	break;
	case 74: // 'J'
        if (e.ctrlKey) {
	        jobs();
	    }
	    break;
    case 75: // 'K'
        if (e.ctrlKey) {
            destroy();
        }
	    break;
	case 76: // 'L'
	    if (e.ctrlKey) {
	        jump('#bufed_a');
	        editor1.focus();
            editor1.navigateLeft(0);
	    }
	    break;
    case 90: // 'Z'
	    if (e.ctrlKey) {
	        e.preventDefault();
    	    cmd = prompt("enter command:","");
	        RPC.rpcSend("system",[cmd],function(x){
		        LOG("SYSTEMED!"+str(x.result));
		        $E('#cmded_a.command').innerHTML = x.result[0];
    		    $E('#cmded_a_stdout' ).innerHTML = x.result[1];
	    	    $E('#cmded_a_stderr' ).innerHTML = x.result[2];
		    });
	    }
    	break;
    }
}
RPC.reconnect(function(){ load('.') });
if (0) {
  editor1 = new G.BufEd("bufed_a");
} else {
  editor1 = ace.edit("bufed_a");
  var emacs = ace.require('ace/keyboard/emacs').handler;
  editor1.setKeyboardHandler(emacs);
  editor1.commands.addCommand({
      name: 'myCommand', readOnly: true,
      bindKey: {win: 'Ctrl-S',  mac: 'Ctrl-S'},
      exec: function(editor){save(editor1,'#bufed_a.path')}});
}
