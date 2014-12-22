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
    $E("#who").blur();
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
    var hushed = (oldChannel=='yell');
    Channels[ndx]  = ((hushed) ? "-" : "")+"yell";
    RPC.rpcSend("sub",[[Channels[ndx]],[oldChannel]],function(x){
	    var msg = (hushed) ? "hushed" : "unhushed" ;
	    RPC.rpcSend("pub",["all",[">> ("+getSelf()+") has "+msg]],function(x){
            LOG("PUB2:"+str(x.result));
        });
    });
}
function changeYell(x){
    $E("#yell").select();
    RPC.rpcSend("pub",["yell",["(*"+getSelf()+"*) "+x+""]],function(x){
        LOG("PUB2:"+str(x.result));
    });
}
function changeSay(x){
    $E("#say").select();
    RPC.rpcSend("pub",[Channels[2],["("+getSelf()+") " + x]],function(x){
        LOG("PUB:"+str(x.result));
    });
}
function changePrivate(x,y){
    $E("#private").select();
    RPC.rpcSend("pub",[x,["("+x+", p) " + y]],function(x){
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
var commandMode = true;
window.onkeydown=function(e){
    //LOG("SDGDF" + e.keyCode);
    switch(e.keyCode)
	{
	case 190: //'.'
	case 191: //'/'
	    {
		commandMode = true;
		e.preventDefault();
		LOG("ok:");
	    }
	break;
        case 78: if (commandMode || e.ctrlKey) { //n
            $E('#name').select();
            e.preventDefault();
	    commandMode = false;
            break;
        }
        case 67: if (commandMode || e.ctrlKey) { //c
            $E('#channel').select();
            e.preventDefault();
	    commandMode = false;
            break;
        }
        case 83: if (commandMode||e.ctrlKey) { //s 
	    //addSay();
	    $E('#say').select()
            e.preventDefault();
	    commandMode = false;
            break;
        }
        case 87: if (commandMode||e.ctrlKey) { //w
            //addYell();
	    $E('#who').select()
            e.preventDefault();
	    commandMode = false;
            break;
        }
        case 89: if (commandMode||e.ctrlKey) { //y
            //addYell();
	    $E('#yell').select()
            e.preventDefault();
	    commandMode = false;
            break;
        }
        case 80: if (commandMode||e.ctrlKey) { //p
            //addPrivate();
	    $E('#private.dest').select()
            e.preventDefault();
	    commandMode = false;
            break;
        }
    case 81: if (commandMode||e.ctrlKey) { // q
	RPC.disconnect();
	commandMode = false;
	break;
    }
    case 82: if (commandMode||e.ctrlKey) { // r
	RPC.reconnect();
	commandMode = false;
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
        });
    });
});

$E("#who").onkeydown=function(e){
	if (e.keyCode==13) {
	    LOG("YAY");
	    changeWho();
	}
}
