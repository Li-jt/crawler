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
import {ProgressBar} from './src/process.js'

const rl = readline.createInterface({input, output});

const startTime = await rl.question('请输入开始时间（YYYYMMDD）：');
const answer = await rl.question('请输入向前多少天：');

console.log(`向前多少天: ${answer}`);

rl.close();
// 2.创建一个爬虫实例
const myXCrawl = xCrawl({maxRetry: 3, intervalTime: {max: 2000, min: 1000}, timeout: 3000000})

const getData = async (params) => {
    globalLogger.info(JSON.stringify(params))
    const pageResults = await myXCrawl.crawlData({
        enableRandomFingerprint: true, targets: [{
            url: 'https://www.pixiv.net/ranking.php', method: 'GET', params
        }]
    })
    if (pageResults[0].data.data.next) {
        await getData({
            ...params, p: pageResults[0].data.data.next
        })
    }
    await getImg(pageResults[0].data.data.contents, 0)
}

let date = moment(startTime).format('YYYYMMDD')
// 3.设置爬取任务
// 调用 startPolling API 开始轮询功能，每隔一天会调用回调函数
let newDate = date
let processList = []
myXCrawl.startPolling({m: 1}, async (count, stopPolling) => {
    count -= 1
    globalLogger.info(`count:${count}`)
    processList.push(new ProgressBar().setTitle('下载进度').setProgress(0))
    // 调用 crawlPage API 来爬取页面
    newDate = moment(date, 'YYYYMMDD').subtract(count, 'days').format('YYYYMMDD')
    if(count > answer) return
    getData({
        mode: 'daily', date: newDate, content: 'illust', p: 1, format: 'json'
    })
})

const getImg = async function (arr, index, suffix = '.png') {
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
        if (index < arr.length - 1) {
            await getImg(arr, ++index)
        }
    } catch (e) {
        await getImg(arr, index, '.jpg')
    }
}
