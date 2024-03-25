// 名称重构
export const nameProcessing = (name) => {
    return name.replaceAll('/', '-').replaceAll(':', '：');
}
// 地址转换
export const addressConversion = (url) => {
    return url.indexOf('_custom1200.jpg') > -1 ?
        `https://i.pximg.net/img-original${url.slice(url.indexOf('/img/'), url.indexOf('_custom1200.jpg'))}.jpg` :
        `https://i.pximg.net/img-original${url.slice(url.indexOf('/img/'), url.indexOf('_square1200.jpg'))}.jpg`
}