import express from "express";
import { readDB,writeDB } from "../../utils/helper.js";
import {v4 as uuid} from "uuid"

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
export default router;