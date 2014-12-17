function WS(path,$status,extra) {
  var self=this;
  Callbacks = {};
  var _ws;

  self.noconnect = function(){};
  self.onconnect = self.noconnect;
  self.onmsg=function(x){
      //LOG(" $$$$ MSG $$$$ " + str(x));
    if (x.id) {
	var fn = Callbacks[x.id];
	if (fn) {
	    Callbacks[x.id] = undefined;
	    fn(x);
	} else {
	    LOG("WIERD, CANT FIND CALLBACK FOR "+str(x));
	}
    } else {
	if (extra) extra(x);
	else LOG("GOT MSG:"+str(x));
    }
  };

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
    _ws = new WebSocket('ws://'+location.host+path);
    _ws.onopen  = function() {LOG("ONOPEN"); $status("open");self.onconnect()};
    _ws.onerror = function(e){LOG("ONERROR");$status("error:"+e);};
    _ws.onclose = function(e){LOG("ONCLOSE");$status("close:"+e);};
    _ws.onmessage=function(x){self.onmsg(JSON.parse(x.data))};
    self.onconnect = onconnect? onconnect : self.noconnect;
    return self;
  };
}

