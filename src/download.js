import moment from "moment/moment.js";
import fs from "node:fs";
import path from "path";

export const download = async (data) => {
    const {filePath,fileName,fileArraybuffer} = data
    try{
        if (!fs.existsSync(filePath)) {
            mkdirsSync(filePath);
        }
        if (!fs.existsSync(`${filePath}${fileName}`)) {
            fs.writeFileSync(`${filePath}${fileName}`, fileArraybuffer)
        }
    }catch (e) {
        
    }
}

export const mkdirsSync = (dirname) => {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}