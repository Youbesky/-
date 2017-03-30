/**
 * Created by Administrator on 2017/3/29.
 */
    var canvas = document.getElementById("canvas");
    canvas.width = Math.min(560,$(window).width() - 20);
    canvas.height = Math.min(560,$(window).width() - 20);
    var context = canvas.getContext("2d");
    //书写之前的初始状态信息
    var isMouseDown = false;//设置鼠标动作起始状态
    var lastLocation = {x:0,y:0};//设置鼠标默认坐标
    var lastTimestamp = 0;//用于计算笔画粗细
    var lastLineWidth = 1;//设置开始笔画粗细
    var strokeColor = "black";//设置默认笔画颜色

//调整控件自适应
$("#controller").css("width",canvas.width+"px");

    drawGrid();

//清除书写内容
$("#clear_btn").click(function (e) {
    context.clearRect(0,0,canvas.width,canvas.height);
    drawGrid();
});
//换笔画颜色
$(".color_btn").click(
    function (e) {
        $(".color_btn").removeClass("color_btn_selected");
        $(this).addClass("color_btn_selected");
        strokeColor = $(this).css("background-color");
    }
);
//检测书写事件开始
function beginStroke(point) {
    isMouseDown = true;
// 下面的这段代码是为了测试开始时鼠标的位置
// var location = windowToCanvas(event.clientX,event.clientY);
//lastLocation是上一次的鼠标位置
    lastLocation = windowToCanvas(point.x,point.y);
    lastTimestamp = new Date().getTime();

//  console.log("x:"+location.x,"y:"+location.y);
}
//检测书写事件结束
function endStroke() {
    isMouseDown = false;
}
//检测书写事件过程
function moveStroke(point) {
    var currentLocation = windowToCanvas(point.x,point.y);
    var curTimestamp = new Date().getTime();
    var s = drawDistance(currentLocation,lastLocation);
    var t = curTimestamp - lastTimestamp;

    var lineWidth = calcLineWidth(t,s);

    //画笔绘制状态
    context.beginPath();
    context.moveTo(lastLocation.x,lastLocation.y);
    context.lineTo(currentLocation.x,currentLocation.y);
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = strokeColor;
    context.stroke();

    lastLocation = currentLocation;//每个鼠标移动都更新鼠标位置
    lastTimestamp = curTimestamp;//每次鼠标移动都更新时间
    lastLineWidth = lineWidth;
    console.log("lineWidth:"+lineWidth);
}
//鼠标动作响应事件（电脑）
canvas.onmousedown = function (event) {
    //preventDefault()阻止浏览器默认动作，既窗口的滚动或缩放
    event.preventDefault();
    beginStroke({x:event.clientX,y:event.clientY});
};
canvas.onmouseup = function (event) {
    event.preventDefault();
    endStroke();
};
canvas.onmouseout = function (event) {
    event.preventDefault();
    endStroke();
};
canvas.onmousemove = function (event) {
    event.preventDefault();
    if(isMouseDown){
        moveStroke({x:event.clientX,y:event.clientY});
    }
};
//触摸事件响应（手机或平板）
canvas.addEventListener('touchstart',function (event) {
    event.preventDefault();
    touch = event.touches[0];//触碰事件不同于点击事件
    beginStroke({x:touch.pageX,y:touch.pageY});
});
canvas.addEventListener('touchmove',function (event) {
    event.preventDefault();
    if(isMouseDown){
        touch = event.touches[0];
        moveStroke({x:touch.pageX,y:touch.pageY});
    }
});
canvas.addEventListener('touchend',function (event) {
    event.preventDefault();
    endStroke();
});
//设置笔画的宽度
    var maxLineWidth = 25;//最大笔画
    var minLineWidth = 5;//最小笔画
    var maxStrokeV = 8;//最大速度
    var minStrokeV = 0.5;//最小速度
function calcLineWidth(t,s) {
    var v = s/t;
    var resultLineWidth;
    if(v<=minStrokeV){
        resultLineWidth = maxLineWidth;
    }else if(v>= maxStrokeV){
        resultLineWidth = minLineWidth;
    }else{
        //返回线条在不同速度下的宽度
        resultLineWidth = maxLineWidth - (v-minStrokeV)/(maxStrokeV-minStrokeV)*(maxLineWidth-minLineWidth);
    }
    if(lastLineWidth == 1){
        return resultLineWidth;
    }
    //根据上一次的笔画大小来计算下一次的笔画大小占比，从而达到平滑过渡
    return lastLineWidth*2/3+resultLineWidth*1/3;
}
//计算鼠标移动中的两点距离，从而为速度判断做准备
//(x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)根据直角三角形公式c平方=a平方+b平方
function drawDistance(location1,location2) {
    return Math.sqrt((location1.x-location2.x)*(location1.x-location2.x)+(location1.y-location2.y)*(location1.y-location2.y));
}

//取得鼠标在画布中的坐标值
function windowToCanvas(x,y) {
    var box = canvas.getBoundingClientRect();
    return {x:Math.round(x-box.left),y:Math.round(y-box.top)};
}
//书写背景外形方框
function drawGrid() {
    context.save();
    //外形方框状态
    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(3,3);
    context.lineTo(canvas.width-3,3);
    context.lineTo(canvas.width-3,canvas.height-3);
    context.lineTo(3,canvas.height-3);
    context.closePath();
    context.lineWidth = 6;
    context.stroke();

    //对齐虚线状态
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(canvas.width,canvas.height);

    context.moveTo(0,canvas.height);
    context.lineTo(canvas.width,0);

    context.moveTo(0,canvas.height/2);
    context.lineTo(canvas.width,canvas.height/2);

    context.moveTo(canvas.width/2,0);
    context.lineTo(canvas.width/2,canvas.height);
    context.lineWidth = 1;
    //setLineDash([a,b])使得中间的线变成线段点
    // a为虚线长度，b为虚线间隔长度
    context.setLineDash([5,5]);
    context.stroke();
    context.restore();
}
