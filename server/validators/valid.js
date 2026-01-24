import {body,validationResult} from "express-validator";
// name,email,age,phone,password
const registervalidation = [
    body("name")
    .trim()
    .notEmpty().withMessage("name is required")
    .isLength({min : 3, max : 25}).withMessage("max is 25 limit or min is 3")
    ,

    body("age")
    .trim()
    .notEmpty().withMessage("please add age")
    .isInt({ min : 18, max : 100}).withMessage("age should be between 18 to 100")
    ,

    body("phone")
    .trim()
    .notEmpty().withMessage("phone is required")
    .isMobilePhone().withMessage("invalid phoneNumber")
    ,
    
    body("password")
    .trim()
    .notEmpty().withMessage("password is required")
    .isStrongPassword().withMessage("password should be strong")
    ,

    body("email")
    .trim()
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("write an valid email")
]

const loginValidation = [
    body("email")
    .trim()
    .notEmpty().withMessage("please add email")
    .isEmail().withMessage("write a valid email")
    ,
    body("password")
    .trim()
    .notEmpty().withMessage("password is required")
    ,

]

const otpValidation=[
    body("otp")
    .trim()
    .notEmpty().withMessage("otp is required")
    ,

     body("email")
     .trim()
     .notEmpty().withMessage("email is required")
     .isEmail().withMessage("not a valid email")

    
]

function errorvalidation(req, res , next){
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
    error : errors.array()
})
next()
}



export { registervalidation, loginValidation,otpValidation ,errorvalidation}