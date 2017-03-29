const Koa = require('koa');
const url = require('url');
const router = require('koa-router')(); // v6
var path = require('path');
var Static = require('koa-static');
const app = new Koa();
var http = require('http');
var fs = require('fs');
var send = require('koa-send');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const convert = require('koa-convert');
const ws = require("ws");
const WebSocketServer = ws.Server;
const https = require('https');
var options = {
    key: fs.readFileSync("./privatekey.pem"),
    cert: fs.readFileSync("./certificate.pem"),
    passphrase: '13544007502'
}
//const controller = require('./controller');
var index = 1;
let server = app.listen(3000);
var servers = https.createServer(options, app.callback()).listen(3011, function () {
    console.log('Https server listening on port ' + 3011);
});

app.use(bodyParser());
//app.use(controller());
app.use(router.routes())
    .use(router.allowedMethods());

// session存储配置
// 配置session中间件
app.use(convert(session(app)));
//app.use(logger());
app.keys = ['some secret hurr'];

app.use(convert(Static(path.join(__dirname, '/public'))));

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url} ...`);
    await next();
})


function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    let wss = new WebSocketServer({
        server: servers
    });
    // wss.broadcast = function broadcast(data) {
    //     wss.clients.forEach(function each(client) {
    //         client.send(data);
    //     });
    // };
    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, message) {
        console.log(`[WebSocket] closed: ${code} - ${message}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };
    wss.on('connection', function (ws) {
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);

        ws.on('message', function (message) {
            wss.broadcast(message,ws)
        });
        ws.on('close', onClose);
        ws.on('error', onError);
        // // check user:
        // let user = parseUser(ws.upgradeReq);
        // if (!user) {
        //     ws.close(4001, 'Invalid user');
        // }
        // ws.user = user;
        // ws.wss = wss;
        // onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    wss.broadcast = function (data, exclude) {
        var i = 0, n = this.clients ? this.clients.length : 0, client = null;
        if (n < 1) return;
        console.log("Broadcasting message to all " + n + " WebSocket clients.");
        for (; i < n; i++) {
            client = this.clients[i];
            // don't send the message to the sender...
            if (client === exclude) continue;
            if (client.readyState === client.OPEN) client.send(data);
            else console.error('Error: the client state is ' + client.readyState);
        }
    };
    return wss;
}


function createMessage(type, user, data) {
    messageIndex++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnect() {
    console.log("connection");
}

function onMessage(message) {
    console.log(message);
   // wss.broadcast(message, ws);
}

function onClose() {
    // let user = this.user;
    // let msg = createMessage('left', user, `${user.name} is left.`);
    // this.wss.broadcast(msg);
    console.log("close");
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);


console.log('listening on port 3000');
