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
import fs from "node:fs";
import moment from 'moment'
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
// 2.创建一个爬虫实例
const myXCrawl = xCrawl({maxRetry: 3, intervalTime: {max: 2000, min: 1000}, timeout: 3000000})

const getData = async (params) => {
    const pageResults = await myXCrawl.crawlData({
        enableRandomFingerprint: true, targets: [{
            url: 'https://www.pixiv.net/ranking.php', method: 'GET', params
        }]
    })
    if (pageResults[0].data.data.next) {
        getData({
            ...params, p: pageResults[0].data.data.next
        })
    } else {
        // let date = moment(params.date,'YYYYMMDD').subtract(1, 'days').format('YYYYMMDD')
        // if(date <= moment().subtract(5, 'days').format('YYYYMMDD')){
        //     return
        // }
        // getData({
        //     mode: 'daily',
        //     date: date,
        //     content: 'illust',
        //     p: pageResults[0].data.data.next,
        //     format: 'json'
        // })
    }
    downloadImg(pageResults[0].data.data.contents, 0)
}
const rl = readline.createInterface({input, output});

const startTime = await rl.question('请输入开始时间（YYYYMMDD）：');
const answer = await rl.question('请输入向前多少天：');

console.log(`向前多少天: ${answer}`);

rl.close();

let date = moment(startTime).format('YYYYMMDD')
// 3.设置爬取任务
// 调用 startPolling API 开始轮询功能，每隔一天会调用回调函数
myXCrawl.startPolling({m: 1}, async (count, stopPolling) => {
    // 调用 crawlPage API 来爬取页面
    let oldDate = moment(date, 'YYYYMMDD').subtract(1, 'days').format('YYYYMMDD')
    if (oldDate <= moment(date, 'YYYYMMDD').subtract(answer, 'days').format('YYYYMMDD')) {
        myXCrawl.stopPolling()
        return
    }
    console.log('====================================');
    console.log(date);
    console.log('====================================');
    getData({
        mode: 'daily', date: date, content: 'illust', p: 1, format: 'json'
    })
})

const downloadImg = async function (arr, index, suffix = '.png') {
    let item = arr[index]
    let url = `https://i.pximg.net/img-original${item.url.slice(item.url.indexOf('/img/'), item.url.indexOf('_master'))}`
    try {
        const res = await axios.get(url + suffix, {
            responseType: 'arraybuffer',
            headers: {'Referer': `https://www.pixiv.net/artworks/${item.illust_id}`},
            verify: false
        })
        const binaryData = new Buffer.from(res.data);
        if (index < arr.length - 1) {
            await downloadImg(arr, ++index)
        }
        try {
            let filePath = `./upload/${moment(item.illust_upload_timestamp * 1000).format('YYYYMMDD')}/`
            if (fs.existsSync(filePath)) {
                console.log('filePath：该路径已存在');
            } else {
                console.log('该路径不存在', filePath);
                await mkdir(filePath);
                await downloadImg(arr, index)
            }
            if (fs.existsSync(`${filePath}${item.rank}${item.title.replaceAll('/', '-')}${suffix}`)) {
                console.log('img该图片已存在');
            } else {
                fs.writeFileSync(`${filePath}${item.rank}${item.title.replaceAll('/', '-')}${suffix}`, binaryData, (error) => {
                    if (error) {
                        // console.error(error);
                        return;
                    }
                    console.log("文件已被保存");
                })
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    } catch (e) {
        downloadImg(arr, index, '.jpg')
    }
}
const dirCache = {};
const mkdir = (filePath) => {
    return new Promise((resolve) => {
        const arr = filePath.split('/');
        let dir = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (!dirCache[dir] && !fs.existsSync(dir)) {
                dirCache[dir] = true;
                fs.mkdirSync(dir);
            }
            dir = dir + '/' + arr[i];
        }
        fs.writeFileSync(filePath, '')
        resolve()
    })
}
// https://i.pximg.net/img-original/img/2024/03/19/00/20/12/117046136_p0.png

// const res = await axios.get(`https://i.pximg.net/img-original${item1.slice(item1.indexOf('/img/'),item1.indexOf('_master'))}${item1.slice(item1.lastIndexOf('.'))}`, {
//     responseType: 'arraybuffer', headers: {'Referer': 'https://www.pixiv.net/artworks/'}, verify: false
// })
// const binaryData = new Buffer.from(res.data);
// fs.writeFileSync(`./upload/${item1.slice(item1.lastIndexOf('/'))}`, binaryData, (error)=>{
//     if (error) {
//         console.error(error);
//         return;
//     }
//     console.log("文件已被保存");
// })

// https://i.pximg.net/img-original/img/2024/03/18/17/30/02/117033657_p0.png
