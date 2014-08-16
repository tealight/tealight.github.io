import tornado.ioloop
import tornado.web
import tornado.websocket
import json

clients = {}

class WebSocketHandler(tornado.websocket.WebSocketHandler):

  def check_origin(self, origin):
    return True

  def open(self, *args):

    self.app = args[0]

    clients[self.app] = clients.get(self.app) or []

    clients[self.app].append(self)

    print "Added client for \"%s\" app: %s" % (self.app, self.request.remote_ip)

  def on_message(self, message):
    print "%s (%s) says: %s" % (self.app, self.request.remote_ip, message)

    obj = json.loads(message)
    for client in clients[self.app]:
        client.write_message(message)

  def on_close(self):
  	clients[self.app].remove(self)

app = tornado.web.Application([(r'/(.*)', WebSocketHandler)])

app.listen(9090)

tornado.ioloop.IOLoop.instance().start()
