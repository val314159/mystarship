from prelude import *
import bottle

app = bottle.default_app()

@app.route('/static/<path:path>')
def server_static(path):return bottle.static_file(path,root='static')

@app.route('/')
def index():return bottle.static_file('y.html',root='static')

@app.route('/ws2')
def ws2():
    s=Session(bottle.request.environ["wsgi.websocket"])
    while s._dispatch_message(): pass
    pass

class PubSubMixin:
    def json_pub(_,name,value):
        fwrite(open(name,'w'),value).close()
        return dict(result=['ok'])
    def json_sub(_,name,target='#edit'):
        try:
            result=[open(name).read(),target]
        except IOError:
            result=[os.listdir(name), target]
            pass
        return dict(result=result)
    def json_channels(_,target='#edit'):
        return dict(result=True)
    pass

from sess import SessionBase
class Session(SessionBase,PubSubMixin):
    pass


if __name__=='__main__':
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer(('',6060),app,handler_class=WSH).serve_forever()
