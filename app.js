var http = require("http");
var fs = require("fs");
var mime = require("mime");
var path = require("path");

http
  .createServer(function (req, res) {
    console.log(path.join(__dirname, "../", decodeURIComponent(req.url)));
    //     console.log(decodeURI(req.url));
    if (req.url != "/app.js") {
      var url = path.join(__dirname, "../", decodeURIComponent(req.url));
      fs.stat(url, function (err, stat) {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end("Your requested URI(" + req.url + ") wasn't found on our server");
        } else {
          var type = mime.getType(url);
          var fileSize = stat.size;
          var range = req.headers.range;
          if (range) {
            var parts = range.replace(/bytes=/, "").split("-");
            var start = parseInt(parts[0], 10);
            var end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            var chunksize = end - start + 1;
            var file = fs.createReadStream(url, { start, end });
            var head = {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": type,
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
              "Access-Control-Max-Age": 2592000, // 30 days
              /** add other headers as per requirement */
              "Access-Control-Allow-Headers": "Range",
            };
            res.writeHead(206, head);
            file.pipe(res);
          } else {
            var head = {
              "Content-Length": fileSize,
              "Content-Type": type,
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
              "Access-Control-Max-Age": 2592000, // 30 days
              /** add other headers as per requirement */
              "Access-Control-Allow-Headers": "Range",
            };
            res.writeHead(200, head);
            fs.createReadStream(url).pipe(res);
          }
        }
      });
    } else {
      res.writeHead(403, { "Content-Type": "text/html" });
      res.end("Sorry, access to that file is Forbidden");
    }
  })
  .listen(8080);
