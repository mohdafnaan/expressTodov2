import fs from "fs/promises";

const dbPath = "/home/afnaan/expressTodov2/server/data.json";

async function readDB(){
    let DB = await fs.readFile(dbPath,"utf-8");
    return JSON.parse(DB);
}

async function writeDB(content){
    await fs.writeFile(dbPath,JSON.stringify(content,null,4))
}


function OTPgenerator() {
    return  Math.floor(Math.random() * (9999-1000)+1000);
}


async function BAN(user) {
    let DB = await readDB()
}
export{readDB,writeDB,OTPgenerator};