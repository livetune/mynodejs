var del = require('../deleteFolder');
const fs = require('fs');
const config = require('../config');
var fn_delete = async (ctx, next) => {

    var dir1 = ctx.request.body['dellist'];
    var dir2 = ctx.request.body['deldir'];
    var path = 'uploads/' + dir1 + '/' + dir2;
    del.deleteFolder(path);
    ctx.redirect('/file.html');
}

var fn_all = async (ctx, next) => {

    var file = fs.readdirSync('uploads');
    var onlyfile = file.filter(function (x) {
        return !fs.lstatSync('uploads/' + x).isDirectory();
    });
    var fileall = {};
    for (var file1 of file) {
        if (fs.lstatSync('uploads/' + file1).isDirectory()) {
            var sonfile = fs.readdirSync('uploads/' + file1);
            var tmp = {};
            var i = 0 + '';
            tmp["sum"] = sonfile.length;
            for (var son of sonfile) {
                tmp[file1 + i] = son;
                i++;
            }
            fileall[file1] = tmp;
        }

    }
    if (onlyfile.length != 0)
        fileall['file'] = onlyfile;
    ctx.response.body = JSON.stringify(fileall);
}

var fn_show = async (ctx, next) => {
    var w = "";
    var name = ctx.params.name;
    var dir = ctx.params.dir;
    // name = name.replace('+','/');
    var file = fs.readdirSync('uploads/' + dir + "/" + name);
    file = file.map(function (x) {
        return "http://"+config.serverroot + "+/download/" + dir + "/" + name + '/' + x;
    })
    for (var i of file)
        w += `${i} `
    ctx.response.body = JSON.stringify({ data: { url: w } });
}

var fn_showdir = async (ctx, next) => {
    var w = "";
    var name = ctx.params.name;
    var dir = ctx.params.dir;
    var file = fs.readdirSync('uploads/' + dir + "/" + name);
    file = file.map(function (x) {
        return "http://"+config.serverroot+ "/download/" + dir + "/" + name + '/' + x;
    })
    ctx.response.body = JSON.stringify(file);
}
module.exports = {
    'GET /showdir/:dir/:name': fn_showdir,
    'GET /show/:dir/:name': fn_show,
    'GET /all': fn_all,
    'POST /delete': fn_delete
}