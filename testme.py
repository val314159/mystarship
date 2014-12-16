
import sys, datetime, time

pfx = lambda: str(datetime.datetime.now())+':'

while 1:
    time.sleep(1.5)
    print >>sys.stdout, pfx()+"oone"
    print >>sys.stdout, pfx()+"otwo"
    print >>sys.stdout, pfx()+"othree"
    print >>sys.stderr, pfx()+"eone"
    print >>sys.stderr, pfx()+"etwo"
    print >>sys.stderr, pfx()+"ethree"
    pass
