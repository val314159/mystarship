function str(x){return JSON.stringify(x)}
function $DCE(x){return document.createElement(x)}
function $E(x){return document.getElementById(x.substr(1))}
function $I(e,v){e.innerHTML=v;return e}
function LOG(x){console.log(x)}
//function LOG(x){$E('#out').appendChild($I($DCE('li'),x))}
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
            $E('#cmded_a_stdout' ).innerHTML += '<br>'+str(x.result[n]);
        }
        $E('#cmded_a_stderr' ).innerHTML = '';
	});
}
function spawn() {
    cmd = prompt("enter command:","");
    RPC.rpcSend("spawn",[cmd],function(x){
            LOG("SPAWNED!"+str(x.result));
            $E('#cmded_a.command').innerHTML = x.result[0];
            $E('#cmded_a_stdout' ).innerHTML = '';
            $E('#cmded_a_stderr' ).innerHTML = '';
	});
}
function destroy() {
    cmd = prompt("enter job index to destroy:","");
    RPC.rpcSend("destroy",[cmd],function(x){
      LOG("DESTROY:"+str(x.result));
    })
}

