import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const middleware = (req,res,next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if( ! token ){

            return res.status(401).json({msg : "Invalid Token" })
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({msg : error})
    }
}
export default middleware;
