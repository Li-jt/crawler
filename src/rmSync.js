// 文件所在目录
import fs from "node:fs";
import path from "path";

const rm = (name) => {
    fs.readdir(path.join(`${process.cwd()}/uploadUser/${name}/`), function (err, files) {
        if (err) {
            return;
        }
        files.forEach(item => {
            //匹配后缀为 txt 名字包含 a 的文件
            if (item.indexOf('.html') > -1) {
                fs.rmSync(path.join(`${process.cwd()}/uploadUser/${name}/`, item))
            }
        })
    })
}

rm('芙宁娜')