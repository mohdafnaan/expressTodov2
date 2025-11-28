import express from "express";
import { readDB,writeDB } from "../../utils/helper.js";
import {v4 as uuid} from "uuid"
import bcrypt from "bcrypt"
import { OTPgenerator } from "../../utils/helper.js";
import sendMail from "../../utils/sendEmail.js";

const router = express.Router();

//    GET ALL USERS
router.get("/getallusers", async(req,res)=>{
    try {
        let allUsers= await readDB();
        res.status(200).json(allUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// Get user by id
router.get("/getuser/:id",async (req,res)=>{
    try {
        let DB = await readDB();
        let Uid = req.params.id;
        let user = DB.find(u=>u.id===Uid);
        if(!user){
            return res.status(404).json({mag : "user not found"})
        }
        await writeDB(DB);
        res.status(200).json(user); 
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
//delete user by id
router.delete("/delete/:id",async (req,res)=>{
    try {
        let DB = await readDB();
        let Uid = req.params.id;
        let user = DB.filter(u=>u.id!=Uid);
        if(!user){
            return res.status(404).json({mag : "user not found"})
        }
        await writeDB(user); 
        res.status(200).json({msg : "user deleted sucessfully,,"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
//create task
router.post("/addtask",async (req,res)=>{
    try {
        let DB = await readDB();
        let logginedUser = DB.find(u=>u.id === req.user.id)
        if(!logginedUser){
            return res.status(404).json({msg : "user not found"})
        }
        let userTask = {
            id : uuid(),
            // task : req.body.task,
            taskName : req.body.taskName,
            description : req.body.description,
            startedAT : new Date().toISOString(),
            deadline : req.body.deadline
        }
         logginedUser.task.push(userTask);
        await writeDB(DB);
        res.status(200).json({userTask, msg : "task added"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// delete task by id
router.delete("/deletetask/:id",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id)
        let Tid = req.params.id;
        let remainingTask = existingUser.task.filter(u=>u.id != Tid);
        existingUser.task = remainingTask
        await writeDB(DB);
        res.status(200).json({msg : "task deleted"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// update task with id
router.put("/updatetask/:id",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id);
        let Tid = req.params.id;
        if(!Tid){
            return res.status(404).json({msg : "task not found"})
        }
        let updatingTask = existingUser.task.find(u=>u.id === Tid);
        Object.assign(updatingTask,req.body);
        await writeDB(DB);
        res.status(200).json({msg : "task updated"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// GET TASK BY ID
router.get("/gettask/:id",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u => u.id === req.user.id)
        let Tid = req.params.id;
        if(!Tid){
            return res.status(404).json({msg : "Task not found"})
        }
        let task = existingUser.task.find(u => u.id === Tid);
        await writeDB(DB);
        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// update user 
router.put("/updateuser",async (req,res)=>{
    try {
        let DB= await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id);
        if(!existingUser){
            return res.status(404).json({msg :  "you are not an existing user"})
        }
        Object.assign(existingUser,req.body);
        await writeDB(DB);
        res.status(200).json({msg : "user details updated sucessfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// delete existing user 
router.delete("/delete",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id);
        let remainingUsers = DB.filter(u=> u.email !== existingUser.email)
        console.log(remainingUsers);
        await writeDB(remainingUsers);
        res.status(200).json({msg : "your account is deleted"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// delete existing user with password
router.delete("/deletebypass",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id);
        let password = req.body.password;
        let bpass = await bcrypt.compare(password,req.user.password);
        if(!bpass){
            return res.status(401).json({msg : "incorrect password"})
        }
        let allUsers = DB.filter(u=> u.id !== existingUser.id )
        await writeDB(allUsers);
        res.status(200).json({msg : "account deleted"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// DELETE USER BY PASS AND GIVE OTP FOR VERIFICATION
router.post("/otpwemail",async (req,res)=>{
    try {
        let DB = await readDB();
        let existingUser = DB.find(u=>u.id === req.user.id);
        let email = req.body.email;
        if(email != existingUser.email){
            return res.status(402).json({msg : "email is invalid"})
        }
        let password = req.body.password;
        let bpass = await bcrypt.compare(password,existingUser.password);
        if(!bpass){
            return res.status(401).json({msg : "incorrect password"})
        }
        let otp = OTPgenerator();
        existingUser.otp = otp;
        await sendMail(email,"DELETATION OTP",`\n your OTP : ${otp}\n go to otp api and enter the OTP`)
        await writeDB(DB)
        res.status(200).json({msg : "mail sent"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// delete user by otp
router.post("/dltwotp",async(req,res)=>{
    try {
        let DB = await readDB();
        let existingData = DB.find(u=>u.id === req.user.id);
        if(!existingData){
            return res.status(200).json({msg : "user not found"})
        }
        let OTP = req.body.otp;
        if(OTP != existingData.otp){
            console.log(req.user);
            return res.status(404).json({msg : "incorrect OTP"})
        }
        let otherUsers = DB.filter(u=>u.id !== existingData.id);
        await writeDB(otherUsers);
        res.status(200).json({msg : "user Deleted sucessfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
// DELETE ALL USERS
router.delete("/deleteallusers",async(req,res)=>{
    try {
        let DB = await readDB();
        let allusers = DB.filter(u=> u !== u);
        console.log(DB);
        writeDB(allusers)
        res.status(200).json({msg : "all users delete"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
export default router;