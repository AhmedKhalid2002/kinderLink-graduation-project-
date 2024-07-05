import nodemailer from 'nodemailer';
 async function sendingEmail(object)
{
 const transporter=nodemailer.createTransport(
    {
          port:465,
          host:"localhost",
          service:"gmail",
          secure:true,
          auth:{
            user:"elrazeka501@gmail.com",
            pass:"ogku jers nrad ktqg",
          }
    }
 );
 const sendEmils=await transporter.sendMail({
    from:'"<kinderLink>" elrazeka501@gmail.com',
    to:object.to,
    subject:object.subject,
    text:object.text,
    html:object.html,
 });
 if(sendEmils.rejected.length>0)
 {
   return false;
 }
 return true;
 
};
export default sendingEmail;