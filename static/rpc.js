//<div id=out></div><script>

function WS(path) {
  var _ws = new WebSocket('ws://'+location.host+path);
  _ws.onopen  = onOpen;
  _ws.onerror = onError;
  _ws.onclose = onClose;
  _ws.onmessage=function(x){onMsg(JSON.parse(x.data))};
  return _ws;
}

var Callbacks = {};

var Rpc;
function rpcSend(method,params,callback) {
    if (callback) {
	var id=getId();
	Callbacks[id] = callback;
	Rpc.send(str({id:id,method:method,params:params}))
    } else {
	Rpc.send(str({method:method,params:params}))
    }
}
function rpcReconnect(){
    if (Rpc)
	Rpc.close();
    Rpc = WS('/ws')
    return Rpc;
}

var _status="dunno1";
function $status(x){
    $E('#status').innerHTML = _status = x;
    return window;
}
function onOpen()  {LOG("ONOPEN");  $status("open"); onConnect();}
onConnect=function(){}
function onError(e){LOG("ONERROR"); $status("error:"+e);}
function onClose(e){LOG("ONCLOSE"); $status("close:"+e);}
function onMsg(x)  {
    if (x.id) {
	var fn = Callbacks[x.id];
	if (fn) {
	    //LOG("YOU GOT A CALLBACK DEAL WITH IT");
	    Callbacks[x.id] = undefined;
	    fn(x);
	} else {
	    LOG("WIERD, CANT FIND CALLBACK FOR "+str(x));
	}
    } else {
	LOG("GOT MSG:"+str(x));
    }
}
//</script>
