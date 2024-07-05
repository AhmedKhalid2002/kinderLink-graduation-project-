import empModel from "../../../db/models/employees/employess.model.js";
import bcryptjs from 'bcryptjs';
import sendingEmail from "../../utils/sendingEmails.js";
import { nanoid } from "nanoid";
import jwt from 'jsonwebtoken';
import empTokenModel from "../../../db/models/employeeeToken/empToken.model.js";
import cloudinary from './../../utils/cliudinaryConfig.js';
import tokenModel from "../../../db/models/token/token.model.js";
import requestsModel from "../../../db/models/requests/requests.model.js";
import requestsRouter from "../requests/requests.routes.js";
import groupModel from "../../../db/models/groups/groups.model.js";
import busModel from "../../../db/models/bus/bus.model.js";

// add emaployee(admin action):
export const addEmployee=async (req,res,next)=>
{
try
{
    let {_id}=req.data;
  // get the data of the employee fisrt:
  let employeeData=req.body;
  // encrypt the pass:
  employeeData.password=nanoid(10);
  employeeData.addedBy=_id;
  console.log(employeeData.password);
  // save the data in the collection:
  await empModel.create(employeeData);
  // sending an email to the user:
  const sendEmail=await sendingEmail({to:employeeData.email,subject:"activate your email",text:"click on the button to activate your email",html:`<diV style='text-align:center;'><a style='text-decoration:none;' href="http://localhost:3000/employees/ActivateEmployee/${employeeData.email}"><button style="font-weight:bolder;font-size:laregr;">activate your email</button></a></diV>`});
  if(!sendEmail)
  {
    return next(new Error("please check the correctness of the email"));
  }
  // send the response:
  return res.json({sucess:true,message:"signedUp sucessfully check your email to activate your account"});
}
catch(err)
{
    return next(err);
}
}
// activte the employyee email:
export const actiavteAccount=async (req,res,next)=>{
   try
   {
 // get the emaail of the user:
 let {email}=req.params;
 // chekc on the emp if he exists or not and hsi emial:
 let user=await empModel.findOne({email});
 if(!user)
 {
     return next(new Error("this email is not have an account to active it"));
 }
 if(user.isActivated)
 {
     return next(new Error("the account is already activated before"));
 }
 // generate the pin code:
 let pinCode=nanoid(5);
 // update the pinCODE and the isactiaved:
 user.isActivated=true;
 user.pinCode=pinCode;
 await user.save();
 // sending an email with the pinCode:s
 const emailSend=sendingEmail({to:email,subject:"your PINCODE (private) and your password",text:"there your PIN PRivate code",html:`<div style='text-align:center;'><h1>your pincode</h1><h2>${pinCode}</h2><h1>your password</h1><h2>${user.password}</h2></div>`});
 if(!emailSend)
 {
     return next(new Error("there is an error whwre we sending the email of pincode"));
 }
 // sending the response:
 user.password=bcryptjs.hashSync(user.password,9);
 user.save();
 return res.json({sucess:true,message:"your account is sucessfully activate (check your email to get the PINCode for you and to know your password)"});
   }
   catch(err)
   {
    return next(err);
   }
}
// login as employee:(for all):
export const loginEmployee=async (req,res,next)=>{
  try
  {
  // get the data  of the mep from  the body:
  let {password,email,pinCode}=req.body;
  // cehck on the emai. first and the activatd xof the email:
  let user=await empModel.findOne({email});
  if(!user)
  {
      return next(new Error("the email is not correct"));
  }
  if(user.pinCode!=pinCode)
  {
      return next(new Error("the pinCode is not correct"));
  }
  if(!bcryptjs.compareSync(password,user.password))
  {
     return next(new Error("the password is not correct please check the password"));
  }
  if(!user.isActivated)
  {
      return next(new Error("please active your accont first from (check your email)"));
  }
  // then the user is exists mak ethe token and save the tokne on the employee token:
  let tokenUser=jwt.sign({id:user._id,name:user.name,email:user.email,role:user.role},"secretKey",{expiresIn:"2d"});
  // save the token inn the emp tokne:
  await empTokenModel.create({token:tokenUser,employeeId:user._id,userAgent:req.headers['user-agent']});
  // then return the response:
  return res.json({sucess:true,message:"the user is logged in sucessfully",token:tokenUser});
  }
  catch(err)
  {
    return next(err);
  }
}
// update the paassword of employee (for all):
export const updatePassword=async (req,res,next)=>
{
    try
    {
        let dataUpdates=req.body;
        // get the data of th user:
        let data=req.data;
        // check on the old password an the new password:
        if(!bcryptjs.compareSync(dataUpdates.oldPassword,data.password))
        {
            return next(new Error("your old password is not please check your pass"));
        }
        // check on the new password and the repassword:
        if(dataUpdates.newPassword!=dataUpdates.rePassword)
        {
        return  next("the newPassword and the rePassword isn not matched");
        }
        // then encryt the passoerd then sab=ve the new password in the db:
        let finalPass=bcryptjs.hashSync(dataUpdates.newPassword,9);
        // save :
        let user=await empModel.findOne({email:data.email});
        user.password=finalPass;
        await user.save();
        // make all his token invalid:
        await empTokenModel.updateMany({employeeId:req.data._id},{isValid:false});
        // return the response:
        return res.json({sucess:true,message:"the user updated his pass sucessfully"}); 
    }
    catch(err)
    {
        return next(err);
    }
}
// forget the password fo the employee (for all):
export const forgetPassword=async (req,res,next)=>
{
    try
    {
       let {email}=req.body;
       // cehck on the email first an dthe activattion of the email:  
       let user=await empModel.findOne({email});
       if(!user)
       {
        return next(new Error("the email is not correct"));
       }
       // then if the email is nit activated:
       if(!user.isActivated)
       {
        return next(new Error("the email is not activated yet please first activate your email"));
       }
       //thne make a code rof the user and save the code in the db:
       let code=nanoid(5);
       user.resetCode=code;
       await user.save();
       // send the code on the user mail: 
       const senedMail=await sendingEmail({to:email,subject:"your code to reset the password",text:"the your reset code:",html:`<div style='text-align:center;'><h1>reset code:</h1><h2>${code}</h2></div>`});
       if(!sendingEmail)
       {
        return next("there is an error in the sending of email");
       }
       // then send the response:
       return res.json({success:true,message:"check your email to get the resetCode"});
    }
    catch(err)
    {
        return next(err);
    }
}
// enter the foregt code:
export const getCodeOfForget=async (req,res,next)=>
{
    try
    {
           // get the data of the user:s
    let {email,code,password,rePassword}=req.body;
    // chekc on the email and the user:
    let user=await empModel.findOne({email});
    if(!user)
    {
        return next(new Error("the email of the user is not correct"));
    }
    if(!user.isActivated)
    {
        return next(new Error("the user account is not activated yet"));
    }
    // check on the code an dthe reset code of the password:
    if(code!=user.resetCode)
    {
        return next(new Error("the reset code you are entered is not correct"));
    }
    // check on the pass and the  rePass:
    if(password!=rePassword)
    {
        return next(new Error("the password and the reset password is not matched"));
    }
    // then encrypt the pass:
    let passEncrypt=bcryptjs.hashSync(password,9);
    user.password=passEncrypt;
    await user.save();
    // make all the token is not valid for this user:
    await empTokenModel.updateMany({employeeId:user._id},{isValid:false});
    // then send the reposne:
    return res.json({sucess:true,message:"the employee password is updated sucessfully"}); 
    }
    catch(err)
    {
        return next(err);
    }
}
// add the profilePicture(all):
export const updateProfilePucture=async (req,res,next)=>
{
  try
  {
  //get the user and data:
  let user=req.data;
  // get the profile picture of the user:
  let {profilePicture}=user;
  // chekc if the object contain public_id or not:
  if(!profilePicture.public_id)
  {
      // adding the new photo and creat the folder:
      console.log("dsfsdf");
      let photoUploaded=await cloudinary.uploader.upload(req.file.path,{folder:`employees/${user.name}/profilePicture`});
      profilePicture={public_id:photoUploaded.public_id,secure_url:photoUploaded.secure_url};
      // save the phohto now:
      let user=await empModel.findOneAndUpdate({email:user.email},{profilePicture});
      // return the reposne:
      return res.json({sucess:true,message:'the user photo is updated sucesfully',profilePicture});
      // add all the logic here:
  }
  console.log("not enter the condition");
  let profileSended=await cloudinary.uploader.upload(req.file.path,{public_id:profilePicture.public_id});
  profilePicture={public_id:profileSended.public_id,secure_url:profileSended.secure_url};
  let userGet=await empModel.findByIdAndUpdate({_id:user._id},{profilePicture});
  return res.json({sucess:"true",message:"the photo is updated sucessfully",profilePicture});
  }
  catch(err)
  {
    return next(err);
  }
}
// delete the account of employee(admin):
export const deleteAccount=async (req,res,next)=>{
try
{
// get the id of the admin:
let {_id,email}=req.data;
// vet the employee id of the user:
let {employeeId}=req.params;
// then chck on the id of that what do you want to delete:
let employee=await empModel.findOne({_id:employeeId});
if(!employee)
{
    return next(new Error("the employyeID is nit exists"));
}

// delete the account:
await employee.deleteOne();
// make all the token  of this user to false:
await empTokenModel.updateMany({employeeId},{isValid:false});
// check if the emloyee is suprvisor and do the suitable for it:
if(employee.role=="supervisor")
{
    // go to the groupModel and make all th egroups tht he is the groupSuperviosr to null:
    await groupModel.updateMany({groupSupervisor:employeeId},{groupSupervisor:null});
    // this is the do of the operation of upadte the all the groups that under this deleted suoerciosr to null to become able to do this in the groups:
}
if(employee.role='busSupervisor')
{
    await busModel.updateMany({busSupervisor:null});
}
// return the response:
return res.json({sucess:true,message:"the employeee is deleted sucessfully"});

}
catch(err)
{
    return next(err);
}
}
// update the other data(admin) (spData):
export const updateDataEmployee=async (req,res,next)=>
{
try
{
    // get the data that can changed:
let {employeeId}=req.params;
let updatedData=req.body;
let {_id}=req.data;
// get the id of the employeee that will changed his data:
// check on the user first:
// update the data of the employee and save that who updates his data:
// send the response and then okay:
let user=await empModel.findOne({_id:employeeId});
if(!user)
{
    return next(new Error("the employee is not exists sorry"));
}

if(!user.isActivated)
{
    return next(new Error("the employeee account is not activated yet"));
}
await user.updateOne(updatedData);
user.updatedBy=req.data._id;
await user.save();
return res.json({sucess:true,message:"the employeeData is updated sucessfully"});
}
catch(err)
{
    return next(err);
}
}
// search an specefiec employee by name(admin) or phone or twos:
export const searchOnEmployeeforAdmin=async (req,res,next)=>{
try
{
// get the search options from the query:
let dataSearch=req.query;
const {name,phone}=req.query;
// check on the name first:
if(!name&&!phone)
{
const employees=await  empModel.find().select("-password -pinCode").populate([{path:"addedBy",select:"-pinCode -password"},{path:"updatedBy",select:"-pinCode -password"}]).sort("name");
// return thye response:
return res.json({sucess:true,employees});
}
if(dataSearch.name)
{
    let users=await empModel.find({name:{$regex:dataSearch.name,$options:"i"}}).populate([{path:"addedBy",select:"name email phone role profilePicture"},{path:"updatedBy",select:"name email phone role profilePicture"}]).select("name salary role address email profilePicture addedBy updatedBy _id");
    return res.json({sucess:true,employees:users});
}
// if not:
let users=await empModel.find(dataSearch).populate([{path:"addedBy",select:"name email phone role profilePicture"},{path:"updatedBy",select:"name email phone role profilePicture"}]).select("name salary role address email profilePicture addedBy updatedBy _id");
return res.json({success:true,employees:users});
}
catch(err)
{
    return next(err);
}
}
// get all employess (admin) spData (you can choose role or you can't) by role:
export const getEmployeeRole=async (req,res,next)=>{
    try
    {
      // get the role or not:
      const data=req.query;
      if (req.query.role == 'undefined') {
        const employees = await empModel.find().populate([{path:"addedBy",select:"name email phone role profilePicture"},{path:"updatedBy",select:"name email phone role profilePicture"}]).select("name salary role address email profilePicture addedBy updatedBy _id").sort("name");
        return res.json({sucess:true,employees});
      }
      // egt ll the employees based in the conditon:
      const employees=await empModel.find(data).populate([{path:"addedBy",select:"name email phone role profilePicture"},{path:"updatedBy",select:"name email phone role profilePicture"}]).select("name salary role address email profilePicture addedBy updatedBy _id").sort("name");
      // retur the reposne:
      return res.json({sucess:true,employees});
    }
    catch(err)
    {
        return next(new Error(err));
    }
    }
