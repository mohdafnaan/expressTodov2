import express from "express";
import dotenv from "dotenv";
import publicRouter from "./controllers/public/index.js"
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT;

app.get("/",(req,res)=>{
    try {
        res.status(200).json({msg : "test api"})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : error})
    }
})
app.use("/public",publicRouter);
app.listen(port,()=>{
    console.log(`server is running at http://localhost:${port}`);
})