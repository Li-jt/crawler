import axios from "axios";
import {download} from "./src/download.js";
import {globalLogger} from "./src/logger/index.js";

const getImg = async function () {
    // let item = arr[index]
    // let url = `https://i.pximg.net/img-original${item.url.slice(item.url.indexOf('/img/'), item.url.indexOf('_master'))}`
    try {
        // src="https://i.pximg.net/img-original/img/2024/03/08/00/14/26/116712631_p0.jpg"
        // src="https://i.pximg.net/img-original/img/2024/03/24/22/03/08/117219531_p0.png"
        const res = await axios.get('https://i.pximg.net/img-original/img/2024/03/24/22/03/08/117219531_p0.png', {
            responseType: 'arraybuffer',
            headers: {'Referer': `https://www.pixiv.net/artworks/116712631`},
            verify: false
        })
        const binaryData = new Buffer.from(res.data);
        await download({
            filePath: `./upload/test/`,
            fileName: `#ぶいすぽっ! 無題 - ruo的插画.png`,
            fileArraybuffer: binaryData
        })
    } catch (e) {
        console.log(e)
    }
}

getImg()