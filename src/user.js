import xCrawl from "x-crawl";
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import path from "path";
import fs from "node:fs";
import dotenv from 'dotenv'
import {addressConversion} from "../utils/index.js";

dotenv.config()

// 判断元素是否可见
const isNotHidden = async (el) => await page.$eval(el, (elem) => {
    return elem.style.display !== 'none'
})

const doms = {
    2: 'section ul.hdRpMN', 3: '.cDZIoX'
}

const rl = readline.createInterface({input, output});

// const username = 'torino';
let index = 1
const isUserId = await rl.question('搜索方式(1:画师id;2:搜索;3:进入画师详情)：')
if (isUserId == 1) {
    console.log('暂无开发此搜索')
    process.exit();
}
let type = 1
const username = await rl.question('画师：');
if(isUserId == 2){
    type = await rl.question('类型（1:全部，2:全年龄，3:R-18）：');
}
// const account = await rl.question('请输入账号：')
// const password = await rl.question('请输入密码：')

rl.close();

const account = process.env.ACCOUNT
const password = process.env.PASSWORD

// 2.创建一个爬虫实例
const myXCrawl = xCrawl({
    maxRetry: 3,
    intervalTime: {max: 3000, min: 1000},
    timeout: 3000000,
    enableRandomFingerprint: true,
    crawlPage: {puppeteerLaunch: {headless: false},}
})

const {data: {browser, page}} = await myXCrawl.crawlPage({
    url: 'https://www.pixiv.net/',
    viewport: {width: 1920, height: 1080},
    timeout: 3000000,
    onCrawlItemComplete(crawlPageSingleResult) {
        const {page} = crawlPageSingleResult.data

        page.close()
    }
})
const isPhpsessid = await fs.existsSync('PHPSESSID.txt')
let read = ''
if (isPhpsessid) {
    read = fs.readFileSync('PHPSESSID.txt').toString()
}
if (read) {
    await page.setCookie({
        name: 'PHPSESSID', value: read, domain: '.pixiv.net'
    })
    await page.reload()
} else {
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
}
// 搜索框
await page.waitForSelector('input[placeholder="搜索作品"]', {timeout: 3000000});

const PHPSESSID = await page.cookies()
await fs.writeFileSync('PHPSESSID.txt', PHPSESSID.find(v => v.name === 'PHPSESSID').value, {flag: 'w'})

// 输入信息
await page.type('input[placeholder="搜索作品"]', username)
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
    if(type == 2){
        await page.click('.bduUXU>div>a:nth-child(2)')
        await page.reload()
        await page.waitForSelector(doms[isUserId])
    }else if(type == 3){
        await page.click('.bduUXU>div>a:nth-child(3)')
        await page.reload()
        await page.waitForSelector(doms[isUserId])
    }
}
// 开始爬取
const pages = () => {
    return new Promise(resolve => {
        setTimeout(async () => {
            // 获取页面图片的 URL
            const urls = await page.$$eval('section ul a.iUsZyY img', (el) => el.map(v => ({
                url: v.getAttribute('src'), title: v.getAttribute('alt'), num: 0
            })))
            const as = await page.$$('section ul a.iUsZyY')
            for (const v of as) {
                const i = as.indexOf(v);
                const dom1 = await v.$('div:nth-child(2)')
                const dom2 = await dom1.$('div:nth-child(2)')
                let dom3 = 0
                if (dom2) {
                    dom3 = await v.$eval('div>span:nth-child(2)', el => el.innerText)
                    urls[i].num = Number(dom3)
                }
            }
            const apis = urls.map((item => {
                if (item.num) {
                    return [...new Array(item.num).keys()].map((v,i) => {
                        return {
                            url: addressConversion(item.url, i),
                            maxRetry: 1,
                            method: 'GET',
                            responseType: 'arraybuffer',
                            headers: {'Referer': `https://www.pixiv.net/artworks/${item.url.slice(item.url.lastIndexOf('/') + 1, item.url.lastIndexOf('_p0'))}`},
                            verify: false,
                        }
                    })
                } else {
                    return {
                        url: addressConversion(item.url),
                        maxRetry: 1,
                        method: 'GET',
                        responseType: 'arraybuffer',
                        headers: {'Referer': `https://www.pixiv.net/artworks/${item.url.slice(item.url.lastIndexOf('/') + 1, item.url.lastIndexOf('_p0'))}`},
                        verify: false,
                    }
                }
            })).flat(Infinity)
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
                targets: apis2, storeDirs: `${process.cwd()}/uploadUser/${username}`, // 存放文件夹
            })

            // 文件所在目录
            fs.readdir(path.join(`${process.cwd()}/uploadUser/${username}/`), function (err, files) {
                if (err) {
                    console.log(path.join(`${process.cwd()}/uploadUser/${username}/`), err)
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




