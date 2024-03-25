import xCrawl from "x-crawl";
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import {globalLogger} from "./logger/index.js";
import moment from "moment/moment.js";
import path from "path";
import {fileURLToPath} from 'url';
import axios from "axios";
import {download} from "./download.js";
import fs from "node:fs";

// 判断元素是否可见
const isNotHidden = async (el) => await page.$eval(el, (elem) => {
    return elem.style.display !== 'none'
})

// 地址转换
const addressConversion = (url) => {
    return url.indexOf('_custom1200.jpg') > -1 ?
        `https://i.pximg.net/img-original${url.slice(url.indexOf('/img/'), url.indexOf('_custom1200.jpg'))}.jpg` :
        `https://i.pximg.net/img-original${url.slice(url.indexOf('/img/'), url.indexOf('_square1200.jpg'))}.jpg`
}

const doms = {
    2: '.hdRpMN',
    3: '.cDZIoX'
}

const rl = readline.createInterface({input, output});

// const username = 'torino';
let index = 1
const isUserId = await rl.question('搜索方式(1:画师id;2:搜索;3:进入画师详情)：')
if (isUserId == 1) {
    console.log('暂无开发此搜索')
    process.exit();
}
const username = await rl.question('画师：');
const account = await rl.question('请输入账号：')
const password = await rl.question('请输入密码：')

rl.close();

// 2.创建一个爬虫实例
const myXCrawl = xCrawl({
    maxRetry: 3,
    intervalTime: {max: 2000, min: 1000},
    timeout: 3000000,
    enableRandomFingerprint: true,
    crawlPage: {puppeteerLaunch: {headless: false},}
})

const {data: {browser, page}} = await myXCrawl.crawlPage({
    url: 'https://www.pixiv.net/',
    viewport: {width: 1920 * 2, height: 1080 * 2},
    onCrawlItemComplete(crawlPageSingleResult) {
        const {page} = crawlPageSingleResult.data

        page.close()
    }
})
// 等待页面元素出现
await page.waitForSelector('.signup-form')

await page.click('.signup-form__submit--login')

// 等待页面元素出现
await page.waitForSelector('.brNKPG')

// 登录
await page.type('input[autocomplete="username"]', account);
await page.type('input[autocomplete="current-password"]', password);
// 登录按钮
await page.click('.hhGKQA')

// 搜索框
await page.waitForSelector('.eOTMOA');
// 输入信息
await page.type('.eOTMOA', username)
// 回车
await page.keyboard.press('Enter')
if (isUserId == 3) {
// 等待搜索结果
    await page.waitForSelector('.dkVwKe')
    // 点击作品进入作品详情页
    await page.click('.dkVwKe')
// 等待作品详情页画师出现
    await page.waitForSelector('.kKKMtg a')
// 点击画师进入画师详情页
    await page.click('.kKKMtg a')
// 等待tabs切换
    await page.waitForSelector('nav')
// 点击插画tab
    await page.click('nav a:nth-child(2)')
// 等待插画出现
    await page.waitForSelector(doms[isUserId])
} else if (isUserId == 2) {
    // 等待搜索结果
    await page.waitForSelector(doms[isUserId])
}
// 开始爬取
const pages = () => {
    return new Promise(resolve => {
        setTimeout(async () => {
            // 获取页面图片的 URL
            const urls = await page.$$eval('ul img', (el) => el.map(v => ({
                url: v.getAttribute('src'), title: v.getAttribute('alt'),
            })))
            const apis = urls.map((item => {
                return {
                    url: addressConversion(item.url),
                    maxRetry: 1,
                    method: 'GET',
                    responseType: 'arraybuffer',
                    headers: {'Referer': `https://www.pixiv.net/artworks/${item.url.slice(item.url.lastIndexOf('/') + 1, item.url.lastIndexOf('_p0'))}`},
                    verify: false,
                }
            }))
            const data = await myXCrawl.crawlFile({
                targets: apis, storeDirs: `${process.cwd()}/uploadUser/${username}`, // 存放文件夹
            })

            const proxyApi = data.filter(v => v.data.statusCode !== 200).map(v => v.id)
            const apis2 = proxyApi.map(v => {
                return {
                    ...apis[v - 1], url: `${apis[v - 1].url.slice(0, apis[v - 1].url.lastIndexOf('.'))}.png`,
                }
            })

            await myXCrawl.crawlFile({
                targets: apis2, storeDirs: `${process.cwd()}/uploadUser/${username}` // 存放文件夹
            })

            // 文件所在目录
            fs.readdir(path.join(`${process.cwd()}/uploadUser/${username}/`), function (err, files) {
                if (err) {
                    return;
                }
                files.forEach(item => {
                    if (item.indexOf('.html') > -1) {
                        fs.rmSync(path.join(`${process.cwd()}/uploadUser/${username}/`, item))
                    }
                })
            })
            if (await isNotHidden('.kYtoqc a:last-child')) {
                await page.click('.kYtoqc a:last-child')
                await page.waitForSelector(doms[isUserId])
                await pages()
                resolve(index++)
            } else {
                await browser.close()
            }
        }, 10000)
    })
}

pages().then(r => {
    console.log(r)
})




