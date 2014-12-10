//<div id=out></div><script>

function WS(path) {
  var _ws = new WebSocket('ws://'+location.host+path);
  _ws.onopen  = onOpen;
  _ws.onerror = onError;
  _ws.onclose = onClose;
  _ws.onmessage=function(x){onMsg(JSON.parse(x.data))};
  return _ws;
}

var Rpc;
function rpcSend(method,params) {
    Rpc.send(str({id:getId(),method:method,params:params}))
}
function rpcReconnect(){
    if (Rpc)
	Rpc.close();
    Rpc = WS('/ws')
    return Rpc;
}

var _status="dunno1";
function $status(x){
    $E('#status').innerHTML = x;
    _status = x;
    return self;
}
function onOpen()  {LOG("ONOPEN");  $status("open");}
function onError(e){LOG("ONERROR"); $status("error:"+e);}
function onClose(e){LOG("ONCLOSE"); $status("close:"+e);}
function onMsg(x)  {
    LOG("===="+str(x));

    if (x.method=="system") {
	//LOG("]]]] SYSTEM RETURNED:"+str(x));
	$E('#command').innerHTML = x.result[0];
	$E('#stdout').innerHTML = x.result[1];
	$E('#stderr').innerHTML = x.result[2];
	return;
    }

    if (x.method=="load") {
    }

    var result = x.result;
    var _0 = result[0];
    var _1 = result[1];
    if (typeof(_0)=="string") {
	$E(_1).innerHTML = _0;
    } else {
	var path = $E('#path').value
	$E('#dir').innerHTML = ''
	for (var n=0; n<_0.length; n++) {
	    var k2=path+'/'+_0[n];
	    var link = "<a href='#"+k2+"'"+
		" onclick=e.load('"+k2+"')>"+k2+"</a>";
	    $E('#dir').innerHTML += link+'<br>';
	}
    }
}
//</script>