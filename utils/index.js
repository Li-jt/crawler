// 名称重构
export const nameProcessing = (name) => {
    return name.replaceAll('/', '-').replaceAll(':', '：');
}
// 地址转换
export const addressConversion = (url, index = 0) => {
    let address = url.replace('_p0',`_p${index}`);
    return address.indexOf('_custom1200.jpg') > -1 ?
        `https://i.pximg.net/img-original${address.slice(address.indexOf('/img/'), address.indexOf('_custom1200.jpg'))}.jpg` :
        `https://i.pximg.net/img-original${address.slice(address.indexOf('/img/'), address.indexOf('_square1200.jpg'))}.jpg`
}