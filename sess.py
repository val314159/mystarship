from prelude import *

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


