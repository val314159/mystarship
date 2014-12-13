from prelude import *
import bottle

app = bottle.default_app()

@app.route('/static/<path:path>')
def server_static(path):return bottle.static_file(path,root='static')

@app.route('/')
def index():return bottle.static_file('x.html',root='static')

@app.route('/ws')
def ws():
    s=Session(bottle.request.environ["wsgi.websocket"])
    while s._dispatch_message(): pass
    pass

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

from sess import SessionBase
class Session(SessionBase,FsSessMixin,ProcSessMixin):
    pass

if __name__=='__main__':
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer(('localhost',7070),app,handler_class=WSH).serve_forever()
