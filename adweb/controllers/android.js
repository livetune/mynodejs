const fs =require('fs');
var fn_alldir = async (ctx, next) => {
    var file = fs.readdirSync('uploads');
    var onlyfile = file.filter(function (x) {
        return !fs.lstatSync('uploads/' + x).isDirectory();
    });

    var w = {};
    for (var i of file) {
        if (fs.lstatSync('uploads/' + i).isDirectory()) {
            var sonfile = fs.readdirSync('uploads/' + i);
            var tmp = {}; var dir = "";
            for (var son of sonfile) {

                dir += `${son} `;
            }
            w[i] = dir;
        }
        else {

        }
    }
    //console.log(fileall)
    ctx.response.body = JSON.stringify({ data: w });
}
module.exports = {
    'GET /alldir': fn_alldir
}