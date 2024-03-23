import progressBar from '@jyeontu/progress-bar'

const config = {
    duration: 100,
    current: 0,
    block:'█',
    showNumber:true,
    tip:{
        0: '努力加载中……',
        50:'加载一半啦，不要着急……',
        75:'马上就加载完了……',
        100:'加载完成'
    },
    color:'blue'
}
var timer, i = 0;
let progressBarC = new progressBar({
    duration: 100,
    current: 0,
    block:'█',
    showNumber:true,
    tip:{
        0: '努力加载中……',
        50:'加载一半啦，不要着急……',
        75:'马上就加载完了……',
        100:'加载完成'
    },
    color:'blue'
});
let progressBarD = new progressBar({
    duration: 100,
    current: 0,
    block:'█',
    showNumber:true,
    tip:{
        0: '努力加载中……',
        50:'加载一半啦，不要着急……',
        75:'马上就加载完了……',
        100:'加载完成'
    },
    color:'red'
});
timer = setInterval(()=>{
    progressBarC.run(i++);
    // progressBarD.run(i+=2)
    if (i > 100 ) {
        clearInterval(timer);
    }
},100);