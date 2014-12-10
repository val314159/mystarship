from prelude import *
from bottle import route,request,response,static_file,default_app

@route('/static/<path:path>')
def server_static(path):return static_file(path,root='static')

@route('/')
def index():return static_file('x.html',root='static')

class SessionBase:
    def __init__(_,ws,prefix='json_'):_.ws=ws;_.pfx=prefix
    def _dispatch_message(_,message=None,obj=None):
        if obj is None: obj = _
        if message is None: message = _.ws.receive()
        print "MSG", repr(message)
        if not message: return False
        msg = json.loads(message)
        print "MSG", repr(msg)
        def dispatch(method,params,id=None):
            fn = getattr(obj,_.pfx+method)
            if   type(params)==type([]): return fn( *params)
            elif type(params)==type({}): return fn(**params)
            raise "HELL"
        ret = dispatch(**msg)
        if ret:
            if 'id' in msg: ret['id'] = msg.get('id')
            if 'method' in msg: ret['method'] = msg.get('method')
            _.ws.send(json.dumps(ret))
            pass
        return True
       
class Session(SessionBase):
    def json_save(_,name,value):
        fwrite(open(name,'w'),value).close()
        return dict(result=['ok'])
    def json_load(_,name,target='#edit'):
        try:
            result=[open(name).read(),target]
        except IOError:
            result=[os.listdir(name), target]
            pass
        return dict(result=result)
    def json_reboot(_):
        print "HOW TO REBOOT????"
        return dict(result=True)
    def json_system(_,command,target='#edit'):
        import subprocess as sp
        z = sp.Popen(command,shell=True,
                     stdout=sp.PIPE,
                     stderr=sp.PIPE).communicate()        
        return dict(result=[command]+list(z))
    pass

@route('/ws')
def ws():
    s=Session(request.environ["wsgi.websocket"])
    while s._dispatch_message(): pass
    pass

app = default_app()

if __name__=='__main__':
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer(('',7070),app,handler_class=WSH).serve_forever()
