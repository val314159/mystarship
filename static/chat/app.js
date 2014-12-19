
function appendHTML(html) {
  document.body.appendChild($I($DCE('div'),html));
}

var RPC=new WS(":7001/chat/ws",function(x){ // update status
	$E('#status').innerHTML=x;
},function(x){ // non-id message type
	LOG("EXT:"+x);
        if (x.method=="pub") {
          appendHTML(x.params.join(": "));
        } else {
          LOG("Unknown non-id type (expected pub)");
        }
});
window.onkeydown=function(e){
    LOG("SDGDF" + e.keyCode);
    switch(e.keyCode){
        case 78: if (e.ctrlKey) { //n
            $E('#name').select();
            e.preventDefault();
            break;
        }
        case 67: if (e.ctrlKey) { //c
            $E('#channel').select();
            e.preventDefault();
            break;
        }
    }
}
RPC.reconnect(function(){
    LOG("CONNECTED");
    RPC.rpcSend("intro",[],function(x){
        LOG("INTRO:"+str(x.result));
        appendHTML(x.result[0]);
        RPC.rpcSend("sub",[["0x","n?","c0","yell","all"]],function(x){
            LOG("SUB:"+str(x.result));
            RPC.rpcSend("pub",["c0","HELLO HERE I AM"],function(x){
                LOG("PUB:"+str(x.result));
                RPC.rpcSend("pub",["yell","HELLO HERE I AM"],function(x){
                    LOG("PUB2:"+str(x.result));
                });        
            });        
        });
    });
});
