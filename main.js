/*
 * @Author: lijt
 * @Date: 2024-03-20 15:56:24
 * @LastEditors: lijt
 * @LastEditTime: 2024-03-21 19:31:18
 * @FilePath: /untitled/main.js
 * @Description:
 */
// 1.导入模块 ES/CJS
import xCrawl from 'x-crawl'
import axios from "axios";
import moment from 'moment'
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import {globalLogger} from "./logger.js";
import {download} from "./src/download.js";
import ProgressBar from './src/progress-bar/index.js'

const rl = readline.createInterface({input, output});

const startTime = await rl.question('请输入开始时间（YYYYMMDD）：');
const answer = await rl.question('请输入向前多少天：');

console.log(`向前多少天: ${answer}`);

rl.close();
// 2.创建一个爬虫实例
const myXCrawl = xCrawl({maxRetry: 3, intervalTime: {max: 2000, min: 1000}, timeout: 3000000})
const configs = []
const progressBarC = new ProgressBar()
const getData = async (params) => {
    globalLogger.info(JSON.stringify(params))
    const pageResults = await myXCrawl.crawlData({
        enableRandomFingerprint: true, targets: [{
            url: 'https://www.pixiv.net/ranking.php', method: 'GET', params
        }]
    })
    globalLogger.info(JSON.stringify(pageResults[0].data.data))
    if(configs.findIndex(v=>v.id == params.date) == -1) {
        configs.push({
            id: params.date,
            duration: pageResults[0].data.data.rank_total,
            current: 0,
            block:'█',
            showNumber:true,
            tip:{
                0: '努力下载中……',
                50:'下载一半啦，不要着急……',
                75:'马上就下载完了……',
                100:'下载完成'
            },
            color:'blue'
        })
        progressBarC.addConfig(configs)
    }
    if (pageResults[0].data.data.next) {
        await getData({
            ...params, p: pageResults[0].data.data.next
        })
    }
    await getImg({arr:pageResults[0].data.data.contents, index:0,from:params})
}

let date = moment(startTime).format('YYYYMMDD')
// 3.设置爬取任务
// 调用 startPolling API 开始轮询功能，每隔一天会调用回调函数
let newDate = date
myXCrawl.startPolling({m: 1}, async (count, stopPolling) => {
    count -= 1
    globalLogger.info(`count:${count}`)
    // 调用 crawlPage API 来爬取页面
    newDate = moment(date, 'YYYYMMDD').subtract(count, 'days').format('YYYYMMDD')
    if(count > answer) return
    getData({
        mode: 'daily', date: newDate, content: 'illust', p: 1, format: 'json'
    })
})

let config = {}
const getImg = async function ({arr, index, from}, suffix = '.png') {
    let item = arr[index]
    let url = `https://i.pximg.net/img-original${item.url.slice(item.url.indexOf('/img/'), item.url.indexOf('_master'))}`
    try {
        const res = await axios.get(url + suffix, {
            responseType: 'arraybuffer',
            headers: {'Referer': `https://www.pixiv.net/artworks/${item.illust_id}`},
            verify: false
        })
        const binaryData = new Buffer.from(res.data);
        await download({
            filePath: `./upload/${moment(item.illust_upload_timestamp * 1000).format('YYYYMMDD')}/`,
            fileName: `${item.rank}${item.title.replaceAll('/', '-')}${suffix}`,
            fileArraybuffer: binaryData
        })
        configs.find(v=>v.id === from.date).current += 1
        configs.forEach(v=>{
            config[v.id] = v.current
        })
        progressBarC.run(config)
        if (index < arr.length - 1) {
            await getImg({arr, index: ++index,from})
        }
    } catch (e) {
        await getImg({arr, index,from}, '.jpg')
    }
}
