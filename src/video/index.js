// src="blob:https://www.bilibili.com/fa7f9b61-a603-472f-8b77-26ea33986d10"
import axios from "axios";

axios.get('blob:https://www.bilibili.com/fa7f9b61-a603-472f-8b77-26ea33986d10',{responseType: 'blob'}).then(r => {
    console.log(r)
})