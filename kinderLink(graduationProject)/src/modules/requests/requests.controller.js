import { nanoid } from "nanoid";
import requestsModel from "../../../db/models/requests/requests.model.js";
import tokenModel from "../../../db/models/token/token.model.js";
import cloudinary from "../../utils/cliudinaryConfig.js";
import sendingEmail from "../../utils/sendingEmails.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
export const addRequet=async (req,res,next)=>
{
    try
    {
        console.log(req.files);
        let data=req.body;
        let {email,parentNationalId,childName,childNationalId}=req.body;
       // check on the entering the data first and check if the the  
       let user=await requestsModel.findOne({email});
       if(user)
       {
        return next(new Error("this email is already exists you must change the email and try again"));
       }
       let userParentNationalId=await requestsModel.find({childName});
       if(userParentNationalId)
       {
        let flag=true;
        for(let i=0;i<userParentNationalId.length;i++)
        {
         if(userParentNationalId[i].state!="finalRefused"&&userParentNationalId[i].state!="refused")
         {
            flag=false;
         }
        }
        if(flag==false)
        {
            return next(new Error("sorry you can't add request to the same childName until the request is rejected or evaluated by the especialists"));
        }
       }
       let finalUser=await requestsModel.find({childNationalId});
       if(finalUser)
       {
        let flag=true;
        for(let i=0;i<finalUser.length;i++)
        {
            if(finalUser[i].state!="refused"&&finalUser[i].state!="finalRefused")
            {
                flag=false;
            }
        }
        if(flag==false)
        {
            return next(new Error("you can't add the same nationalId in the system until the other reqquets is rejected"));
        }
       }
       //  heck on the phone also:
        // check if the password and repassword is matched:
        if(data.password!=data.rePassword)
        {
            return next(new Error("the pasword and repassword is not matched"));
        }
       
        // sending an email:
        const sendidngEmail=await  sendingEmail({to:data.email,subject:"the email Activation",text:"please enter on the button to activate your email",html:`<div style="text-align:center;height:300px;"><a href='http://localhost:3000/requests/activateAccount/${data.email}' title="go to activate your email"><button style="background-color:">activate your email</button></a></div>`});
        console.log(sendidngEmail);
        if(!sendidngEmail)
         {
            return next(new Error("the email you are entered is not true email"));
         }
         // encrypt the password:
         let passwordEncrypt=bcryptjs.hashSync(data.password,9);
         data.password=passwordEncrypt;
         console.log(req.files);
         // uploading the files on cloudinary:
         let arrayNationalId=[];
         let nationalIdFiles={};
         console.log("i'm here");
         console.log(req.files);
      let {frontNationalId,backNationalId,birthCertificate}=req.files;
      console.log(frontNationalId);
      console.log(backNationalId);
      console.log(birthCertificate);
      let birthFiles=[]
      // upload the file one:
      let frontBirthCretificate={};
      const getFront=await cloudinary.uploader.upload(frontNationalId[0].path,{folder:`/uploads/requests/${data.childName}/frontNationalId/`});
      frontBirthCretificate.public_id=getFront.public_id;
      frontBirthCretificate.secure_url=getFront.secure_url;
      birthFiles.push(frontBirthCretificate);
      // uploading the file two:
      let backBirthCretificate={};
      const getBack=await cloudinary.uploader.upload(backNationalId[0].path,{folder:`/uploads/requests/${data.childName}/backNationalId/`});
      backBirthCretificate.public_id=getBack.public_id;
      backBirthCretificate.secure_url=getBack.secure_url;
      birthFiles.push(backBirthCretificate);
      data.nationalIdFile=birthFiles;
      // uploading the file three:
      let birth={}
      let getBirth=await cloudinary.uploader.upload(birthCertificate[0].path,{folder:`/uploads/requests/${data.childName}/birthVertificate/`});
      birth.secure_url=getBirth.secure_url;
      birth.public_id=getBirth.public_id;
      data.birthCertificateFile=birth;
       
         await requestsModel.create(data);
         return res.json({sucess:true,message:"signed up sucessfully go to your gmail  to activate your email"});
    }
    catch(err)
    {
        console.log(err,err.stack);
        return next(err);
    }
}
export const activateEmail=async (req,res,next)=>{
try
{
    let {email}=req.params;
    let user=await requestsModel.findOne({email});
    if(!user)
    {
        return next(new Error("the user is not exists sorry"))
    }
    if(user.isActivated)
    {
        return next(new Error("the user is already active his email before"));
    }
    // upadte the isAvtivated and state:
    user.isActivated=true;
    user.state="underRevising";
    await user.save();
    return res.json({sucess:true,message:"the user is active his email sucessfully you can now logIn"});
}
catch(err)
{
    return next(err);
}
};
// login to the rqquests:
export const loginParent=async (req,res,next)=>
{
    try
    {
   // get the data from the body:
   let {email,password}=req.body;
   // then get the user:
   let user=await requestsModel.findOne({email});
   // check on the emil and check on the password:
   if(!user)
   {
    return next(new Error("the email is not true please make suer of your email"));
   }
   if(!user.isActivated)
   {
    return next(new Error("you not activate your email yet activate your email first"));
   }
   // then get the password then compare the password and the password is coming from the other fields:
   let passwordResults=bcryptjs.compareSync(password,user.password);
   if(!passwordResults)
   {
    return next(new Error("the password is not true please check the password then tryAgain"));
   }
   // then make th etoken for the authentecated user:
   const token=jwt.sign({id:user._id,state:user.state,email:user.email,isActivated:user.isActivated,interviewTime:user.interviewTime},"secretKey",{expiresIn:"2d"});
   // store the token in the token model:
   await tokenModel.create({token,userId:user._id,userAgent:req.headers['user-agent']});
   // then return the repoonse:
   return res.json({sucess:true,message:"the user is loggedIn sucessfully",token});
    }
    catch(err)
    {
        return next(err);
    }
}
export const getResult=async (req,res,next)=>
{
try
{
 // get the data of the parent:
 let parentData=req.userData;
 let resultsUser=await requestsModel.findOne({_id:parentData.id}).select("parentName email phone childName state dateOfInterviewing  condition interViewedBy evaluatedBy").populate([{path:"interViewedBy"},{path:"evaluatedBy"}])
 // send the reposne to the request:
 return res.json({sucess:true,resulsts:resultsUser});
}
catch(err)
{
    return next(err);
}
}
// update the data(not included the pass or email or files):)(job location nameof child name of parent):
// then ypu must first check tht the request is not begin to revising from the person:
// that the fisrt i should implemetn that the user can  change any fields of the in the request before he watched cor reviewed by the evaluator:
// that api cna chaneg the data all the data not be email not password or not files:
export const upadteRequetsAndEmail=async (req,res,next)=>{
try
{
    let {emaill}=req.body;
    let {id,email}=req.userData;
    // check first of the email is defined and the user want to update it:
    if(emaill)
    {
        
        // make the is activated false:
        const user=await requestsModel.findOne({_id:id});
        // make all the token is not valid:
        await tokenModel.updateMany({userId:user._id},{isValid:false});
        // make the state not in queue: 
        const stateUser=user.state;
        // update the email:
        user.email=emaill;
        user.state="notInQueue";
        user.isActivated=false;
        user.save();
         //send the email:
         let resultsSending=sendingEmail({to:emaill,subject:'activate oyur email kinderLink',text:"please enter in the button to activate your email",html:`<div style="text-align:center; text-decoration:none;"><a href='http://localhost:3000/requests/activateAccount/${emaill}'><button>activate your email Now</button></a></div>`});
         if(!resultsSending)
         {
            await requestsModel.updateOne({_id:id},{email,state:stateUser,isActivated:true});
            return next(new Error("your email is not updated (your new email may be not valid) and the ohter data is updated sucessfully and the other data is not updted also"));
         }
        
    }
     // remove the emiall fron the body:
     delete req.body.emaill;
     await requestsModel.updateOne({_id:id},req.body);
     // return the reposne:
     return res.json({sucess:true,message:"the data is updated sucessfully if you update the emial also you must activate your account"});
}
catch(err)
{
    return next(err);
}
};
// upadte the file of the the nationalId of the parent:
export const upadateNationalId=async (req,res,next)=>
{
 try
 {
 // get the user id:

 let {id}=req.userData;
 let user=await requestsModel.findOne({_id:id});
 // get the req.files data i want:
 let nationalIdArray=user.nationalIdFile;// arary of files:
 // then upadte the file on the cloudinary:
 let arraynew=[];
 let object={};
 for(let i=0;i<nationalIdArray.length;i++)
 {
     const {secure_url,public_id}=await cloudinary.uploader.upload(req.files[i].path,{

       public_id:nationalIdArray[i].public_id,
     });
     object.public_id=public_id;
     object.secure_url=secure_url;
    
    arraynew.push({...object});
 }
 // then we must have the array of the new files an dthat we want we ca update now:
 user.nationalIdFile=arraynew;
 await user.save();
 return res.json({sucess:true,message:"the national id files is uldated sucessfully"});
 }
 catch(err)
 {
    return next(err);
 }
}
// update the file of  birth certificate:
export const updateBirthCertificate=async(req,res,next)=>
{
    try
    {
// get the data od the user:
let {id}=req.userData;
let user=await requestsModel.findOne({_id:id});
// get the file data (old):
// upload the file and set the new file:
let  deleteImage=await cloudinary.uploader.destroy(user.birthCertificateFile.public_id);

const resultsUplods=await cloudinary.uploader.upload(req.file.path,{folder:`uploads/requests/${user.childName}/childBirthCertificate`});
// upadte in the db:
console.log(user.birthCertificateFile.public_id);

user.birthCertificateFile={public_id:resultsUplods.public_id,secure_url:resultsUplods.secure_url};
await user.save();
// resturn the response:
return res.json({sucess:true,message:"the file of birthCertificate is updated sucesssfully"});
    }
    catch(err)
    {
        return next(err);
    }
} 
// forget password:
export const forgetPassword=async (req,res,next)=>
{
try
{
      // get eh email of the user:
      const {email}=req.body;
      // check on the user an dthe emal of the usre:
      const user=await requestsModel.findOne({email});
      if(!user)
      {
         return next(new Error("the user is not exists please check your email first"));
      }
      if(!user.isActivated)
      {
          return next(new Error("please activate yoy email first"));
      }
      const code=nanoid(5);
      const emailSended=await sendingEmail({to:email,subject:"your reset password",text:"your reset code",html:`<div style='text-align:center;font-weight:bolder;font-size:xxl;'><h1>${code}</h1></div>`});
      if(!emailSended)
      {
          return next(new Error("there is an eror in the sendin gof the email"));
      }
      // then save the code in the user document:
      user.resetCode=code;
      await user.save();
      // thne return the respose:
      return res.json({sucess:true,message:"check ypour email to get your resetcode"});
}  
catch(err)
{
    return next(err);
}
}
// get the code to update the password:
export const getCode=async (req,res,next)=>{
try
{
// get the email of the user:
const {email,code,password,rePass}=req.body;
// cehck on the user if it exixts or not:
let user=await requestsModel.findOne({email});
if(!user)
{
    return next(new Error("the email is not correct"));
}
// ehc on if he validte or not:
if(!user.isActivated)
{
    return next(new Error("you must activate your account first"));
}
// check on the code first:
if(user.resetCode!=code)
{
    return next(new Error("the code is not correct"));
}
// match the wto password:
if(password!=rePass)
{
    return next(new Error("the password and the repassword is not matched"));
}
// then encrypt the pass then save the new password:
user.password=bcryptjs.hashSync(password,9);
await user.save();
// make all the token for this user invalid:
await tokenModel.updateMany({userId:user._id},{isValid:false});
// return the resposne:
return res.json({sucess:true,message:"the password is updated sucessfully"});
}
catch(err)
{
    return next(err);
}
}
// update password:
export const updatePassword=async (req,res,next)=>{
    try
    {
// get the email of the user:
let {email,id}=req.userData;
let user=await requestsModel.findOne({email,_id:id});
// get the data:
const {oldPassword,newPassword,rePass}=req.body;
// check on the matching of the passord and the repass:
if(newPassword!=rePass)
{
    return next(new Error("the newPassword and the repass is not matched"));
}
// check on the old pass the pass of the user:
let resultsCheck=bcryptjs.compareSync(oldPassword,user.password);
if(!resultsCheck)
{
    return next(new Error("your old password is not correct check agein"));
}

// then  encrypt the new pass:
user.password=bcryptjs.hashSync(newPassword);
await user.save();
// make all the token is not true for this user:
await tokenModel.updateMany({userId:id},{isValid:false});
// return the rpsosne:s
return res.json({sucess:true,message:"the user updated his pass successfully"});
    }
    catch(err)
    {
        return next(err);
    }
} 
// logot:
export const logout=async (req,res,next)=>{
try
{
    let {token}=req.headers;
    // make the toj=ken is invalid:
   let tk= await tokenModel.findOneAndUpdate({token:token.split("__")[1]},{isValid:false});
    // return the reponse:
    return res.json({success:true,message:"the user is loggedout sucessfully"});
}
catch(err)
{
return next(err);
}
}
// delete the requests:
export const deleteRequet=async (req,res,next)=>
{
try
{
// get the user data:
let {email,id}=req.userData;
await requestsModel.deleteOne({email,_id:id});
await tokenModel.updateMany({userId:id},{isValid:false});
// retur the repsoene:
return res.json({sucess:true,message:"the user account is deleted sucessfully"});
}
catch(err)
{
    return next(err);
}
}
export const getProfile=async (req,res,next)=>
{
   try
   {
    let  {id,email}=req.userData;
    const user=await requestsModel.findOne({_id:id}).populate([{path:"evaluatedBy"},{path:"interViewedBy"}]);
    if(!user)
    {
        return next(new Error("the requests is nt exists"));
    }
    // return the response:
    return res.json({sucess:true,user});
   }
   catch(err)
   {
    return next(err);
   }
}
// add profile picure:
export const profilePicture=async (req,res,next)=>{
try
{
    let data=req.userData;
    let user=await requestsModel.findOne({_id:data.id},);
    if(!user.profilePicture)
    {
        const upload=await cloudinary.uploader.upload(req.file.path,{folder:`/uploads/requests/${user.childName}/profilePicture/`});
        user.profilePicture={public_id:upload.public_id,secure_url:upload.secure_url};
        await user.save();
        return res.json({sucess:true,message:"the profilePicture is added sucessfully",user});
    }
    else
    {
        console.log(req.file.path);
        const upload=await cloudinary.uploader.upload(req.file.path,{public_id:user.profilePicture.public_id});
        user.profilePicture={public_id:upload.public_id,secure_url:upload.secure_url};
        await user.save();
        return res.json({sucess:true,message:"the profilePicture is added sucessfully",user});
    }
}
catch(err)
{
    return next(err);
}
}
// test this api's:

