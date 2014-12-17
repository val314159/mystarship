var RPC=new WS("/ws",function(x){$E('#status').innerHTML=x});
function mkThing(_1,_2){
  var _0=_1+'/'+_2;
  return "<a onclick=load('"+_0+"') href='#"+_0+"'>"+_2+"</a><br>";
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
      elt.innerHTML += mkThing(x.result[2],files[n])
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

RPC.reconnect(function(){ load('.') });
var editor1 = new G.BufEd("bufed_a");
var editor2 = ace.edit("bufed_b");
