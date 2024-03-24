// const singleRowLog = require('single-line-log').stdout
import {stdout} from 'single-line-log'
import chalk from 'chalk'

class ProgressBar {
    configs = []

    constructor(configs = []) {
        this.initConfig(configs);
    }

    initConfig(configs) {
        const defaultConfigs = {
            duration: 100, current: 0, block: '█', showNumber: true, tip: {
                0: '努力加载中……', 50: '加载一半啦，不要着急……', 75: '马上就加载完了……', 100: '加载完成'
            }, color: 'blue'
        };
        this.configs = configs.map(config => Object.assign({}, defaultConfigs, config))
    }

    addConfig(configs) {
        configs.forEach(config => {
            if (this.configs.findIndex(c => c.id === config.id) === -1) {
                this.configs.push(config)
            }
        })
    }


    updataDuration({id,duration}){
        this.configs.find(v=>v.id === id).duration = duration;
    }

    getConfigs(){{
        return this.configs
    }}

    getComeToAnEnd(){
        return  this.configs.every((v)=>v.duration === v.current)
    }

    run(props) {
        let str = ''
        if (!this.configs.length) return;
        Object.keys(props).forEach((key) => {
            this.configs.find(v => v.id == key).current = props[key];
        })
        this.configs.forEach((config) => {
            const {block, duration, tip, color, showNumber, current} = config;
            let tipList = Object.keys(tip).sort((a, b) => b - a);
            let showTip = tip[0];
            const step = duration / 100;
            const len = (current / step).toFixed(2);
            for (let i = 0; i < tipList.length; i++) {
                if (Number(len) >= tipList[i]) {
                    showTip = tip[tipList[i]];
                    break;
                }
            }
            str += chalk[color](config.id + ':' + block.repeat(Math.floor(len / 2)), (showNumber ? (len + '% ') : '') + showTip) + '\n'
        })
        stdout(str);
    }
}

export default ProgressBar;