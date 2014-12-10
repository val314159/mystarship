function str(x){return JSON.stringify(x)}
function $DCE(x){return document.createElement(x)}
function $E(x){return document.getElementById(x.substr(1))}
function $I(e,v){e.innerHTML=v;return e}
function LOG(x){$E('#out').appendChild($I($DCE('li'),x))}
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
    return text;
}
