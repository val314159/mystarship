var Channels = ["0x","n?","c0","yell","all"];

function appendHTML(html) { document.body.appendChild($I($DCE('div'),html)); }

function changeProp(x,pc,f){
    var ndx = -1;
    for(var n=0;n<Channels.length;n++) {
        if (Channels[n][0]==pc) {
            ndx = n;
            break;
        }
    }
    var oldName = Channels[ndx];
    var newName = Channels[ndx] = pc+x;
    if (!f) f==function(x){
        LOG("PUB2:"+str(x.result));
        RPC.rpcSend("pub",["all",[">> (%s)",getSelf()]],function(x){
            LOG("PUB2:"+str(x.result));
        });
    }
    RPC.rpcSend("sub",[[newName],[oldName]],f);
}
function changeName(x){
    changeProp(x,'n',function(x){
	LOG("PUB2:"+str(x.result));
        RPC.rpcSend("pub",["all",[">> Name Change (%s)",getSelf()]],function(x){
            LOG("PUB2:"+str(x.result));
        });
    });
}
function changeWho(){
    RPC.rpcSend("who",[],function(x){
            LOG("WHO:"+str(x.result));
            appendHTML("WHO:"+str(x.result));
        });
}
function changeChannel(x){
    changeProp(x,'c',function(x){
        LOG("PUB2:"+str(x.result));
        RPC.rpcSend("pub",["all",[">> Channel Change (%s)",getSelf()]],function(x){
            LOG("PUB2:"+str(x.result));
        });
    });
}
function findHush(x){
    var ndx = Channels.indexOf("yell");
    if (ndx==-1)
        ndx = Channels.indexOf("-yell");
    return ndx;
}
function changeHush(x){
    var ndx = findHush();
    var oldChannel = Channels[ndx];
    Channels[ndx]  = ((oldChannel=='yell') ? "-" : "")+"yell";
    RPC.rpcSend("sub",[[Channels[ndx]],[oldChannel]],function(x){
        RPC.rpcSend("pub",["all",[">> Name Change (%s)",getSelf()]],function(x){
            LOG("PUB2:"+str(x.result));
        });
    });
}
function changeYell(x){
    RPC.rpcSend("pub",["yell",[x,getSelf()]],function(x){
        LOG("PUB2:"+str(x.result));
    });
}
function changeSay(x){
    RPC.rpcSend("pub",[Channels[2],[x,getSelf()]],function(x){
        LOG("PUB:"+str(x.result));
    });
}
function changePrivate(x,y){
    LOG("QQQ");
    LOG("QWQWQW[["+x+"::"+y+"]]");
    RPC.rpcSend("pub",[x,[y,getSelf()]],function(x){
        LOG("PUB:"+str(x.result));
    });
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
        case 83: if (e.ctrlKey) { //s 
	    //addSay();
	    $E('#say').focus()
            e.preventDefault();
            break;
        }
        case 89: if (e.ctrlKey) { //y
            //addYell();
	    $E('#yell').focus()
            e.preventDefault();
            break;
        }
        case 80: if (e.ctrlKey) { //p
            //addPrivate();
	    $E('#private.dest').focus()
            e.preventDefault();
            break;
        }
    case 81: if (e.ctrlKey) { // q
	RPC.disconnect();
	break;
    }
    case 82: if (e.ctrlKey) { // r
	RPC.reconnect();
	break;
    }
    }
}
function getSelf(){
    return [Channels[1],Channels[0]];
}
RPC.reconnect(function(){
    LOG("CONNECTED");
    RPC.rpcSend("intro",[],function(x){
        LOG("INTRO:"+str(x.result));
        appendHTML(x.result[0]);
        RPC.rpcSend("sub",[Channels],function(x){
            LOG("SUB:"+str(x.result));
            RPC.rpcSend("pub",["c0",["HELLO HERE I AM",getSelf()]],function(x){
                LOG("PUB:"+str(x.result));
                RPC.rpcSend("pub",["yell",["HELLO HERE I AM",getSelf()]],function(x){
                    LOG("PUB2:"+str(x.result));
                });        
            });        
        });
    });
});
