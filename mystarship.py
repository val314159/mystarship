import os, sys, json, traceback as tb
def fwrite(f,value): f.write(value); return f

import bottle
app = bottle.default_app()

StaticRoot = os.environ.get('STATIC_ROOT','static')

@app.route('/static/<path:path>')
def server_static(path):return bottle.static_file(path,root=StaticRoot)

@app.route('/')
def index():return server_static('x.html')

@app.route('/ws')
def ws():
    s=Session(bottle.request.environ["wsgi.websocket"])
    try:
        while s._dispatch_message(): pass
    except:
        print '*'*80
        tb.print_exc()
        print '*'*80
        _.ws.send(dict(error=True,stacktrace=tb.format_exc().split('\n')))
        pass
    pass

class SessionBase:
    def __init__(_,ws,prefix='json_'):_.ws=ws;_.pfx=prefix
    def _dispatch_message(_,message=None,obj=None):
        if obj is None: obj = _
        if message is None: message = _.ws.receive()
        print "MESSAGE", repr(message)
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

class FsSessMixin:
    def json_save(_,name,value):
        fwrite(open(name,'w'),value).close()
        return dict(result=['ok'])
    def json_load(_,name,target='#edit'):
        try:
            result=[open(name).read(),target]
        except IOError:
            result=[os.listdir(name), target]
            pass
        print "LOAD RESULT", repr(result)
        return dict(result=result)
class ProcSessMixin:
    def json_system(_,command,target='#edit',cwd=None):
        import subprocess as sp
        z = sp.Popen(command,shell=True,cwd=cwd,
                     stdout=sp.PIPE,
                     stderr=sp.PIPE).communicate()
        return dict(result=[command]+list(z))

class Session(SessionBase,FsSessMixin,ProcSessMixin):
    pass



if __name__=='__main__':
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer(('localhost',7070),app,handler_class=WSH).serve_forever()
