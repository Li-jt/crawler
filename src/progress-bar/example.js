import ProgressBar from './index.js'

const config = []
var timer, i = 0,j = 0;
let progressBarC = new ProgressBar(config);
timer = setInterval(()=>{
    progressBarC.run({
        1:j+=2,
        0:i++
    });
    if (i > 100 ) {
        clearInterval(timer);
    }
},100);