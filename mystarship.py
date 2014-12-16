"""MyStarship Integrated Web Environment (IWE)

It's a web backend with the ability to edit files and manage processes
live in your browser.  Uses a nice async websocket backend.

"""
import os, os.path, sys, json, traceback as tb
def fwrite(f,value): f.write(value); return f

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
    def _return_error(_):
        print '*'*80
        tb.print_exc()
        print '*'*80
        _.ws.send(dict(error=True,stacktrace=tb.format_exc().split('\n')))
        pass
    def _dispatch_loop(_):
        while _._dispatch_message(): pass

class FsSessMixin:
    "Mix this in for filesystem management"
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
		out=os.listdir(name)
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

class ProcSessMixin:
    "Mix this in for process management"
    Procs = []
    def json_jobs(_,target='#edit'):
        "get jobs table."
        return dict(result=[dict(index=n,pid=p.pid)
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
        #os.killpg(os.getpgid(p.pid),9)	
        return dict(result=True)
    def json_spawn(_,command,target='#edit',cwd=None):
        "remote system command with async output"
        import os
        import subprocess as sp
        p = unblock(sp.Popen(command,shell=True,cwd=cwd,
                             preexec_fn=os.setsid,
                             stdout=sp.PIPE,stderr=sp.PIPE))
        _.Procs.append(p)
        index = len(_.Procs)-1
        import gevent
        def loop():
            while 1:
                gevent.sleep(1)
                try   : so=p.stdout.read(1024)
                except: so=''
                try   : se=p.stderr.read(1024)
                except: se=''
                if so or se:
                    _.ws.send(json.dumps(dict(result=dict(output=[so,se],index=index))))
                    pass
                pass
            pass
        gevent.spawn(loop)
        return dict(result=[command, repr(p), p.pid, index])
    def json_read_async(_,index):
	p = _.Procs[int(index)]
	so=p.stdout.read(1024)
	se=p.stderr.read(1024)
	return dict(result=dict(output=[so,se],index=index))
class Session(SessionBase,FsSessMixin,ProcSessMixin):
    "Concrete session for managing files and procs"
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
    return web_static('x.html')

@app.route('/ws')
def web_ws():
    "serve up the websocket"
    s=Session(bottle.request.environ["wsgi.websocket"])
    try   : s._dispatch_loop()
    except: s._return_error()

if __name__=='__main__':
    from gevent.pywsgi import WSGIServer
    from geventwebsocket.handler import WebSocketHandler as WSH
    WSGIServer(('localhost',7070),app,handler_class=WSH).serve_forever()
