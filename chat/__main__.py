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
    def dump(_):
        from collections import defaultdict
        out = defaultdict(list)
        for k,v in _.PS.channels.iteritems():
            for u in v:
                out[ hex(id(u)) ].append( k )
                pass
            pass
        return out
    def json_who(_):
        return dict(result=_.dump())
    def json_sub(_,new_ch,old_ch=[]):
        _.PS.unsub(old_ch,_)
        _.PS.sub(new_ch,_)
        # do subbed stuff here

        print '/*'*80
        _.dump()
        print '\\*'*80

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
if __name__=='__main__':
    mystarship.register_session_class(ChatSession)
    mystarship.launch()
