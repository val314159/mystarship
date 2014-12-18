import mystarship

class ChatSession(mystartship.SessionBase):
    "Concrete session"
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
