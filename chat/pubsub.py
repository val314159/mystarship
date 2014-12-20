class PubSub(object):
    """
    Generic PubSub Object.  If you sub, you'll get pub called on you.
    """
    def __init__(_,*a,**kw):
        import collections
        _.channels=collections.defaultdict(list)
        super(PubSub,_).__init__(*a,**kw)
    def unsub(_,old_channels,x):
        for c in old_channels:
            _.channels[c].remove(x)
            pass
        pass
    def sub(_,new_channels,x):
        for c in new_channels:
            _.channels[c].append(x)
            pass
        pass
    def pub(_,ch,msg):
        for x in _.channels[ch]:
            x.pub(ch,msg)
            pass
        pass
    pass
