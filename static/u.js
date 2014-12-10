function str(x){return JSON.stringify(x)}
function $DCE(x){return document.createElement(x)}
function $E(x){return document.getElementById(x.substr(1))}
function $I(e,v){e.innerHTML=v;return e}
function LOG(x){$E('#out').appendChild($I($DCE('li'),x))}
var ___id=100;
function getId(){return ++___id}
