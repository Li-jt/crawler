/*
 * @Author: JIA
 * @Date: 2022-10-17 22:05:26
 * @Last Modified by: JIA
 * @Last Modified time: 2022-10-17 22:09:59
 */
// 运行环境 vscode + node.js
//延时函数

//加一点动态性效果
let array = new Array('*','\\',  '|', '/', '-');
//主函数代码如下，使用匿名函数实现,await需要配合async使用
export class ProgressBar{
    //需要拼接的字符串
    static title
    static str03 = ''
    static num = 0
    static index = 0
    static  list = []
    static timer = 0


    static setTitle(title){
        this.title = title
        let id = this.list.length
        this.list.push({
            title: title,
            id,
            progress: this.index
        });
        return id
    }

    static setProgress(props){
        this.list.find(v=>v.id === props.id).progress = props.progress;
        this.write()
    }

    static write(){
        // this.index = index
        // let str = `${index}${'%'} `;
        if(!this.timer) clearInterval(this.timer)
        this.timer = setInterval(()=>{
            let strAll = ''
            this.list.forEach(v=>{
                strAll += v.title + ('='.repeat(v.progress)) + '=>'
                strAll += ' '.repeat(100 - v.progress)
                strAll += `${v.progress}% `
                strAll += `${array[++this.num]}\n`
            })
        // this.timer = setInterval(()=>{
            //简单处理，进度条长度为100
            //更新进度条,计算百分比
            // this.str03 = this.title + ('='.repeat(index));
            // this.str03 += '=> ';
            //清空之前的输入内容
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            //光标移动到最前面
            // process.stdout.write('\r');
            //不换行打印
            // process.stdout.write(this.str03);
            // process.stdout.write(' '.repeat(100 - index));
            process.stdout.write(`${strAll}`)
            // console.log(`${str} ${array[++this.num]}`)
            this.num++
            if(this.num >= array.length - 1){
                this.num = 0
            }
            // if(index === 100) clearInterval(this.timer)
        // },100)
        },200)
    }
}

const id1 = ProgressBar.setTitle('下载进度')
ProgressBar.setProgress({id:id1, progress:60})
const id2 = ProgressBar.setTitle('下载进度2')
ProgressBar.setProgress({id:id2, progress:60})