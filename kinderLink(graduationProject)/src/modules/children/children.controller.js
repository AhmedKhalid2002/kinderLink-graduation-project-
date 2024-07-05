import childrenModel from "../../../db/models/children/children.model.js";
import jwt from "jsonwebtoken";
import childTokenModel from "../../../db/models/childrenToken/children.token.js";
import bcryptjs from 'bcryptjs';
import sendingEmail from './../../utils/sendingEmails.js';
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cliudinaryConfig.js";
export const login=async (req,res,next)=>
{
try
{
  // get the data from the body and check on it:
  const {email,password}=req.body;
  
  // get the user:
  const user=await childrenModel.findOne({email});
  if(!user)
  {
    return next( new Error("check the email the email is not exists"));
  }
  console.log(bcryptjs.compareSync(password,user.password));
  console.log(password);
  console.log(user.password);
  if(!bcryptjs.compareSync(password,user.password))
  {
    return next(new Error("check the password the passwrod is not correct"));
  }
  if(!user.isActiveted)
  {
    return next(new Error("please active your account first check your gmail"));
  }
  // make the token to the children:
  let childToken=jwt.sign({childId:user._id,parentName:user.parentName,email:user.email,location:user.location,childName:user.childName,requestId:user.requestId},"secretKey",{expiresIn:"5d"});
  // save the token in the tokenModel to save it permenately:
  await childTokenModel.create({token:childToken,childId:user._id,userAgent:req.headers['user-agent']});
  // sebd the token in the repose:
  return res.json({successs:true,message:"loggedIn sucessfully",token:childToken});
}
catch(err)
{
    return next(err);
}
}
// get the profile:
export const getProfile=async (req,res,next)=>
{
try
{
// get the id of the studnet:
const {_id}=req.data;
// go to get the documnet and then bet the group then et the supervisor:
const child=await childrenModel.findOne({_id}).populate([{path:"groupId",populate:[{path:"groupSupervisor",select:"-pinCode -password"}]}]);
if(!child)
{
    return next(new Error("the child account is not exists"));
}
// send the reposne:
return res.json({success:true,child});
}
catch(err)
{
    return next(err);
}
}
// update sp data:
export const upadateEmail=async (req,res,next)=>
{
try
{
      //  get the id of the user:
  let {_id}=req.data;
  const user=await childrenModel.findOne({_id});
  if(!user)
  {
    return next(new Error("the user accouent is not exists"));
  }
  if(!user.isActiveted)
  {
    return next(new Error("the user is not activate his accouent yet"));
  }
  // get a SP Data:
  const {email}=req.body;
  if(email)
  {
    if(email==user.email)
    {
        return next(new Error("this is already your email the dats is not updated"))
    }
    const emailLike=await childrenModel.findOne({email});
    if(emailLike)
    {
        return next(new Error("this email is already exists the data is not updated"));
    }
     user.email=email;
     await user.save();
     const sendingEmailOk=sendingEmail({to:email,subject:`activation your email`,text:`please click on the button to activate your account in kinderLink Application`,html:`<div style='text-align:center;background-color:black;color:red'><a href='http://localhost:3000/childeren/activateEmail/${email}' style='font-size:larger;font-weight:bolder;'><button>activate your email</button></a></div>`});
     if(!sendingEmailOk)
     {
        return next(new Error("the process of sending email is not correct or the email is not valid"))
     }
     // upadte all  the token to this user:
     await childTokenModel.updateMany({childId:user._id},{isValid:false});
  }
  const userFinal=await childrenModel.findOne({email});
  // send the response:
  return res.json({
    success:true,
    message:"the email is updated sucessfully please check your email to activate your account",
  });
}
catch(err)
{
    return next(err);
}
}
// activate the email:
export const activateEmail=async (req,res,next)=>
{
try
{
    const {email}=req.params;
    // chekc on the email first:
    const user=await childrenModel.findOne({email});
    if(!user)
    {
        return next(new Error("the user email is not correct or the account is not exists"));
    }
    if(user.isActiveted)
    {
        return next(new Error("the account of user is activated already"));
    }
     user.isActiveted=true;
     await user.save();
     return res.json({sucess:true,message:'your accouent is sucessfully activated'});
}
catch(err)
{
    return next(err);
}
}
export const updatePhone=async (req,res,next)=>
{
try
{
// get the id of the user:
const {_id}=req.data;
const user=await childrenModel.findOne({_id});
if(!user)
{
    return next(new Error("the user is not have account"));
}
// get the data of phone:
const {phone}=req.body;
// upadte :
 user.phone=phone;
 await user.save();
 const userf=await childrenModel.findOne({_id:_id}).populate([{path:"groupId",populate:[{path:"groupSupervisor",select:"-pinCode -password"}]}]);
// send response:
return res.json({
    success:true,message:"the user update phone sucessfully",
    user:userf,
})
}
catch(err)
{
    return next(err);
}
}
// upadate password:
export const updatePassword=async (req,res,next)=>
{
try
{
    const {_id}=req.data;
    //get the data:
    const {oldPassword,newPassword,confirmPassword}=req.body;
    const user=await childrenModel.findOne({_id});
    if(!bcryptjs.compareSync(oldPassword,user.password))
    {
        return next("the oldPssword you entered is not correct");
    }
    if(newPassword!=confirmPassword)
    {
        return next(new Error("the password and confirm password is not matched"));
    }
    user.password=bcryptjs.hashSync(newPassword,9);
    await user.save();
    await childTokenModel.updateMany({childId:user._id},{isValid:false});
    // returnt he resposne:
    return res.json({
        sucess:true,message:"the user update his password sucessfully",
    })
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
const {email}=req.body;
const user=await childrenModel.findOne({email});
if(!user)
{
    return next("the email is not exists or the user not have an account");
}
if(!user.isActiveted)
{
    return next(new Error("the user must active his account first"));
}
const code=nanoid(5);
user.resetCode=code;
await user.save();
const sendignEmailF=await sendingEmail({to:email,subject:"forget password code",text:"this is your resetCode for forgetPassword",html:`<div style='text-align:center;background-color:black;color:red;'><h2>reset code:</h2><h1>${code}</h1></div>`});
if(!sendignEmailF)
{
    return next(new Error("the email is not valid mail or the internet connection is unstable"));
}
// send the resposne:
return res.json({
    sucess:true,
    message:"the resetCode is sended to you check your email",
});
}
catch(err)
{
    return next(err);
}
}
export const getCodeForForgetPass=async (req,res,next)=>
{
try
{
const {email,resetCode,password,confirmPassword}=req.body;
// check on the email and chek on the activted or not:
const user=await childrenModel.findOne({email});
if(!user)
{
    return next(new Error("the user is not exists or the emai inCorrect"));
}
if(!user.isActiveted)
{
    return next(new Error("the user must activate his account first"));
}
// check on the password and confirm pass:
if(password!=confirmPassword)
{
    return next(new Error("the password and confirm Password must be matched"));
}
// check on the code:
if(resetCode!=user.resetCode)
{
    return next(new Error("the reset code is not correct"));
}
// crypt the pass word:
const passwordEnc=bcryptjs.hashSync(password,9);
// upadet the passpwr din db:
user.password=passwordEnc;
await user.save();
// upadate the tokens:
await childTokenModel.updateMany({childId:user._id},{isValid:false});
// send the resposen:
return res.json({
    sucess:true,
    message:'updated sucessfully,login now',
});
}
catch(err)
{
    return next(err); 
}
}
// add profile picture to the child if he wants:
export const setProfilePicture=async (req,res,next)=>
{
try
{
// egt the id of the user and check o it:
const {_id}=req.data;
const user=await childrenModel.findOne({_id});
if(!user)
{
    return next(new Error("there is no child exists by this id chekc the id you may be deleted"));
}
if(!user.isActiveted)
{
    return next(new Error("the account must be activated first"));
}
// check if the user have the profile picture or not:
const profileObject={};
console.log("yes");
if(user.profilePicture)
{
    // update the profile picture only:
    const uploadingIm=await cloudinary.uploader.upload(req.file.path,{public_id:user.profilePicture.public_id});
    profileObject.public_id=uploadingIm.public_id;
    profileObject.secure_url=uploadingIm.secure_url;
    user.profilePicture=profileObject;
    await user.save();
    return res.json({sucess:true,message:"the profilePicture is uploaded sucessfully"});
}
console.log("yes");
console.log(req.file.path);
// add the profile oicture to the user:
const uploadingIm=await cloudinary.uploader.upload(req.file.path,{folder:`/uploads/children/${user.childName}/profilePicture/`});
profileObject.public_id=uploadingIm.public_id;
profileObject.secure_url=uploadingIm.secure_url;
user.profilePicture=profileObject;
console.log("ye sthe profile is updated");
await user.save();
return res.json({sucess:true,message:"the profilePicture is uploaded sucessfully"});
}
catch(err)
{
    return next(err);
}
}
/////////////////////////////////
// i want to change the logic of activate account to become res.redirect('url');


