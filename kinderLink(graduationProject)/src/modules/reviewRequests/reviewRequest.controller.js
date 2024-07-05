import { request } from "express";
import childrenModel from "../../../db/models/children/children.model.js";
import requestsModel from "../../../db/models/requests/requests.model.js";
import sendingEmail from "../../utils/sendingEmails.js";
import bcryptjs from "bcryptjs";
export const getEvaluatorRequestsAll=async (req,res,next)=>
{
    try
    {
          // get the requests from the state is underreviewing:
  let requests=await requestsModel.find({state:'underRevising',isActivated:true}).select("email parentName phone location parentNationalId job nationalIdFile childName birthDate childNationalId birthCertificateFile isActivated dateOfInterviewing _id createdAt updatedAt region profilePicture").sort("createdAt updatedAt");
  // send the resposne:
  return res.json({sucess:true,requests});
    }
    catch(err)
    {
        return next(err);
    }
}
// get an sp requests for the evaluator on the conditon that the the state is underRevising and is exists and the request is activated first: 
export const getSpRequestByEmail=async (req,res,next)=>
{
try
{
// get the email fro the query then schekc on it:
let {email}=req.query;
let request=await requestsModel.findOne({email,isActivated:true,state:"underRevising"}).select("email parentName phone location parentNationalId job nationalIdFile childName birthDate childNationalId birthCertificateFile isActivated dateOfInterviewing _id createdAt updatedAt region");
if(!request)
{
    return next(new Error("the user not activte his requests yet OR  there is no requests exists by this email OR you are unauthorized to review this requests in this stage"));
}
return res.json({sucess:true,request});
}
catch(err)
{
    return next(err);
}
}
// startin the reviewing:
// api that reviewby the avaluator:
export const reviewRequestByEvaluator=async (req,res,next)=>
{
try
{
// get the requestsId:
let {requestId}=req.params;
//check on the requests first:
let request=await requestsModel.findOne({_id:requestId});
if(!request)
{
    return next(new Error("the request is not exists"));
}
if(!request.isActivated)
{
    return next(new Error("the request must be activated first"))
}
if(request.state!="underRevising")
{
    return next(new Error("this request can't evaluated in this stage"));
}
// cehck on the three states(refused,interviewing,waiting)
let {state}=req.body;
if(state=="refused")
{
    // chekc if the condition is define:
    let {condition}=req.body;
    if(!condition)
    {
        return next(new Error("the conditon of the refused must be sended in the params also"));
    }
    // send an email :
    let email=await sendingEmail({to:request.email,subject:"the results of your requets",text:`this the results of your request to that with the name ${request.childName}`,html:`<div style='text-align:center;'><div><h2>the results is:</h2><h1>sorry your requests is refused</h1></div><div><h2>the condition of refused:</h2><h1>${condition}</h1></div></div>`});
    if(!email)
    {
        return next(new Error("the email is not sending the email may be have an error or the process"));
    }
    // update the state:
    request.state="refused";
    request.condition=condition;
    request.evaluatedBy=req.data._id;
    await request.save();
    return res.json({sucess:true,messsage:"the requests is refused sucessfully"});
}
else if(state=="interviewing")
{
    // send the email to the user:
    let email=await sendingEmail({to:request.email,subject:"the results of the request",text:"results of the requests",html:`<div style='text-align:centers;'><h2>the results</h2><h1>congratulations the request is initially accepted,your requests data is actullay correct and apply the condition and we will <br/><span style='text-decoration:underline;background-color:red;color:black;'>you will go to the interviewing step and we will send you an email by the interviewing time</span></h1></div>`});
    if(!email)
    {
        return next(new Error("the email is not sending the email may be have an error or the process"))
    }
    // upadte the state:
    request.state='interviewing';  
    request.evaluatedBy=req.data._id;
    await request.save()
    return res.json({sucess:true,messsage:"the requests go to interviewing state sucessfully"});
}
else if(state=="waiting")
{
    // chekc if the condition is define:
    let {condition}=req.body;
    if(!condition)
    {
        return next(new Error("the conditon of the waiting must be sended in the params also"));
    }
    // send an email :
    let email=await sendingEmail({to:request.email,subject:"the results of your requets",text:`this the results of your request to that with the name ${request.childName}`,html:`<div style='text-align:center;'><div><h2>the results is:</h2><h1>sorry your requests is go to the waiting list</h1></div><div><h2>the condition of waiting:</h2><h1>${condition}</h1></div></div>`});
    if(!email)
    {
        return next(new Error("the email is not sending the email may be have an error or the process"));
    }
    // update the state:
    request.state="waiting";
    request.condition=condition;
    request.evaluatedBy=req.data._id;
    await request.save();
    return res.json({sucess:true,messsage:"the requests is go to the waiting lists sucessfully"});
}
}
catch(err)
{
    return next(err);
}
};
export const getAllThatTherqeuestsThatReviesedByEV=async (req,res,next)=>
{
try
{
    let {_id}=req.data;
    let requests=await requestsModel.find({evaluatedBy:_id}).populate({path:"evaluatedBy"}).sort('-createdAt -upadatedAt');
    // returh the response:
    return res.json({sucess:true,requests});
}
catch(err)
{
    return next(err);
}
}
// get all the request to the interviewer:
export const getInterviewing=async (req,res,next)=>
{
    try
    {
      let allRequets=await requestsModel.find({isActivated:true,state:"interviewing"}).populate([{path:"evaluatedBy",select:'-password'}]).select("-password -resetCode -isActivated").sort("updatedAt");
      // return the resposne:
      return res.json({sucess:true,requests:allRequets});
    }
    catch(err)
    {
     return next(err);
    }
}
// get an sepecefiec for interviewer:
export const getSpForInterviewer=async (req,res,next)=>
{
try
{
    let {email}=req.query;
    // check on the request email:
    let requets=await requestsModel.find({email:{$regex:email,$options:"i"},state:"interviewing"}).select("-password -resetCode").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("createdAt updatedAt");
    // returnt hte respoene:
    return res.json({sucess:true,requests:requets});
}
catch(err)
{
    return next(err);
}
}
 // get all the requets that  not have an interview time:
