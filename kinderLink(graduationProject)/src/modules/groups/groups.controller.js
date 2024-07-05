import childrenModel from "../../../db/models/children/children.model.js";
import empModel from "../../../db/models/employees/employess.model.js";
import groupModel from "../../../db/models/groups/groups.model.js";
import sendingEmail from "../../utils/sendingEmails.js";
// get  all the supervisor free to ake the group first:
export const getAllFreeSupervisor=async (req,res,next)=>
{
try
{
  // get all the supervisor first:
  let supervisors=await empModel.find({role:"supervisor",isActivated:true});
   
  // lopps on  this array or superviosrs and if null push on the array:
  let availableSuperviosrs=[];
  for(let i=0;i<supervisors.length;i++)
  {
    let supervisor=await groupModel.findOne({groupSupervisor:supervisors[i]._id}).select("-password -pinCode");
    if(!supervisor)
    {
         availableSuperviosrs.push(supervisors[i]);
    }
  }
  // return the response with all the free supervisors:
  return res.json({success:true,supervisors:availableSuperviosrs});
}
catch(err)
{
    return next(err);
}
}
// get all the free students or by sp region:
export const getAllFreeStudents=async (req,res,next)=>
{
    try
    {
        const {region}=req.query;
        // not check by the region and get all only:
        if(!region)
        {
           const allStudennts=await childrenModel.find({groupId:null}).sort("childName");
           // send the response:
           return res.json({sucess:true,students:allStudennts})
        }
        // get the students by the region and the groupId is null:
        const allStudents=await childrenModel.find({region,groupId:null});
        // returnt  the response:
        return res.json({sucess:true,students:allStudents});
    }
    catch(err)
    {
        return next(err);
    }
}
// make a new group // revise this now:
export const makeGroup=async (req,res,next)=>
{
try
{
    const groupData=req.body;
    // check on the groupSupervisor fisrt that he defined and he is superviosr and he is not have a group alredy:
    let {groupSupervisor}=groupData;
    let sup=await empModel.findOne({_id:groupSupervisor});
    if(!sup)
    {
        return next(new Error("there is no supervisor exists by this id"));
    }
    if(!sup.isActivated)
    {
        return next(new Error("the employee is not activate his account yet"))
    }
    if(sup.role!="supervisor")
    {
        return next( new Error("the role of this employee is not supervisor"))
    }
    const getSupGroup=await groupModel.findOne({groupSupervisor:sup._id});
    if(getSupGroup)
    {
        return next(new Error("the supervisor is already have an group"));
    } 
    // add the crted by to the object:
    groupData.createdBy=req.data._id;
    // add the group docuent in the groupmodel:
    
    await groupModel.create(groupData);
    // send the email to the supervisor that he will responsible for the an sp group:
    let sendingEmailok=await sendingEmail({to:sup.email,subject:"Group Responsibility",text:`hello ${sup.name} this email to tell you about your group you will responsible for:`,html:`<div style='text-align:center;background-color:black;color:red;'><h2>the group name:</h2><h1 style='text-decoration:underline;'>${groupData.groupName}</h1> <p>open the application and check!</p></div>`});
    if(!sendingEmailok)
    {
        return next(new Error("the email is not sended sucessfully the email can be wrong or the process is not completed"))
    }
    // get all the groups:
    let allGroups=await groupModel.find({}).populate([{path:"groupSupervisor",select:"-password -pinCode"},{path:"createdBy",select:"-password -pinCode"},{path:"updatedBy",select:"-password -pinCode"}]).sort("-createdAt -updatedAt");
    // return the response:
    console.log("ya ghaly menM3aya");
    // get the group of this only:
    const newGroup=await groupModel.findOne({groupName:groupData.groupName});
    return res.json({sucess:true,message:"the group is created sucessfully",allGroups,newCreatedGroup:newGroup});
}
catch(err)
{
    return next(err);
}
};
// delete the group:(ther is an updates will done on this controller):
export const deleteGroup=async (req,res,next)=>
{
try
{
// get the id of the group first:
const {groupId}=req.params;
// check first if the group id is exists:
const group=await groupModel.findOne({_id:groupId});
if(!group)
{
    return next(new Error("the group is not exists please chekc the groupId"));
}
// update the state of the children that wth in this group to null:
await childrenModel.updateMany({groupId:groupId},{groupId:null});
// delete the group from the db:
await groupModel.deleteOne({_id:groupId});
const allGroups=await groupModel.find().populate([{path:"groupSupervisor",select:"-password -pinCode"},{path:"createdBy",select:"-password -pinCode"},{path:"updatedBy",select:"-password -pinCode"}]).sort("-createdAt -updatedAt");
// upadet the group for all children to null in this group:
await childrenModel.updateMany({groupId:groupId},{groupId:null});
// send resposne:
return res.json({sucess:true,message:"the group is deleted sucessfully",groups:allGroups});

}
catch(err)
{
    return next(err);
}
}
// update the group data name and capacity and updatedBy:
export const updateGroupData=async (req,res,next)=>
{
try
{
    // get the groupid and chekc on it:
    const {groupId}=req.params;
     // gett he upated data:
    const data=req.body;
    data.updatedBy=req.data._id;
    const group=await groupModel.findOneAndUpdate({_id:groupId},data,{new:true});
    if(!group)
    {
      return next(new Error("the group is not exists please check id"));
    }
    // returb the response:
    return res.json({sucess:true,message:"the group is updated sucessfully",group});
}
catch(err)
{
    return next(err);
}
}
// update the  groupSupervisor:
export const updateGroupSupervisor=async (req,res,next)=>
{
  try
  {
       // get the group id and chekc on it:
       const {groupId}=req.params;
       const group=await groupModel.findOne({_id:groupId});
       if(!group)
       {
        return next(new Error("the group is not exists or the id is not valids"))
       }
    // get the  groupSupervisor and chekc on it:
    const {groupSupervisor}=req.body;
    const superVisor=await empModel.findOne({_id:groupSupervisor});
    if(!superVisor)
    {
        return next(new Error("the superviosr is not exists or the id of suercisor is notValid"));
    }
    if(!superVisor.isActivated)
    {
        return next(new Error("the superVisor is not acivte his email yet"));
    }
    if(superVisor.role!="supervisor")
    {
        return next(new Error("the employee's role is not suprvisor"));
    }
    const supGroup=await groupModel.findOne({groupSupervisor:superVisor._id});
    if(supGroup)
    {
        return next(new Error("the supervisor is already assigne to another group"));
    }
    // updte the groupSupervisor:
    group.groupSupervisor=groupSupervisor;
    group.updatedBy=req.data._id;
   await group.save();
   const groupNew=await groupModel.findOne({_id:groupId});
    // send an emial to the new groupSupervisor to tel about hisn new group:s
    const sendignEmailok=await sendingEmail({to:superVisor.email,subject:"the new group you will respinsible for",text:`hello ${superVisor.name} this email is sending to you to tell you about your group`,html:`<div style='text-align:center;background-color:black;color:red;'><h2>the group name:</h2><h1 style='text-decoration:underline;'>${group.groupName}</h1> <p>open the application and check!</p></div>`});
    if(!sendignEmailok)
    {
        return next(new Error("the email is not sending sucessfully the email can be wrong or the process is not valid"))
    }
    // send the resposne:
    return res.json({sucess:true,messsge:"the groupSupervisor is updated sucessfully",group:groupNew})
  }
  catch(err)
  {
    return next(err);
  }
}
// make the group without  supervisor to null :
export const makeGroupWithoutSuperviosr=async (req,res,next)=>
{
    try
    {
        const {groupId}=req.params;
        const groupNew=await groupModel.findOneAndUpdate({_id:groupId},{groupSupervisor:null},{new:true});
        if(!groupNew)
        {
            return next(new Error("the group is not exists or the groupId is not correct"));
        }
        return res.json({sucess:true,message:"the group is sucessfully updated"});
    }
    catch(err)
    {
        return next(err);
    }
}
// get all the groups you should sen din query all,withoutSupervisor,haveSuperviosr (all withSupervisor nullSupervisor) states:
export const getAllGroups=async (req,res,next)=>
{
try
{
    // get the query conditon:
let {condition}=req.query;
// chekc on theif the condiotpn is here or not:
if(!condition)
{
      // get all the groups in the collection:
      const allGroups=await groupModel.find().populate([{path:"createdBy",select:"-passwrod -pinCode"},{path:"updatedBy",select:"-pinCode -password"},{path:"childrenGroup",select:"-password",populate:[{path:"bus",populate:"busSupervisor"}]},{path:"groupSupervisor"}]).sort("groupName");
      let  informationAboutNumbersOfEachGroup=[]
      // loop in each group to  get the  students length:
    allGroups.forEach((ele)=>{
       let object={};
       object.theNumberOfChildrnInGroup=ele.childrenGroup.length;
       object.restOfNumbers=ele.capacity-ele.childrenGroup.length; 
       informationAboutNumbersOfEachGroup.push(object);
    });
      // return the reposne;
      return res.json({sucess:true,groups:allGroups,informationAboutNumbersOfEachGroup});
}
// if  the conditon is here:
if(condition=="withoutSupervisor")
{
const allGroups=await groupModel.find({groupSupervisor:null}).populate([{path:"createdBy",select:"-passwrod -pinCode"},{path:"updatedBy",select:"-pinCode -password"}]).sort("groupName");
// retutnr the resposne:
return res.json({sucess:true,groups:allGroups});
}
else if(condition=="withSupervisor")
{
const allGroups=await groupModel.find({groupSupervisor:{$ne:null}}).populate([{path:"createdBy",select:"-passwrod -pinCode"},{path:"updatedBy",select:"-pinCode -password"}]).sort("groupName");
// return the response:
return res.json({sucess:true,grops:allGroups});
}
else
{
return res.json({sucess:false,message:"the condition value must be one of this ['withoutSupervisor','withSupervisor']"});
}

}
catch(err)
{
    return next(err);
}
}
// (not done)  get sp group with all students + and with his supervisor populate wiht all data (get specefiec group wiht all the data of supervisor and with all the stubest in this group):   (rest in the final og the process):

// (not done)add the stundets to this group:
export const assginChildrenToGroup=async (req,res,next)=>
{
 try
{
const {groupId}=req.params;
const group=await groupModel.findOne({_id:groupId});
if(!group)
{
return next(new Error("please check the groupId this group is not exists"));
}
// check on the group if it exists or not:
const {studentsId}=req.body;
// check on the  students and the id of the stuents and if then not in groups first:
for(let i=0;i<studentsId.length;i++)
{
    let student=await childrenModel.findOne({_id:studentsId[i]});
    if(!student)
    {
        return next(new Error(`${studentsId[i]} is not exists please check the validity of the childrenId`));
    }
    if(student.groupId!=null)
    {
        return next(new Error(`the childId ${studentsId[i]} is already in group you can remove the child first then add him`));
    }
    // check on the capacty of the group first:
    const allStudents=await childrenModel.find({groupId:group._id});
    if(allStudents.length>=group.capacity)
    {
        return next(new Error("sorry the capacity of the group is reached"));
    }
    //add the child to the group now:
    student.groupId=groupId;
    await student.save();
    
    // send an email tot he prent of the students:
    const sendingEmailok=sendingEmail({to:student.email,subject:"the group of yourChild",text:"hello from the kinderLink mr/ms ${student.parentName} this mail to tell you about your child Group",html:`<div style='text-align:center;background-color:black;color:red;'><h2>group name:</h2><h1 style='text-decoration:underline;'>${group.groupName}</h1></div>`});
    if(!sendingEmailok)
    {
      return next(new Error("there is an error in sending email may be weak connection to inetrnet or the email is not valid"));
    }
    
}
// return the resosne:
return res.json({suces:true,message:"the children is added to the group sucessfully"});
}
catch(err)
{
    return next(err);
}
}
// (not done)if the group is deleted go to the controller of delete to make all in this group to null value to uafte the data of the students to null in groupId:
// get all by name filetr:
export const getAllByNameOrByFIlter=async (req,res,next)=>
{
try
{
    const {groupName}=req.query;
    let  allGroups;
    if (req.query.groupName)
    {
        // cehck if the length is 0:
        if(groupName.length==0||groupName=="")
        {
            let array=[];
        allGroups=await groupModel.find({}).populate([{path:"groupSupervisor"},{path:"createdBy",select:"-password -pinCode"},{path:"updatedBy",select:"-pinCode -password"},{path:"childrenGroup",populate:[{path:"bus"}]}]).sort("groupName");
        allGroups.forEach((ele)=>{
            let object={};
            object.theNumbersOfChildrenInGroupNow=ele.childrenGroup.length;
            object.theRestNumber=ele.capacity-ele.childrenGroup.length;
            object.maximumCapacity=ele.capacity;
            array.push(object);
        })    
        return res.json({success:true,groups:allGroups,groupsnumberInformation:array});
        }
        else{
         // apply the condition in the groups:
         let array=[];

         allGroups=await groupModel.find({groupName:{$regex:groupName,$options:"i"}}).populate([{path:"groupSupervisor"},{path:"createdBy",select:"-password -pinCode"},{path:"updatedBy",select:"-pinCode -password"},{path:"childrenGroup",populate:[{path:"bus"}]}]).sort("groupName");
         allGroups.forEach((ele)=>{
            let object={};
            object.theNumbersOfChildrenInGroupNow=ele.childrenGroup.length;
            object.theRestNumber=ele.capacity-ele.childrenGroup.length;
            object.maximumCapacity=ele.capacity;
            array.push(object)});
            return res.json({success:true,groups:allGroups,groupsnumberInformation:array});
        }
    }
    const gp=await groupModel.find().populate([{path:"createdBy",select:"-password -pinCode"},{path:"updatedBy",select:"-pinCode -password"}]).sort("groupName");
    return res.json({sucess:true,groups:gp});
}
catch(err)
{
return next(err);
}
}
// get a specefiec group with all data:
export const getSpWithAllData=async (req,res,next)=>
{
try
{
    const {groupId}=req.params;
    // hcekc on the groupID  First:
    const group=await groupModel.findOne({_id:groupId}).populate([{path:"childrenGroup",populate:[{path:"bus",populate:[{path:"busSupervisor"}]}]},{path:"createdBy",select:"-pinCode -password"},{path:"updatedBy",select:"-pinCode -password"},{path:"groupSupervisor",select:"-pinCode -password"}]);
    if(!group)
    {
        return next(new Error("plese check the groupId beacues there is no group exists by this id"));
    
    }
    // return the resposne:
    return res.json({success:true,group,theNumberNowInGroup:group.childrenGroup.length,theRestNumberInGroup:group.capacity-group.childrenGroup.length,maximumCapacity:group.capacity});
}
catch(err)
{
    return next(err);
}
}
// remove childen from the group:
export const removeChildren=async (req,res,next)=>
{
try
{
    // get the group id:
    const {groupId}=req.params;
    const group=await groupModel.findOne({_id:groupId});
    if(!group)
    {
        return next(new Error("the group is not exists chekc the id"));
    }
    // get the children from the body and check on the children:
    const {children}=req.body;
    for(let i=0;i<children.length;i++)
    {
        let  studnet=await childrenModel.findOne({_id:children[i]});
        if(!studnet)
        {
            return next(new Error(`the id of the student (${children[i]}) is not exists `));
        }
        if(!studnet.groupId)
        {
            return next(new Error(`the student with id ${studnet._id} not in group already`));
        }
        if(studnet.groupId.toString()!=groupId.toString())
        {
            return next(new Error("the student with id ${studnet._id} not related to this group check the data"));
        }
        studnet.groupId=null;
        await studnet.save();
    }
    const gp =await groupModel.findOne({_id:groupId}).populate([{path:"groupSupervisor",select:"-pinCode -password"},{path:"childrenGroup"}]);
    //return the response:
    return res.json({sucess:true,message:"the children is sucessfully removed from the group",group:gp});
}
catch(err)
{
    return next(err);
}
}
//




