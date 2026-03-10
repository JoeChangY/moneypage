const http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs');

const proxy = httpProxy.createProxyServer({});

const logFile = fs.createWriteStream('./requests.log');

proxy.on('proxyReq', function (proxyReq, req, res, options) {
    //Log incoming request headers
    logFile.write(JSON.stringify(req.headers, true, 2));
});

const server = http.createServer(function (req, res) {
    proxy.web(req, res, {
        changeOrigin: true,
        target: 'example1.com'
    });
});

console.log("listening on port 5050")
server.listen(5050);
