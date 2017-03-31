const User = require('../mysql.js');
module.exports = {
    "GET /file.html": async (ctx, next) => {
        console.log("file")
        console.log(ctx.session)
        if (ctx.session.isLogin != true) {
            ctx.redirect('/');
        }
        await next();
    },
    'POST /login': async (ctx, next) => {
        var usr;
        await (async () => {
            usr = await User.User.findAll({
                where: {
                    id: '1'
                }
            });

        })();
        console.log("login")
        var password = ctx.request.body["password"];
        var username = ctx.request.body["username"];
        //var userdata = userData("1");
       if(username == usr[0]["name"]&&password == usr[0]["password"]){
            ctx.session.isLogin = true;
            console.log(ctx.session)
            ctx.redirect('/file.html');
        } else {
            ctx.redirect('/');
        }
        await next();
    }
}
