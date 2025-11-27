import mailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function sendMail(to,subject,text){
try {
    let transport = mailer.createTransport({
    service : "gmail",
    auth : {
        user : "mohdafnaan833@gmail.com",
        pass : process.env.PASS
    }
})
let userInfo = await transport.sendMail({
    from : "mohdafnaan833@gmail.com",
    to : to,
    subject : subject,
    text : text,
});
console.log(`mail sent`,userInfo.messageId);
} catch (error) {
    console.log(error);
}
}
export default sendMail;