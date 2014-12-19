"""MyStarship Integrated Web Environment (IWE)

It's a web backend with the ability to edit files and manage processes
live in your browser.  Uses a nice async websocket backend.

"""
import os, os.path, sys, json, traceback as tb
def fwrite(f,value): f.write(value); return f

class SessionBase(object):
    "Base class for Websocket RPC Sessions."
    def __init__(_,ws,prefix='json_',*a,**kw):_.ws=ws;_.pfx=prefix;super(SessionBase,_).__init__(*a,**kw)
    def close(_): _.ws.close(); super(SessionBase,_).close()
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

def unblock(f):
    "sets file to nonblocked state.  sets proc's stdout/stderr to nonblocked"
    import os,fcntl,subprocess
    if type(f)==int:
        fd=f
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
        return f
    elif type(f)==subprocess.Popen:
        unblock(f.stderr)
        unblock(f.stdout)
        return f
    else:
        return unblock(f.fileno())

class ProcSessMixin(object):
    "Mix this in for process management"
    def __init__(_,*a,**kw): super(ProcSessMixin,_).__init__(*a,**kw)
    def close(_): super(ProcSessMixin,_).close()
    Procs = []
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
    def json_destroy(_,index):
        "destroy process (group)"
        p = _.Procs[int(index)]
        os.killpg((p.pid),9)
        return dict(result=True)
    def json_spawn(_,command,target='#edit',cwd=None,output=True):
        "remote system command with async output"
        import os
        import subprocess as sp
        p = unblock(sp.Popen(command,shell=True,cwd=cwd,
                             preexec_fn=os.setsid,
                             stdout=sp.PIPE,stderr=sp.PIPE))
        _.Procs.append(p)
        index = len(_.Procs)-1
        if output: _.json_spew(index)
        return dict(result=[command, repr(p), p.pid, index])
    def json_spew(_,index):
        "get remote job output"
        p = _.Procs[int(index)]
        import gevent
        def loop():
            while 1:
                gevent.sleep(0.1)
                try   : so=p.stdout.read(1024)
                except: so=''
                try   : se=p.stderr.read(1024)
                except: se=''
                if so or se:
                    _.ws.send(json.dumps(dict(method='spawn',params=dict(output=[so,se],index=index))))
                    pass
                pass
            pass
        gevent.spawn(loop)
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
    return web_static('editor.html')

_SessionClass=Session
def register_session_class(cls):
    global _SessionClass
    _SessionClass = cls
    pass
pass

@app.route('/ws')
def web_ws():
    "serve up the websocket"
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
