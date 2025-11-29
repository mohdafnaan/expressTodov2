import express from "express";
import { readDB,writeDB, OTPgenerator } from "../../utils/helper.js";
import sendMail from "../../utils/sendEmail.js"
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid";
import encrypt from "../../utils/token.js";
import { registervalidation,loginValidation,otpValidation,errorvalidation } from "../../validators/valid.js";
import Mail from "nodemailer/lib/mailer/index.js";


const router = express.Router();

router.post("/register",registervalidation,errorvalidation,async (req,res)=>{
    try {
        let DB = await readDB();
        let {name,email,age,phone,password} = req.body;
        let incomingEmail = req.body.email;
        let user = DB.find(u=>u.email === incomingEmail);
        if(user){
            return res.status(404).json({msg : "user already exist"})
        }
        let newData = {
            id : uuid(),
            name,
            email,
            age,
            phone,
            otp : OTPgenerator(),
            password :await bcrypt.hash(password,10),
            isVerified : false,
            task : [],
            accountCreatedAt : new Date().toISOString()
        }
        DB.push(newData)
        await sendMail(email,"welcome to TODO app", `Thankyou for registeration!\n Your OTP : ${newData.otp}`)
        await writeDB(DB);
        res.status(200).json({ msg : "user registered sucessfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg : error})
    }
})

router.post("/otpVerifiacation",otpValidation,errorvalidation,async(req,res)=>{
    try {
        let DB = await readDB();
        let otp = req.body.otp;
        let incomingEmail = req.body.email;
        let user = DB.find(u=>u.email === incomingEmail);
        if(!user){
            return res.status(404).json({msg : "user not found"})
        }
        if(otp != user.otp){
            return res.status(401).json({msg : "wrong otp"})
        }
        delete user.otp;
        user.isVerified = true;
        await writeDB(DB)
        res.status(200).json({msg : "account verified"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg : error})
    }
})

router.post("/login",loginValidation,errorvalidation,async (req,res)=>{
    try {
        let existingData = await readDB()
        let incomingEmail = req.body.email;
        let user = existingData.find(x=>x.email === incomingEmail);
        if(!user){
            return res.status(404).json({msg : "user not found"})
        }
            if(await bcrypt.compare(req.body.password,user.password)){
                let sessionKey = await encrypt(user)
                res.status(200).json({msg : "loggedin sucessfully",sessionKey : sessionKey})
            } else {
                res.status(401).json({msg : "password is invalid"})
            }
         
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})

// api for sending otp by taking email

router.post("/emailforotp",async (req,res)=>{
    try {
        let DB = await readDB();
        let email = req.body.email;
        let user = DB.find(u=>u.email===email)
        if(!user){
            return res.status(401).json({msg : "user not found"})
        }
        let otp = OTPgenerator()
        user.otp = otp;
        await sendMail(email,"otp for resetting password", `your otp is ${otp}\n Enter this otp in http://localhost:5000/public/otpforpass`)
        await writeDB(DB);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// verify otp 
router.post("/otpforpass",async(req,res)=>{
    try {
        let DB = await readDB();
        let email = req.body.email;
        let otp = req.body.otp;
        let user = DB.find(u=>u.email===email)
        if(!user){
            return res.status(401).json({msg : "user not found"})
        }
        if(otp != user.otp){
            return res.status(500).json({msg : "otp is invalid"})
        }
        delete user.otp;
        await writeDB(DB);
        res.status(200).json({msg : "go to update pass api and change password"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})

router.put("/updatepass",async (req,res)=>{
    try {
        let DB = await readDB();
        let email = req.body.email;
        let password = req.body.password;
        let hpass = await bcrypt.hash(password,10)
        let user = DB.find(u=>u.email===email)
        if(!user){
            return res.status(401).json({msg : "user not found"})
        }
        user.password = hpass
        await writeDB(DB);
        res.status(200).json({msg : "password has been updated"})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
export default router;