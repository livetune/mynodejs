function replaceStr(str) { // 正则法
    str += '';
    str = str.toLowerCase();
    var reg = /\b(\w)|\s(\w)/g; //  \b判断边界\s判断空格
    return str.replace(reg, function (m) {
        return m.toUpperCase()
    });
}


var datajson;
$(document).ready(function () {

    var item_li = $("item_li");
    var content_item = $("content_item");
    item_li = item_li.children;
    // content_item = content_item.getElementsByClassName("content");

    for (var i = 0; i < item_li.length; i++) {

        (function (index) {
            $("#item_li li").eq(index).click(function () {
                var class_name = $("#content_item div").eq(index).attr("class");
                console.log(class_name)
                var str = class_name.split(" ");
                $("#content_item").children("div").each(function (p, q) {
                    $(q).attr("class", str[0])
                })
                $("#content_item div").eq(index).attr("class", str[0] + " show");

            })
        })(i);
    }

    $("#btn1").click(function () {
        $.get("/all", function (data, status) {
            //alert("数据：" + data + "\n状态：" + status);
            //  var d = {"sds" : "sdas","dsds":"ssss"}
            datajson = JSON.parse(data);

            $("#list1").empty();
            $("#list2").empty();
            for (var item in datajson) {
                $("#list1").append(`<option value="${item}">${item}</option>`)
            }
            var near = datajson["near"];
            for (var item in near) {
                if (item != 'sum') {
                    $("#list2").append(`<option value="${near[item]}">${replaceStr(near[item])}</option>`)
            }
            }
        });
    });
});


function change() {
    var x = document.getElementById("list1");
    var y = document.getElementById("list2");
    var index = x.selectedIndex;
    y.options.length = 0; // 清除second下拉框的所有内容  
    for (var fname in datajson) {
        if (x.options[index].value == fname) {
            var near = datajson[fname];
            for (var item in near)
                if(item!="sum")
                $("#list2").append(`<option value="${near[item]}">${replaceStr(near[item])}</option>`)
        }
    }

}

function imgPreview(fileDom) {
    //判断是否支持FileReader
    if (window.FileReader) {
        var reader = new FileReader();
    } else {
        alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
    }

    //获取文件
    var file = fileDom.files[0];
    var imageType = /^image\//;
    //是否是图片
    if (!imageType.test(file.type)) {
        alert("请选择图片！");
        return;
    }
    //读取完成
    reader.onload = function (e) {
        //获取图片dom
        var img = document.getElementById("preview");
        //图片路径设置为读取的图片
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function delPreview(fileDom) {
    //判断是否支持FileReader
    //获取图片dom
    var dir = $("#list1").val();
    var name = $("#list2").val();
    console.log(name)
    var img = document.getElementById("preview1");
    //图片路径设置为读取的图片
    $.get(`/showdir/${dir}/${name}`, function (data, status) {
        var deljson = JSON.parse(data);
        for(var u in deljson){
           if(isImg(deljson[u]))
            {
                img.src = deljson[u];
                return;
        }
        }
    })
    
}

function isImg(url){
    var type = ["jpeg",'bmp','jpg','png',"tiff","gif"]
    for(t in type){
        if(url.endsWith(type[t]))
        return true;
    }
    return false;
}