export const getAllNotHaveTime=async (req,res,next)=>
{
try
{
    let allRequetsNotHaveTime=await requestsModel.find({state:"interviewing",dateOfInterviewing:null}).select("-password -resetCode").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("cretedAt updatedAt");
    // ertru the resposne:
    return res.json({sucess:true,requests:allRequetsNotHaveTime});
}
catch(err)
{
    return next(err);
}
}
// get all the requests that have an time to inetrview:
export const getAllThatHaveInterviewTime=async (req,res,next)=>
{
try
{
    let allRequests=await requestsModel.find({state:"interviewing",isActivated:true,dateOfInterviewing:{$ne:null},interViewedBy:req.data._id}).select("-password -resetCode").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("cretedAt updatedAt");
    // send the resposne:
    return res.json({success:true,requests:allRequests});
}
catch(err)
{
    return next(err);
}
}
// enter an interview time for the reeusts user:
export const setInterviewTime=async (req,res,next)=>
{
try
{
 // get the requests from the params first and check on it:
 let {requestId}=req.params;
 let requeest=await requestsModel.findOne({_id:requestId,dateOfInterviewing:null}).select("-password -resetCode").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("createdAt updatedAt")
 if(!requeest)
 {
    return next(new Error("the request is not exists in this stage or the requets can take already interviewDate check this"))
 }
 if(requeest.state!="interviewing")
 {
    return next(new Error("the request in this stage can't reviewed by you"));
 }
 if(!requeest.isActivated)
 {
    return next(new Error("the requests is not activated yet"));
 }
 // get all therequetssthat have intervewTime that have interview time to accept or reject:

 // get the interview time:
 let {interviewTime}=req.body;
 if(!interviewTime)
 {
    return next(new Error("you must send the interviewTime in the body"));
 }
 requeest.dateOfInterviewing=interviewTime;
 requeest.interViewedBy=req.data._id;
 await requeest.save();
 // send an email to the user by the interview time:
 let sendingEmil=await sendingEmail({to:requeest.email,subject:"the interviewTiem in kinderLink",text:"this is your interview time in the kinder link",html:`<div style='text-align:center;'><h2>interviewtime:</h2><h1>${interviewTime}</h1><h3 style='text-decoration:underline;'>you should come to the interview at the this time(${interviewTime}) Otherwise  your requests will be rejected if you have any question contact with us:0403550023</h3> <h1> the required documents you must bring:</h1> <h1 style='background-color:black;color:red;'><ul><li>the national Id of parent(up to date)</li><li>the birth certificate of child (up to date)</li><li>Father's salary vocabulary</li><li>Official proof of affiliation to the job</li></ul></h1></div>`});
 if(!sendingEmil)
 {
    return next(new Error("the email can be wrong or the process may have an error"));
 }
 // retutn the response he response:
 return res.json({sucess:true,messsage:"the interviewTime is set sucessfully",request:requeest});
}
catch(err)
{
    return next(err);
}
}
// update the interviewTIme of the user:
export const updateInterviewTime=async (req,res,next)=>
{
try
{
   // egt the interviewIDfrom the params fisrt:
   let {requestId}=req.params;
   // check on the if the user is the same user or not
   let userId=req.data._id;
   const request=await requestsModel.findOne({_id:requestId,state:"interviewing",isActivated:true,dateOfInterviewing:{$ne:null}}).select("-password -resetCode").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("createdAt updatedAt");
   if(!request)
   {
    return next(new Error("the id of the request may have an error or is not activated request or there is not have an dateOfInterview to update"));
   }
   if(request.interViewedBy._id.toString()!=userId.toString())
   {
    console.log(request.interViewedBy._id.toString(),"",userId);
    console.log(request.interViewedBy._id==userId);
    return next(new Error("sorry you haven't the authority to  upadte the intwerviewTime for this requests the interviwer who set the interviewDate for this request only do that "))
   }
   // get the interviewTime:
   let {interviewTime}=req.body;
   //upadete the interview time:
   request.dateOfInterviewing=interviewTime;
   await request.save();
   // send an email:
   let sendingEmailTo=await sendingEmail({to:request.email,text:"this is the new interviewwingTime",subject:"the newestInterviewingTime",html:`<div style='text-align:center;'><h2>interviewtime:</h2><h1>${interviewTime}</h1><h3 style='text-decoration:underline;'>you should come to the interview at the this time(${interviewTime}) Otherwise  your requests will be rejected if you have any question contact with us:0403550023</h3><h1> the required documents you must bring:</h1>  <h1 style='background-color:black;color:red;'><ul><li>the national Id of parent(up to date)</li><li>the birth certificate of child (up to date)</li><li>Father's salary vocabulary</li><li>Official proof of affiliation to the job</li></ul></h1></div>`});
   if(!sendingEmailTo)
   {
    return next(new Error("the email may be wrong Or  internetconnection is weak Or occurs an error in the process"));
   }
   return res.json({sucess:true,messsage:"the interviewTime is updating sucessfully",request});

}
catch(err)
{
    return next(err);
}
}
// the result of interview:
// reject the request afetr interview with constrains:
   // the requets must have an time and the time now is larger than the time okay and the interviewer msut be the interviewer that put the date :
   export const rejectOrAcceptInterview=async (req,res,next)=>
   {
     try
     {
        // then we will get the requestId first: andc check on it:
        let {requestId}=req.params;
        const request=await requestsModel.findOne({_id:requestId,dateOfInterviewing:{$ne:null}});
        if(!request)
        {
            return next(new Error("there rqeeust is not exists or the requestId is not valid OR you shiould put an interviewTime first"));
        }
        if(!request.isActivated)
        {
           return next(new Error("the request is not activated yet"));
        }
        if(request.state!="interviewing")
        {
            return next(new Error("the request is not enter the stage of interviewing now sorry"));
        }
        // check on the employee also:
        let user=req.data._id;
        if(user.toString()!=request.interViewedBy.toString())
        {
            return next(new Error("you aren't responsiple for this request the interviewer who set the date of interview do this only"));
        }
        // get the state thne we will do this:
        let {state}=req.body;
        if(!state)
        {
            return next(new Error("the state must be sended in the body also"));
        }
        // make the request is accepted and rejected:
        if(state=="finalRefused")
        {
        // get the condition:
        let {condition}=req.body;
        if(!condition)
        {
            return next(new Error("in the state of refused you must send the condition of refusing"))
        }
        // update the state in the document and the condition:
        request.condition=condition;
        request.state="finalRefused";
        await request.save();
        // send the email:
        let email=await sendingEmail({to:request.email,subject:"the final result of the request",text:"this is the final result of the request",html:`<div style='text-align:center;'><h2>the final result of the request:</h2><h1>${state}</h1><h2>the condition of refused is:</h2><h1>${condition}</h1></div>`});
        // send the resposne:
        return res.json({sucess:true,message:"the results of interview is sucessfully refused",request});
        }
        else if(state=="accepted")
        {
            const {busService}=req.body;
            if(!busService)
                {
                    return next(new Error("you msut send busService in b ody true or false"));
                }
            // send an email:
            let sendingEm=await sendingEmail({to:request.email,subject:"the results of intervieweing",text:"this is the result of the interviewing in the kinderLink",html:`<div style='text-align:center;'><h2>the results:</h2><h1>${state}</h1><div style='background-color:black;color:red;'> <h1>warining:<br/></h1><h1>you must download the application from google play for android <br/>and from App strore for ios </h1></div></div>`});
            if(!sendingEm)
            {
                return next(new Error("the email is not sending well or there is an error in the sending process"));
            }
            // upadate the state:
            request.state=state;
            request.busService=busService;
            await request.save();
            // save the new documnt int the student model:
            // extract the dta i wany to extract first:
            let objectData={parentName:request.parentName,phone:request.phone,email:request.email,location:request.location,childName:request.childName,requestId:request._id,region:request.region,busService:busService,password:request.password};
            if(request.profilePicture)
            {
                objectData.profilePicture=request.profilePicture;
            }
            // save the object in the children model:
            await childrenModel.create(objectData);
            // send the response:
            return res.json({sucess:true,message:"the requests is accepted sucessfully",request});
        }
     }
     catch(err)
     {
       return next(err);
     }
   }
   export const getAllInterviewedRequests=async (req,res,next)=>{
    try
    {
        const userId=req.data._id;
        const  requests=await requestsModel.find({interViewedBy:userId}).select("-password").populate({path:"evaluatedBy",select:"-password -pinCode"}).sort("-createdAt -updatedAt");
        return res.json({sucess:true,requests:requests});
    }
    catch(err)
    {
        return next(new Error(err));
    }

   }
   export const updateWaitingState=async (req,res,next)=>{
    try
    {
        const {state,condition}=req.body;
        const {requestId}=req.params;
        const {_id}=req.data;
        // check on the id of requets:
        const requets=await requestsModel.findOne({_id:requestId});
        if(!requets)
            {
                return next(new Error("there is no requets by this id or may be deleted"));
            }
            if(requets.state!='waiting')
                {
                    return next(new Error("the request not in the interviewing state to change it state"));
                }
            if(state=='interviewing')
                {
                   requets.state="interviewing";
                   requets.evaluatedBy=_id;
                   await requets.save();
                   const sendI=await sendingEmail({to:requets.email,subject:"this email to tell you about the updating result",text:"this is the result of your requets",html:`<div style='text-align:center;color:red;background-color:black;'><h2>the result:</h2><h1>${state}</h1></div>`});
                   if(!sendI)
                    {
                        return next(new Error("the internet connection may be insatble or the email is incorrect"));
                    }
                    
                    const r=await requestsModel.findOne({_id:requestId}).populate([{path:"evaluatedBy"},{path:"interViewedBy"}]);
                    return res.json({sucess:true,message:"the request is updated sucessfully",request:r});
                }
                if(state=="refused")
                    {
                       if(!condition)
                        {
                            return next(new Error("the condition must be send at the refused state"));
                        }
                        requets.state="refused";
                        requets.condition=condition;
                        requets.evaluatedBy=_id;
                        await requets.save();
                        const sendI=await sendingEmail({to:requets.email,subject:"this email to tell you about the updating result",text:"this is the result of your requets",html:`<div style='text-align:center;color:red;background-color:black;'><h2>the result:</h2><h1>${state}</h1><h2>the condition:</h2><h1>${condition}</h1></div>`});
                        if(!sendI)
                         {
                             return next(new Error("the internet connection may be insatble or the email is incorrect"));
                         }
                         const r=await requestsModel.findOne({_id:requestId}).populate([{path:"evaluatedBy"},{path:"interViewedBy"}])
                         return res.json({sucess:true,message:"the requets is updated sucessfully",request:r});
                    }
    }
    catch(err)
    {
        return next(err);
    }
   }
// this  the all the review requests code to accept or reject the requests;