// get an specefiec user profile  spData (admin):
export const getSpEmployee=async  (req,res,next)=>
{
try
{
    // get the emoloyeeId
    const {employeeId}=req.params;
    const emp=await empModel.findOne({_id:employeeId}).select("name email salary profilePicture addedBy updatedBy phone address role _id").populate([{path:"addedBy",select:"name email phone address salary role profilePicture _id"},{path:"updatedBy",select:"name email phone address salary role profilePicture _id"}])
    if(!emp)
    {
        return next(new Error("the employee is not exists"))
    }
    return res.json({sucess:true,employee:emp});
}
catch(err)
{
    return next(err);
}
}
// add notes  for a user(admin):
export const addNote=async (req,res,next)=>
{
try
{
   // add note as admin:(from defined wasn't any need to send tin the object):s
     let dataNote=req.body;
     dataNote.adminId=req.data._id;
   // get the note.to (to the employee i will get it):
       // check on the user that ou send the note if he exists or not:
       let employee=await empModel.findOne({_id:dataNote.toEmployee});
       if(!employee)
       {
        return next(new Error("the suer you send  the note to is not exists please check the (toEmployee)Id"));
       }
       // push the object of data in the documnt of the admin:
       let admin=await empModel.findOneAndUpdate({_id:req.data._id},{$push:{notes:dataNote}},{new:true});
       if(!admin)
       {
        return next(new Error("there admin is not exists or there is an error"));
       }
    // returh the response:
     return res.json({sucess:true,message:'the note is added sucessfully'});
}
catch(err)
{
return next(err);
}
};
// get the emplyee profile and get with all notes of this employee and populate the send fro the user not admin:
export const getMyProfileUser=async (req,res,next)=>
{
    try
    {
        // egt the id of the user:
        let {_id}=req.data;
        // get the all the admins documents which to is thea same of the id of the user:
        let allAdmins=await empModel.find({'notes.toEmployee':_id}).populate([{path:"notes.adminId",select:"name email profilePicture role phone _id"},{path:"notes.toEmployee",select:"name address email role address phone profilePicture _id"}]);
        let notesArray=[];
        // loop on the array of documntes and loop on the notes attay of each document:
        for(let i=0;i<allAdmins.length;i++)
        {
            for(let j=0;j<allAdmins[i].notes.length;j++)
            {
               if(allAdmins[i].notes[j].toEmployee._id==_id)
               {
                  notesArray.push(allAdmins[i].notes[j]);
               }
            }
        };
        // get the data of the employeee:
        let employee=await empModel.findOne({_id:_id}).populate({path:'addedBy',select:"name email address phone salary profilePicture _id"});
        if(!employee)
        {
            return next(new Error("the employee is not exists or this an error in the id"));
        }
        employee.notesArray=notesArray;
        if(employee.role=="supervisor")
            {
                var getSupervisor=await empModel.findOne({_id:_id}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"groups",populate:[{path:"createdBy"}]}]);
                return res.json({sucess:true,employee:getSupervisor});
            }

        // return the response:
        return res.json({sucess:true,employee,notesArray});
       
    }
    catch(err)
    {
    return next(err);
    }
}
// get the profile of the admin:
export const getProfileAdmin=async (req,res,next)=>
{ 
    let {_id}=req.data;
    // get the admin data:
    let admin=await empModel.findOne({_id:_id}).populate({path:'addedBy',select:"name email address phone salary profilePicture _id"});
    if(!admin)
    {
        return next(new Error("the admin is not exists or the id is noti correct"));
    }
    return res.json({sucess:true,profile:admin});
}
// upadate the state of the note to be seen:
export const updateNoteSeen=async (req,res,next)=>
{
try
{
// get the id of the user from the token:
let {_id}=req.data;
// get the array note:
let {arrayNotes}=req.body;
let flag=true;
// chekc if the user own this note fisrt then update:
for(let i=0;i<arrayNotes.length;i++)
{
    let note=await empModel.findOneAndUpdate({'notes.toEmployee':_id,'notes._id':arrayNotes[i]._id},{$set:{'notes.$.seen':true}},{new:true});
    if(!note)
    {
        flag=false;
        return next(new Error("the id of the note is not exists or the employee not have this note"));
    }
}
let arrrayOfUpdates=[];
arrayNotes.forEach((ele)=>{
ele.seen=true;
arrrayOfUpdates.push(ele);
})
// then send the reposne:
if(flag)
{
    return res.json({sucess:true,message:"the note sis updated sucessfully to seen",theUpdatedArray:arrrayOfUpdates});
}
}
catch(err)
{
    return next(err);
}
}
// delete the note from the admin tht send it:
export const deleteNote=async (req,res,next)=>
{
    try
    {
        const {noteId}=req.params;
        // then check frst that the admin is the owner of the note:
        const {_id}=req.data;
        let note=await empModel.findOneAndUpdate({_id:_id,'notes.adminId':_id,'notes._id':noteId},{$pull:{notes:{_id:noteId}}},{new:true}).populate({path:'notes.toEmployee',select:"name email address _id profilePicture role phone"});
        if(!note)
        {
           return next(new Error("the admin is not the owner of this note or the note id is not exists"));
        }
       return res.json({sucess:true,message:"the note is deleted sucessfully",user:note});
    }
    catch(err)
    {
        return next(err);
    }
}

// upadet the content of the note by the admin(admin):
export const updateContentNote=async (req,res,next)=>
{
try
{
  // get the data of the note:
  let {contentNew}=req.body;
  // get the id of the note:
  let {idNote}=req.params;
  // get the id of the admin first:
  let {_id}=req.data;
  // cehck if the admin he is the owener of this message and upadte:
  let note=await empModel.findOneAndUpdate({_id:_id,'notes.adminId':_id,'notes._id':idNote},{$set:{'notes.$.content':contentNew}},{new:true});
  if(!note)
  {
    return next(new Error("there is no note by this id or the admin  not owner of this note"));
  }
  // then send the resposne:
  return res.json({sucess:true,message:"the note is updated sucesssfully",noteNew:note});
}
catch(err)
{
    return next(err);
}
}
// logout for all employees:
export const logout=async (req,res,next)=>
{
try
{
  // get the token and get the id of the user:
  let {token}=req.headers;
  token=token.split("__")[1];
  // egt the id of the user:
  let {_id}=req.data;
  // update the token stae to in velid:
  let newTOken=await empTokenModel.findOne({token,employeeId:_id});
  if(!newTOken)
  {
    return next(new Error("the token is not exist or this user not own this token"));
  }
  newTOken.isValid=false;
  await newTOken.save();
  // retyrun the resposne:
  return res.json({sucess:true,message:"logget out sucessfully and the token become invalid to use"});
}
catch(err)
{
    return next(err);
}
}
// get the request for admin to watch:
export const getRequestAdmin=async (req,res,next)=>{
try
{
    // get the data from the queyd if i exisst:
let data=req.query;
// egt the requests:
let requests=await requestsModel.find(data).select("parentName email phone location birthDate childNationalId birthCertificateFile state _id dateOfInterviewing evaluatedBy interViewedBy nationalIdFile createdAt updatedAt profilePicture phone region childName").populate([{path:"evaluatedBy",select:"name email address phone role addedBy updatedBy _id profilePicture"},{path:"interViewedBy",select:"name email phone address role _id profilePicture addedBy updatedBy"}]).sort("createdAt");
// send the repsoense:
return res.json({sucess:true,requests});
}
catch(err)
{
    return next(err);
}
}
// get an specefirec requests to  the admi without any action on it:
export const getSpRequetForAdmin=async (req,res,next)=>
{
    try
    {
// get the is of the requets first and check if it exists or not:
const {requestId}=req.params;
const {nameChild}=req.body;
// get the name of the child to search on it:
if(nameChild)
{
   let  requests=await requestsModel.find({childName:{$regex:nameChild,$options:"i"}}).select("parentName email phone location birthDate childNationalId birthCertificateFile state _id dateOfInterviewing evaluatedBy interViewedBy nationalIdFile").populate([{path:"evaluatedBy",select:"name email address phone role addedBy updatedBy _id profilePicture"},{path:"interViewedBy",select:"name email phone address role _id profilePicture addedBy updatedBy"}]).sort("createdAt");
   // then restirn the respone:
   return res.json({sucess:true,requests});
}
if(requestId)
{
    let req=await requestsModel.findOne({_id:requestId});
    if(!req)
    {
        return next(new Error("the request is not exists ploease schekc the requetsId"));
    }
}
let reque=await requestsModel.findOne({_id:requestId}).select("parentName email phone location birthDate childNationalId birthCertificateFile state _id dateOfInterviewing evaluatedBy interViewedBy nationalIdFile").populate([{path:"evaluatedBy",select:"name email address phone role addedBy updatedBy _id profilePicture"},{path:"interViewedBy",select:"name email phone address role _id profilePicture addedBy updatedBy"}]).sort("createdAt");
return res.json({sucess:true,request:reque});
    }
    catch(err)
    {
        return next(err);
    }
}
// get the all the request to the admin:
export const getRequests=async (req,res,next)=>
{
try
{
    let allRequests=await requestsModel.find({}).select("parentName email phone location parentNationalId job nationalIdFile childName birthDate childNationalId birthCertificateFile evaluatedBy interViewedBy _id profilePicture createdAt updatedAt region phone").populate([{path:"evaluatedBy"},{path:'interViewedBy'}]).sort('createdAt updatedAt');
    // retutn the resposne:
    return res.json({sucess:true,requests:allRequests});
}
catch(err)
{
    return next(err);
}
}
export const getAnalysis=async (req,res,next)=>
{
try
{
// get the  month if it here:
let {month}=req.query;
if(!month)
{
    let requests=await requestsModel.find({}).select("-password -parentNationalId -nationalIdFile -childNationalId").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("-createdAt -updatedAt");
    let requestsAccepted=[];
    let requestsRejected=[];
    requests.forEach((ele)=>{
        if(ele.state=="accepted")
        {
            requestsAccepted.push(ele);
        }
        else if(ele.state=="finalRefused")
        {
            requestsRejected.push(ele);
        }
        else
        {

        }
    });
    return res.json({sucess:true,requests,acceptedRequests:requestsAccepted,sizeAccepted:requestsAccepted.length,rejectedFRequets:requestsRejected,sizeRejected:requestsRejected.length});
}
else
{
   // check first that you added a number or not:
   if(!(+month===Number.parseInt(month))||(+month<=0||+month>12))
   {
    return next(new Error("sorry you must send an valid month number from(1:12)"));
   }
   // get the requests from the query:
   let allRequests=await requestsModel.find({}).select("-password -parentNationalId -nationalIdFile -childNationalId").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("-createdAt -updatedAt");
   let requestsAccepted=[];
   let requestsRejected=[];
   allRequests=allRequests.filter(ele=>new Date(ele.createdAt).getMonth()+1==month||new Date(ele.updatedAt).getMonth()+1==month)
   allRequests.forEach((ele)=>{
       if(ele.state=="accepted")
       {
           requestsAccepted.push(ele);
       }
       else if(ele.state=="finalRefused")
       {
           requestsRejected.push(ele);
       }
       else
       {

       }});
       return res.json({sucess:true,requests:allRequests,acceptedRequests:requestsAccepted,sizeAccepted:requestsAccepted.length,rejectedFRequets:requestsRejected,sizeRejected:requestsRejected.length});
}
}
catch(err)
{
    return next(err);
}
}
// get the analysis of the the admin to employee:
export const anlayseSpEmployee=async (req,res,next)=>
{
try
{
    let {employeeId}=req.params;
let requests=await requestsModel.find({$or:[{evaluatedBy:employeeId},{interViewedBy:employeeId}]}).select("-password -parentNationalId -nationalIdFile -childNationalId").populate([{path:"evaluatedBy"},{path:"interViewedBy"}]).sort("-createdAt -updatedAt");

if(requests.length>0)
{
    var latestDaate=requests[0].updatedAt;
    requests.forEach((ele)=>{
        if(latestDaate<=ele.updatedAt)
        {
           latestDaate=ele.updatedAt;
        }
    });
}

return res.json({sucess:true,allRequets:requests,numberOfRequestsHeReview:requests.length,latestDateHeWork:latestDaate});
}
catch(err)
{
    return next(err);
}
}
export const upadatePinCodeForEmployee=async (req,res,next)=>
{
try
{
    let {employeeId}=req.params;
    // chekc first if that the id:s
    let employee=await empModel.findOne({_id:employeeId});
    if(!employee)
    {
        return next(new Error("the employee is not exists or the id of employee is not true"));
    }
    if(!employee.isActivated)
    {
        return next(new Error("the employee is not activte his account yet"));
    }
    // getenerate the pincode: first:
    let pinCodeNew=nanoid(5);
    // save the new pinCode in the db:
    employee.pinCode=pinCodeNew;
    employee.updatedBy=req.data._id;
    await employee.save();
    // send the email to tell the employee about his pin code:s
let sendingEMail=await sendingEmail({to:employee.email,subject:"the new pinCode",text:"your pinCode is:",html:`<div style='text-align:center;'><h2>your new pinCode is:</h2><h1>${pinCodeNew}</h1><p style='color:red;background-color:black;font-size:xx-large;'>please keep your pinCode in secret and not tell any one about it</p></div>`});
if(!sendingEMail)
{
    return next(new Error("this is an error in the email or the process of sending email is not completed"));
}
// upadte the token is valid false:
await empTokenModel.updateMany({employeeId:employeeId},{isValid:false});
// returnt he reposne:
return res.json({sucess:true,message:"the pinCode of the employee is updated sucessfully"});
}
catch(err)
{
    return next(err);
}
}
// get the supervispr hroups and studnets:
export const getSupervisorGroupAndStudent=async (req,res,next)=>
{
try
{
  // ge the employee id first:
  let {_id}=req.data;
  // get the group that assigned ot this empliyee :
  let groupStudents=await groupModel.findOne({groupSupervisor:_id}).populate([{path:"createdBy",select:"-pinCode -password"},{path:"updatedBy",select:"-pinCode -password"},{path:"childrenGroup",select:"-password"}]);
  if(!groupStudents)
  {
    return  res.json({
        success:true,
        message:"the supervisor not have any group yet",
    });
  }
  return res.json({sucess:true,group:groupStudents});
}
catch(err)
{
return next(err);
}
}
// get the busSuperviosr bus and the all the stdents:
export const getBusSuperviosr=async (req,res,next)=>
    {
    try
    {
    const {_id}=req.data;
      const busSupervosrBus=await busModel.findOne({busSupervisor:_id}).populate([{path:'addedBy'},{path:"updatedBy"},{path:"children"}]);
      if(!busSupervosrBus)
        {
            return res.json({sucess:true,message:"you are't assign to any bus yet",bus:null});
        }
        return res.json({sucess:true,bus:busSupervosrBus,numberOfSeatsReversed:busSupervosrBus.children.length,numberOfRestSeats:busSupervosrBus.capacity-busSupervosrBus.children.length});
    }
    catch(err)
    {
        return next(err);
    }
    }
// test all this api's :
// test the rest of api's:










