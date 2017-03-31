var fs =require('fs');
var deleteFolder = module.exports.deleteFolder = function(path){
    var files = [];
    if(fs.existsSync(path)){
        files= fs.readdirSync(path);
        files.forEach(function(file,index){
        var curPath = path + '/'+file;
        if(fs.statSync(curPath).isDirectory()){
            deleteFolder(curPath);
        }else{
            fs.unlinkSync(curPath);
        }
    })
    fs.rmdirSync(path);
    }
}