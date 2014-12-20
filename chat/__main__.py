import traceback as tb
from pubsub import PubSub
class PubSubMixin(object):
    "PubSub Mixin"
    Sessions = {}
    PS = PubSub()
    def pub(_,ch,msg):
        try:
            _._send(dict(method='pub',params=[ch,msg]))
        except:
            print "DIDNT WORK"
            tb.print_exc()
        pass
    def __init__(_,*a,**kw):
        _.Sessions[id(_)]=_
        super(PubSubMixin,_).__init__(*a,**kw)
        pass
    def close(_):
        del _.Sessions[id(_)]
        _.PS.unsub(_.subbed,_)
        super(PubSubMixin,_).close()
        pass
    def json_sub(_,new_ch,old_ch=[]):
        _.PS.unsub(old_ch,_)
        _.PS.sub(new_ch,_)
        # do subbed stuff here
        return dict(result=True)
    def json_pub(_,ch,msg):
        _.PS.pub(ch,msg)
        return dict(result=True)
    pass
####################################################
import mystarship
class ChatSession(mystarship.SessionBase,PubSubMixin):
    "Concrete session"
    def __init__(_,*a,**kw):
        super(ChatSession,_).__init__(*a,**kw)
        pass
    def close(_): super(ChatSession,_).close()
    def json_intro(_):
        return dict(result=['''
-- Welcome to the chat room!<br>
-- Make youself at home!<br>
-- Type .? for help<p>

You see nothing but darkness.
        '''])
    pass
####################################################

import bottle
app = bottle.default_app()

@app.route('/ws')
@app.route('/chat/ws')
def chat_ws():
    print "HEYHEYHEY"
    "serve up the websocket"
    s=ChatSession(bottle.request.environ["wsgi.websocket"])
    try   : s._dispatch_loop()
    except: s._return_error()

if __name__=='__main__': mystarship.launch()
