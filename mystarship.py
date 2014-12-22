"""MyStarship Integrated Web Environment (IWE)

It's a web backend with the ability to edit files and manage processes
live in your browser.  Uses a nice async websocket backend.

"""
import gevent.monkey ; gevent.monkey.patch_all()
import os, os.path, sys, json, traceback as tb, gevent
def fwrite(f,value): f.write(value); return f

class SessionBase(object):
    "Base class for Websocket RPC Sessions."
    def __init__(_,ws,prefix='json_',*a,**kw):
        _.ws, _.pfx = ws, prefix
        super(SessionBase,_).__init__(*a,**kw)
        pass
    def close(_): _.ws.close(); super(SessionBase,_).close()
    def _dispatch_message(_,message=None,obj=None):
        if obj is None: obj = _
        if message is None: message = _.ws.receive()
        #print "MESSAGE", repr(message)
        if not message: return False
        msg = json.loads(message)
        print "====================MSG", repr(msg)
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
    def _return_error(_):
        print '*'*80
        tb.print_exc()
        print '*'*80
        _.ws.send(dict(error=True,stacktrace=tb.format_exc().split('\n')))
        pass
    def _send(_,msg):
        _.ws.send(json.dumps(msg))
    def _dispatch_loop(_):
        while _._dispatch_message(): pass
        _.close()

class FsSessMixin(object):
    "Mix this in for filesystem management"
    def __init__(_,*a,**kw): super(FsSessMixin,_).__init__(*a,**kw)
    def close(_): super(FsSessMixin,_).close()
    def json_save(_,name,value,offset=0,partial=False):
        "save a file (or file data)"
        fwrite(open(name,'w'),value).close()
        return dict(result=['ok'])
    def json_load(_,name,target='#edit',offset=0,size=-1):
        "load a file (or file data)"
	b=''
	try:
		out=open(name).read()
                import os.path
		a,b=os.path.split(name)
	except IOError:
		import os
                def valid(x):
                    if x.startswith('./.'): return False
                    return True
                out = [(a,[z for z in c if not z.endswith('~')]) for a,b,c in os.walk('.') if valid(a)]
		a=name
		pass
        if a[-1]=='/': a=a[:-1]
        result=[out,target,a,b]
        print "LOAD RESULT", repr(result)
        return dict(result=result)

class ProcSessMixin(object):
    "Mix this in for process management"
    def __init__(_,*a,**kw): super(ProcSessMixin,_).__init__(*a,**kw)
    def close(_): super(ProcSessMixin,_).close()
    Procs = []
    Procs2 = {}
    def json_jobs(_,target='#edit'):
        "get jobs table."
        return dict(result=[dict(index=n,pid=p.pid,poll=p.poll())
                            for n,p in enumerate(_.Procs)])
    def json_system(_,command,target='#edit',cwd=None):
        "remote system command.  json_spawn is better."
        import subprocess as sp
        z = sp.Popen(command,shell=True,cwd=cwd,
                     stdout=sp.PIPE,
                     stderr=sp.PIPE).communicate()
        return dict(result=[command]+list(z))
    def find_cmd(_,index):
        p = _.Procs[int(index)]
        for k,v in _.Procs2.iteritems():
            if p==v:
                return k,v
            pass
        return None,None
    def json_restart(_,index,target='#edit'):
        cmd,p = _.find_cmd(index)
        _.json_destroy(index)
        _.json_spawn(cmd,target)
        pass
    def json_destroy(_,index):
        "destroy process (group)"
        k,p = _.find_cmd(index)
        os.killpg(p.pid,9)
        if k:
            del _.Procs2[k]
            pass
        return dict(result=True)
    def json_spawn(_,command,target='#edit',cwd=None,output=True):
        "remote system command with async output"
        import os
        import subprocess as sp
        p = sp.Popen(command,shell=True,cwd=cwd,
                     preexec_fn=os.setsid, close_fds=True,
                     stdout=sp.PIPE,stderr=sp.PIPE)
        _.Procs2[command] = p
        _.Procs.append(p)
        index = len(_.Procs)-1
        print 100
        if output: _.json_spew(index)
        print 200
        return dict(result=[command, repr(p), p.pid, index])
    def json_spew(_,index):
        "get remote job output"
        p = _.Procs[int(index)]
        def loop_stdout():
            while 1:
                print "FDOUT", p.stdout.fileno
                x = gevent.os.tp_read(p.stdout.fileno(),1024)
                _.ws.send(json.dumps(dict(method='spawn',params=dict(output=[x,''],index=index))))
                pass
            pass
        def loop_stderr():
            while 1:
                print "FDERR", p.stderr.fileno
                x = gevent.os.tp_read(p.stderr.fileno(),1024)
                _.ws.send(json.dumps(dict(method='spawn',params=dict(output=['',x],index=index))))
                pass
            pass
        gevent.spawn(loop_stdout)
        gevent.spawn(loop_stderr)
        return dict(result=True)

class Session(SessionBase,FsSessMixin,ProcSessMixin):
    "Concrete session for managing files and procs"
    def __init__(_,*a,**kw): super(Session,_).__init__(*a,**kw)
    def close(_): super(Session,_).close()
    pass

####################################################

import bottle
app = bottle.default_app()

StaticRoot = os.environ.get('STATIC_ROOT','static')

@app.route('/static/<path:path>')
def web_static(path):
    "serve up static files"
    return bottle.static_file(path,root=StaticRoot)

@app.route('/')
def web_root():
    "serve up /"
    return web_static('index.html')

_SessionClass=Session
def register_session_class(cls):
    global _SessionClass
    _SessionClass = cls
    pass
pass

@app.route('/chat/ws')
@app.route('/ws')
def web_ws():
    "serve up the websocket"
    print _SessionClass
    s=_SessionClass(bottle.request.environ["wsgi.websocket"])
    try   : s._dispatch_loop()
    except: s._return_error()

def launch():
    host=os.environ.get('HOST','localhost')
    port=int(os.environ.get('PORT','7070'))
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer((host,port),app,handler_class=WSH).serve_forever()

if __name__=='__main__': launch()
