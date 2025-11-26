import express from "express";
import { readDB,writeDB } from "../../utils/helper.js";
import bcrypt, { compare } from "bcrypt"
import {v4 as uuid} from "uuid";

const router = express.Router();

router.post("/register",async (req,res)=>{
    try {
        let DB = await readDB();
        let {name,email,age,phone,password} = req.body;
        
        let newData = {
            id : uuid(),
            name,
            email,
            age,
            phone,
            password :await bcrypt.hash(password,10),
            isVerified : false,
            task : [],
            accountCreatedAt : new Date().toISOString()
        }
        DB.push(newData)
        await writeDB(DB);
        res.status(200).json({ msg : "user registered sucessfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg : error})
    }
})

router.post("/login",async (req,res)=>{
    try {
        let existingData = await readDB()
        let incomingEmail = req.body.email;
        let userObject = existingData.find(x=>x.email === incomingEmail);
        if(!userObject){
            res.status(404).json({msg : "user not found"})
        } else {
            if(await bcrypt.compare(req.body.password,userObject.password)){
                res.status(200).json({msg : "loggedin sucessfully"})
            } else {
                res.status(401).json({msg : "password is invalid"})
            }
        } 
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
export default router;