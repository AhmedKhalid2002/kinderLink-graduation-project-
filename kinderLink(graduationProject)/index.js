import express from 'express';
import cors from 'cors';
import connectToDb from './db/models/connectionDb.js';
import requestsRouter from './src/modules/requests/requests.routes.js';
import employeeeRouter from './src/modules/employees/employees.routes.js';
import schedule from 'node-schedule';
import empModel from './db/models/employees/employess.model.js';
import sendingEmail from './src/utils/sendingEmails.js';
import requestsModel from './db/models/requests/requests.model.js';
import childRouter from './src/modules/children/children.routes.js';
import busRouter from './src/modules/bus/bus.routes.js';
import childrenModel from './db/models/children/children.model.js';
const app=express();
app.use(express.json());
app.use(cors());
// doing an cron job for the meals of the children:
schedule.scheduleJob('0 1 * * 5',async ()=>{
try
{
    await childrenModel.updateMany({},{meals:[{dayWeek:0,meal1:null,meal2:null},{dayWeek:1,meal1:null,meal2:null},{dayWeek:2,meal1:null,meal2:null},{dayWeek:3,meal1:null,meal2:null},{dayWeek:4,meal1:null,meal2:null},{dayWeek:5,meal1:null,meal2:null}]});
    console.log("there is updated sucessfully");
}
catch(err)
{
  console.log("there is n error",err);
}
})
// docin an schedule jsob or cron job:
schedule.scheduleJob("0 0 12 */5 * *",async ()=>{
    let allUnActivatedEmployee=await empModel.find({isActivated:false});
    for(let i=0;i<allUnActivatedEmployee.length;i++)
    {
    const  sendEmail=await sendingEmail({to:allUnActivatedEmployee[i].email,subject:"remind you to activate your email",text:"enter on the button to activate your email",html:`<div style='text-align:center;' ><a href='http://localhost:3000/employees/ActivateEmployee/${allUnActivatedEmployee[i].email}'><button> activate your account please</button></a></div>`});
    if(!sendEmail)
    {
         console.log("there is an error in senddign email in the cron job");
    }
    else{
        console.log("the email is sending sucessfully to",allUnActivatedEmployee[i].email);
    }
    }
});

// cron job for un activated their account yet of the requests:
schedule.scheduleJob("0 0 12 */5 * *",async ()=>{
    const allUnActivetdRequests=await requestsModel.find({isActivated:false});
    for(let i=0;i<allUnActivetdRequests.length;i++)
    {
        const email=await sendingEmail({to:allUnActivetdRequests[i].email,subject:"remide you to activate your email",text:"please click on the button to activate your account",html:`<div style='text-align:center;'><a href='http://localhost:3000/requests/activateAccount/${allUnActivetdRequests[i].email}'><button>activate your account</button></a></div>`});
        if(email)
        {
            console.log("the emai is sended sucessfullly");
        }
        else
        {
            console.log("there is an error in semding email to email",allUnActivetdRequests[i].email);
        }
    }
});
app.post("/addEmployees",async (req,res,next)=>{
    let data=req.body;
    await empModel.create(data);
    return res.json({sucess:true,mesage:"the admin is added sucessfully"});
})

// connect to the db:
await connectToDb();
// all the routes model:
   // requests router:
   app.use("/requests",requestsRouter);
   // employeee router:
   app.use("/employees",employeeeRouter);
   // children routes:
   app.use("/childeren",childRouter);
   // bus router:
   app.use("/bus",busRouter);
// global error handler:
app.use((err,req,res,next)=>{
    return res.json({
        sucess:false,
        error:err.message,
        stack:err.stack,
    });
});
// not found page handeler:
app.all("*",(req,res,next)=>{
    return res.json({sucess:false,message:"the api you requests on not founded please check the api defenetion"});
})
// listen to the server on the port 3000:
app.listen(3000,()=>{console.log("the server is now connected sucessfuly to the port",3000)});

