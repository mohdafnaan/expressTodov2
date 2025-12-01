import { readDB,writeDB } from "../utils/helper.js";


async function BAN(email) {
let DB = await readDB();
let banUser =  DB.find((x)=> x.email === email);
        banUser.isFreeze = true;
        await writeDB(DB);
        setTimeout(async ()=>{
            console.log("one min has passed")
            banUser.isFreeze = false;
            banUser.count = 0;
            await writeDB(DB)
        },10000) 
}

export default BAN;