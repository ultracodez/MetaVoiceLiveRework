var finalhandler = require("finalhandler");
var http = require("http");
var serveStatic = require("serve-static");

function setupFrontendServer(servePath) {
  // Serve up public/ftp folder
  var serve = serveStatic(servePath, {
    index: ["index.html", "index.htm"],
    extensions: ["html", "htm"],
  });

  // Create server
  var server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res));
  });

  // Listen
  server.listen(0);

  return server;
}

module.exports = { setupFrontendServer };
