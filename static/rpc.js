function str(x){return JSON.stringify(x)}
function $DCE(x){return document.createElement(x)}
function $E(x){return document.getElementById(x.substr(1))}
function $I(e,v){e.innerHTML=v;return e}
function LOG(x){console.log(x)}
//function LOG(x){$E('#out').appendChild($I($DCE('li'),x))}

function jump(h){
    var elt=$E(h);
    var top = elt.offsetTop; //Getting Y of target element
    window.scrollTo(0, top);                        //Go there.
//    elt.focus();
   return elt;
}

var ___id=100;
function getId(){return ++___id}
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
    return text}
function WS(path,$status,extra) {
  var self=this;
  Callbacks = {};
  var _ws;

  self.noconnect = function(){};
  self.onconnect = self.noconnect;
  self.onmsg=function(x){
      LOG(" $$$$ MSG $$$$ " + str(x));
    if (x.id) {
	var fn = Callbacks[x.id];
	if (fn) {
	    Callbacks[x.id] = undefined;
	    fn(x);
	} else {
	    LOG("WIERD, CANT FIND CALLBACK FOR "+str(x));
	}
    } else {
	if (extra) {
	    LOG("GOT EXTRA MSG, PROCESS:"+str(x));
	    extra(x);
	} else {
	    LOG("GOT EXTRA MSG, DONT PROCESS::"+str(x));
	}
    }
  };
  self.disconnect=function(){_ws.close()}
  self.rpcSend=function(method,params,callback){
    if (callback) {
	var id=getId();
	Callbacks[id] = callback;
	_ws.send(str({id:id,method:method,params:params}));
    } else {
	_ws.send(str({method:method,params:params}));
    }
  };

  self.reconnect=function(onconnect){
    if (_ws)
	_ws.close();
    if (path[0]==':') {
	_ws = new WebSocket('ws://'+location.hostname+path);
    } else {
	_ws = new WebSocket('ws://'+location.host+path);
    }
    _ws.onopen  = function() {LOG("ONOPEN"); $status("open");self.onconnect()};
    _ws.onerror = function(e){LOG("ONERROR");$status("error:"+e);};
    _ws.onclose = function(e){LOG("ONCLOSE");$status("close:"+e);};
    _ws.onmessage=function(x){self.onmsg(JSON.parse(x.data))};
    self.onconnect = onconnect? onconnect : self.noconnect;
    return self;
  };
}

function jobs() {
    RPC.rpcSend("jobs",[],function(x){
        LOG("JOBS2:"+str(x.result));
        $E('#cmded_a.command').innerHTML = 'jobs';
        $E('#cmded_a_stdout' ).innerHTML = 'Jobs:'
        for (var n=0; n<x.result.length; n++) {
	    if (x.result[n].poll == -9) continue;
	    var suffix1 = '<button onclick=destroyJob('+n+')>Destroy' + n + '</button>';
	    var suffix2 = '<button onclick=restartJob('+n+')>Restart' + n + '</button>';
            $E('#cmded_a_stdout' ).innerHTML += '<br>'+str(x.result[n])+suffix1+suffix2;
        }
        $E('#cmded_a_stderr' ).innerHTML = '';
	});
}
var lastCmd = 'sh run_chat.sh';
function spawn() {
    var cmd = prompt("enter command:",lastCmd);
    RPC.rpcSend("spawn",[cmd],function(x){
            lastCmd = cmd;
            LOG("SPAWNED!"+str(x.result));
            $E('#cmded_a.command').innerHTML = x.result[0];
            $E('#cmded_a_stdout' ).innerHTML = '';
            $E('#cmded_a_stderr' ).innerHTML = '';
	});
}
function destroyJob(cmd) {
    RPC.rpcSend("destroy",[cmd],function(x){
      LOG("DESTROY:"+str(x.result));
    })
}
function destroy() {
    var cmd = prompt("enter job index to destroy:","");
    destroyJob(cmd);
}
function restartJob(cmd) {
    RPC.rpcSend("restart",[cmd],function(x){
      LOG("RESTART:"+str(x.result));
    })
}
function restart() {
    var cmd = prompt("enter job index to restart:","");
    restartJob(cmd);
}

