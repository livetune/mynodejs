const Koa = require('koa');
const router = require('koa-router')(); // v6
const multer = require('koa-multer');
var path = require('path');
var serve = require('koa-static');
const app = new Koa();
var fs = require('fs');
var send = require('koa-send');
const bodyParser = require('koa-bodyparser');
const config = require('./config')
const session = require('koa-session');
const convert = require('koa-convert');

const controller = require('./controller');

app.use(bodyParser());
app.use(controller());
app.use(router.routes())
    .use(router.allowedMethods());

// session存储配置
// 配置session中间件
app.use(convert(session(app)));
//app.use(logger());
app.keys = ['some secret hurr'];
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log(req.body['actlist'])
        var dir = 'uploads/' + req.body['actlist'] + '/' + req.body['dirname'];
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir)
        cb(null, dir);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

app.use(async (ctx, next) => {
    await next();
    if (ctx.response.body || !ctx.response.idempotent) return;

    ctx.redirect('/404.html');

});

app.use(async function (ctx, next) {
    //if ('/' == ctx.path) return ctx.body = 'Try GET /package.json';
    await next();
    if ('/download' == ctx.path.substring(0, 9)) {
        console.log(ctx.path)
        await send(ctx, ctx.path.replace('download', 'uploads'));
    }
})


app.use(convert(serve(path.join(__dirname, '/public'))));


router.post('/upload', upload.array('file'), function (ctx, next) {
    //ctx.body = ctx.request.body['a'];
    //console.log (ctx.request.body['actlist']+ctx.request.body['dirname']);
    ctx.body = "upload is success";

    ctx.redirect('/file.html');
});

app.listen(57451);
console.log('listening on port 57451');
