
import eventModel from "../../../db/models/events/events.model.js";
import cloudinary from "../../utils/cliudinaryConfig.js";
import mongoose from "mongoose";
import childrenModel from './../../../db/models/children/children.model.js';


// add events:
export const addEvent=async (req,res,next)=>
{
    try
    {
// get the id of the id of the amdin:
const {_id}=req.data;
// get the data you  want to check now:
const {capacity,eventPrice,eventDate}=req.body;
// chekc on  each fiesl of this thne do :
const newCapacity=Number.parseInt(capacity);
if(newCapacity!=capacity)
    {
        return next(new Error("the capacity must be an number"));
    }
const newPrice=Number.parseInt(eventPrice);
if(newPrice!=eventPrice)
    {
        return next(new Error("the event price must be an number"));
    }
const dateNow=new Date();
console.log(dateNow);
const eventDater=new Date(eventDate);
if(eventDater<=dateNow)
    {
        return next(new Error("the date must be larger than the today"));
    }
const allData=req.body;
allData.capacity=+capacity;
allData.eventPrice=+eventPrice;
allData.addedBy=_id;
//then check on the req.files:
if(req.files)
    {
        const arrayPhotos=[];
           // loop on the array now:
           for(let i=0;i<req.files.length;i++)
            {
                const objectPhoto={};
                const cloudinaryUpload=await cloudinary.uploader.upload(req.files[i].path,{folder:`/events/${req.body.eventName}(${req.body.eventDate})/`});
                objectPhoto.secure_url=cloudinaryUpload.secure_url;
                objectPhoto.public_id=cloudinaryUpload.public_id;
                arrayPhotos.push(objectPhoto);
            }
        allData.eventPhotos=arrayPhotos;    
    }
// make the documst isn the db:
await eventModel.create(allData);
// get all the data:
const allEvents=await eventModel.find().populate([{path:"addedBy"}]).sort("-createdAt -updatedAt");
// returnt the reposene:
return res.json({success:true,message:"the event is added sucessfully",allEvents});

    }
    catch(err)
    {
        return next(err);
    }
}
// delete the event:
export const deleteEvent=async (req,res,next)=>
{
try
{
// egt the eventId:
const {eventId}=req.params;
const event=await eventModel.findOne({_id:eventId});
if(!event)
    {
        return next(new Error("the event id  is not true or the event may be deleted"));
    }
    await event.deleteOne();
    const allEvents=await eventModel.find().populate([{path:"addedBy"}]).sort("-createdAt -updatedAt");
    return res.json({success:true,message:"the event is deleted sucessfully",allEvents});
}
catch(err)
{
    return next(err);
}
}
// update event:
export const updateEvent=async (req,res,next)=>
{
try
{
    const {eventId}=req.params;
    // chekc on the id of the:
    const event=await eventModel.findOne({_id:eventId});
    if(!event)
        {
            return next(new Error("the event is not exists check the id of the event or the event may be deleted"));
        }
    // hcekc on the data of the event like the iamges and date capacity price eventName:
    const {eventPrice,eventDate,capacity}=req.body;
    const data=req.body;
    // check on the cpacity:
    if(capacity)
        {
            const newCapacity=Number.parseInt(capacity);
            if(newCapacity!=+capacity)
            {
                return next(new Error("the capacity must be an number"));
            }
            data.capacity=+capacity;
        }
        if(eventPrice)
            {
                const newPrice=Number.parseInt(eventPrice);
                if(newPrice!=+eventPrice)
                {
                    return next(new Error("the price of the event must be an number"));
                }
                data.eventPrice=+eventPrice;
            }
    
        // hcec n the date:
          if(eventDate)
            {
                const dateNow=new Date();
                const newDate=new Date(eventDate);
                if(newDate<=dateNow)
                {
                        return next(new Error(`the event date must be larger than today ${dateNow}`));
                }
            }
        // check on if the images is exists or not:
        if(req.files)
        {
            const array=[];
            // loop on the array and check:
            for(let i=0;i<req.files;i++)
                {
                    const objectPhoto={};
                    const uploading=await cloudinary.uploader.upload(req.files[i].path,{folder:`/events/${event.eventName}(${event.eventDate}/`});
                    objectPhoto.secure_url=uploading.secure_url;
                    objectPhoto.public_id=uploading.public_id;
                    array.push(objectPhoto);
                }
                await event.updateOne({$push:{eventPhotos:{$each:array}}});
        }
        data.updatedBy=req.data._id;
        // make the update now:
        const eventNew=await eventModel.findOneAndUpdate({_id:eventId},data,{new:true}).populate([{path:"addedBy"},{path:"updatedBy"}]);
        // returnt the reponse:
        return res.json({success:true,message:"the event is updatign successfully",event:eventNew});    
}
catch(err)
{
    return next(err);
}
}
// get all event with number of child and with rest number:
export const getAllEventsAndFilter=async (req,res,next)=>
{
try
{
// get filter thst can get by filter or not:
const {min,max,eventName,eventDate}=req.body;
let  events=[];
let eventsInformation=[];
// check on the probabilities:
if(eventName)
    {
        console.log("i enetr name");
      events=await eventModel.find({eventName:{$regex:eventName,$options:"i"}}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("eventName");
      // loop in all the events and get all the informaton about an number:
      for(let i=0;i<events.length;i++)
        {
           const objectInformation={};
           objectInformation.maximumCapacity=events[i].capacity;
           objectInformation.restNumber=events[i].capacity-events[i].childrens.length;
           objectInformation.theNunberOfChildrenNow=events[i].childrens.length;
           eventsInformation.push(objectInformation);
        }
        return res.json({success:true,events,eventsInformation});
    }
    // check on thr min maximum:
    if(min||max)
        {
            // this state is an 
            if(min&&max&&min>0&&max>0)
                {
                    let eventsMinMx=[];
                    events=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-craetedAt -upadtedAt");
                    
                    events.forEach((ele)=>{
                        if((ele.capacity-ele.childrens.length)>=min&&(ele.capacity-ele.childrens.length)<=max)
                            {
                                console.log("i enter this");
                               eventsMinMx.push(ele);
                               const objectInf={};
                               objectInf.maximumCapacity=ele.capacity;
                               objectInf.restNumber=ele.capacity-ele.childrens.length;
                               objectInf.theNunberOfChildrenNow=ele.childrens.length;
                               eventsInformation.push(objectInf);
                            }
                    });
                    return res.json({success:true,events:eventsMinMx,eventsInformation});
                }
                // make if the min is define
                else if(min&&max==0&&min>0)
                    {
                        let eventsMinMx=[];
                        events=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-craetedAt -upadtedAt");
                        events.forEach((ele)=>{
                            if((ele.capacity-ele.childrens.length)>=min)
                                {
                                   eventsMinMx.push(ele);
                                   const objectInf={};
                                   objectInf.maximumCapacity=ele.capacity;
                                   objectInf.restNumber=ele.capacity-ele.childrens.length;
                                   objectInf.theNunberOfChildrenNow=ele.childrens.length;
                                   eventsInformation.push(objectInf);
                                }
                        });
                        return res.json({success:true,events:eventsMinMx,eventsInformation});
                    }
                // make if the max is define:
                else if(max&&min==0&&max>0)
                    {
                        console.log("i enter this")
                        let eventsMinMx=[];
                        events=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-craetedAt -upadtedAt");
                        events.forEach((ele)=>{
                            if((ele.capacity-ele.childrens.length)<=max)
                                {
                                    console.log("the condition is true");
                                   eventsMinMx.push(ele);
                                   const objectInf={};
                                   objectInf.maximumCapacity=ele.capacity;
                                   objectInf.restNumber=ele.capacity-ele.childrens.length;
                                   objectInf.theNunberOfChildrenNow=ele.childrens.length;
                                   eventsInformation.push(objectInf);
                                }
                        });
                        return res.json({success:true,events:eventsMinMx,eventsInformation});
                    }
                    else if(min==0&&max>0)
                        {
                            let eventsMinMx=[];
                            events=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-craetedAt -upadtedAt");
                            events.forEach((ele)=>{
                                if((ele.capacity-ele.childrens)<=max)
                                    {
                                       eventsMinMx.push(ele);
                                       const objectInf={};
                                       objectInf.maximumCapacity=ele.capacity;
                                       objectInf.restNumber=ele.capacity-ele.childrens.length;
                                       objectInf.theNunberOfChildrenNow=ele.childrens.length;
                                       eventsInformation.push(objectInf);
                                    }
                            });
                            return res.json({success:true,events:eventsMinMx,eventsInformation});
                        }
                        
                    else
                    {
                    }
             
        }
        // check on the date:
        if(eventDate)
            {
                const {lessThan,greaterThan}=req.query;
                 if((lessThan=="yes"&&!greaterThan)||(lessThan=="yes"&&greaterThan=="no"))
                    {

                      let eventsDate=await eventModel.find({eventDate:{$lte:eventDate}}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("createdAt updatedAt");
                      eventsDate.forEach((ele)=>{
                       
                              
                               const objectInf={};
                               objectInf.maximumCapacity=ele.capacity;
                               objectInf.restNumber=ele.capacity-ele.childrens.length;
                               objectInf.theNunberOfChildrenNow=ele.childrens.length;
                               eventsInformation.push(objectInf);
                            
                    });
                    return res.json({success:true,events:eventsDate,eventsInformation});
                    } 
                 else if((greaterThan=="yes"&&!lessThan)||(greaterThan=="yes"&&lessThan=="no"))
                    {
               
                        let eventsDate=await eventModel.find({eventDate:{$gte:eventDate}}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("createdAt updatedAt");
                        eventsDate.forEach((ele)=>{
                         
                       
                                 const objectInf={};
                                 objectInf.maximumCapacity=ele.capacity;
                                 objectInf.restNumber=ele.capacity-ele.childrens.length;
                                 objectInf.theNunberOfChildrenNow=ele.childrens.length;
                                 eventsInformation.push(objectInf);
                              
                      });
                      return res.json({success:true,events:eventsDate,eventsInformation});
                    } 
                    else if((!greaterThan&&!lessThan)||(greaterThan=="no"&&lessThan=="no"))
                    {
                    
                        let eventsDate=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("createdAt updatedAt");
                        eventsDate.forEach((ele)=>{
                         
                             
                                 const objectInf={};
                                 objectInf.maximumCapacity=ele.capacity;
                                 objectInf.restNumber=ele.capacity-ele.childrens.length;
                                 objectInf.theNunberOfChildrenNow=ele.childrens.length;
                                 eventsInformation.push(objectInf);
                              
                      });
                      return res.json({success:true,events:eventsDate,eventsInformation});
                    }     
                    else
                    {

                    }
        }
        // if there is no filter:
        const sendFinal=await eventModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-createdAt -updatedAt");
        sendFinal.forEach((ele)=>{
            const objectInf={};
            objectInf.maximumCapacity=ele.capacity;
            objectInf.restNumber=ele.capacity-ele.childrens.length;
            objectInf.theNunberOfChildrenNow=ele.childrens.length;
            eventsInformation.push(objectInf);
         
 });
 return res.json({success:true,events:sendFinal,eventsInformation});

}
catch(err)
{
    return next(err);
}
}
// get a sp children with his all events:
export const getSpChildrenWithEvenst=async (req,res,next)=>
{
try
{
// get the if or the name of the user:
const {idOfUser,childName}=req.query;
if(childName)
    {
        const allEventsNames=await eventModel.find({}).sort("-eventDate").populate([{path:"childrens.childId",populate:[{path:"bus"},{path:"groupId"}]}]);
        let allStudents=[];
        for(let i=0;i<allEventsNames.length;i++)
            {
             // loop on each children name:
             for(let j=0;j<allEventsNames[i].childrens.length;j++)
                { 
                    if(allEventsNames[i].childrens[j].childId.childName.contains(childName))
                    {
                        allStudents.push(allEventsNames[i]); 
                    }
                }
            }
        return res.json({success:true,data:allStudents})    
    }
// check first on the name of the students:
   else if (idOfUser)
    {
        console.log(idOfUser);
        console.log("yes");
                let events=[];
        events=await eventModel.find({'childrens.childId':idOfUser}).populate([{path:"childrens.childId",populate:[{path:'groupId'},{path:"bus"}]}]).sort("-eventDate");
    return res.json({success:true,data:events});
    }
    else
    {
        let events=[];
        events=await eventModel.find().populate([{path:"childrens.childId",populate:[{path:'groupId'},{path:"bus"}]}]).sort("-eventDate");
    return res.json({success:true,data:events});
    }
}
catch(err)
{
return next(err);
}
}
// get sp event with all the information: 
export const getSpEvent=async (req,res,next)=>
{
try
{
const {eventName}=req.query;
const allEvents=await eventModel.find({eventName:{$regex:eventName,$options:"i"}}).populate({path:"childrens.childId",populate:[{path:"bus"},{path:"groupId",populate:[{path:"groupSupervisor"}]}]}).sort("eventName");
return res.json({success:true,events:allEvents});
}
catch(err)
{
    return next(err);
}
}
// this is the only api not yet complete:
// update the state of the pay for a sp student:
export const updatePayState=async(req,res,next)=>
{
try
{
    // get the child ids and the event or travel:
    const {childIds,eventId}=req.body;
    // chekc on the evnt if it exists or not:
    const event=await eventModel.findOne({_id:eventId});
    if(!event)
        {
            return next(new Error("the eventId may not treu or the event mayBe deleted"));
        }
    let afterUpdates=[];
    // check on the id's and the events if their attaend or not:
    let flagAttend=true;
    for(let i=0;i<childIds.length;i++)
        {
            const std=await eventModel.findOne({_id:eventId,'childrens.childId':childIds[i]});
            if(!std)
                {
                    flagAttend=false;
                }
        }
    if(!flagAttend)
        {
           return next(new Error("the operation not completed because there is an childIds not attend this event check the id's or chekc the eventId"));
        }
    // update the pay state fro the childs:
    for(let i=0;i<childIds.length;i++)
        {
           const userOne=await eventModel.findOneAndUpdate({_id:eventId,'childrens.childId':childIds[i]},{$set:{'childrens.$.payed':true}},{new:true}).populate([{path:"childrens.childId"}]);
           if(userOne)
            {
                afterUpdates.push(userOne);
            }
            else
            {
                return next(new Error(`the ChildId is or it may not assigned to thie travel/event or join to it`));
            }
        }
        // return the response:
        return res.json({success:true,message:"the payStete is updated sucessfully",childUpdates:afterUpdates});

}
catch(err)
{
    return next(err);
}
}
////////////////////////////////////////////////////
// get all the events to the parents:
export const getAllEvemtsForParemts=async (req,res,next)=>
{
try
{
    const {state}=req.query;
    
    const date=new Date();
    if(state=="fullCapacityReservation")
    {
        
       const  events=await  eventModel.find({eventDate:{$gt:date}}).sort("eventDate")
       const final=[];
        for(let i=0;i<events.length;i++)
            {
             if(events[i].childrens.length>=events[i].capacity)
                {
                  final.push(events[i]);
                }
            }
            return res.json({success:true,events:final});
    }
    else if(state=="elapsedTravels")
    {
    const travels=await eventModel.find({eventDate:{$lt:date}}).sort("eventDate");
    return res.json({success:true,events:travels});
    }   
    else if(state=="c")
    {
        const events=await eventModel.find({eventDate:{$gt:date}}).sort("eventDate");
        let final=[];
        for(let i=0;i<events.legnth;i++)
            {
             if(events[i].childrens.length<events[i].capacity)
                {
                    final.push(events[i]);
                } 
            }
        return res.json({success:true,events:final});
    }
    else
    {
        
        const allEvents=await eventModel.find({eventDate:{$gt:date}}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-eventDate -createdAt");
        return res.json({success:true,events:allEvents});
    }  
}
catch(err)
{
    return next(err);
}
}
// join to the event:
export const joinToEvent=async (req,res,next)=>
{
try
{
// get the id of the child first:
const {_id}=req.data;
// get the id of the event hw want to join to:
const {eventId}=req.params;
// check the event if it exists or not:
const event=await eventModel.findOne({_id:eventId});
if(!event)
    {
        return next(new Error("the event is not existss or may be deleted check the id"));
    }
    // check if the user is already joined to  the event or not:
    const userReserved=await eventModel.findOne({_id:eventId,'childrens.childId':_id});
    if(userReserved)
    {
        return next(new Error("you already reserve this event"));
    }
    // check now on the date of the event:
    const date=new Date();
    if(event.eventDate<date)
    {
        return next(new Error("the reservation of this event is already closed"));
    }
    // check if the event have availabled seats or not:
     const theNumbersOfNmbers=event.childrens.length+1;
     if(event.capacity<theNumbersOfNmbers)
        {
            return next(new Error("there is not available seats for this event/travel check the event page pemanently can a ticket deleted"));
        }
    // make the object now:
    const objectOfTicket={};
    objectOfTicket.childId=_id;
    await eventModel.updateOne({_id:eventId},{$push:{childrens:objectOfTicket}});
    // return the resposne:
    return res.json({success:true,message:"you have sucessfully reserve an seat in the event/travel"});
}
catch(err)
{
    return next(err);
}
}
// remove my reservation from the travel or the event:
export const removeMyReservation=async (req,res,next)=>
{
   try
   {
    const {eventId}=req.params;
    console.log(eventId);
  
    // get the id of the user:
    const {_id}=req.data;
    console.log(_id);
    // check if the event first is exists:
    const event=await eventModel.findOne({_id:eventId});
    if(!event)
        {
            return next(new Error("the event Id maay be not true or the event is deleted check the id of the event please"));
        }

        const userIn=await eventModel.findOne({_id:eventId,'childrens.childId':_id});
        console.log(userIn);
        if(!userIn)
            {
                return next(new Error("the user is not join to this event or travel"));
            }
        // check on the date of the event:
        const date=new Date();
        if(date>event.eventDate)
            {
                return next("you can't remove your ticket from an elasped travel(event)");
            }    
            // remove the ticket fro the event:
            await eventModel.updateOne({_id:eventId,'childrens.childId':_id},{$pull:{childrens:{childId:_id}}});
            // return the response:
            return res.json({success:true,message:"the ticket is sucessfully deleted"});
   }
   catch(err)
   {
    return next(err);
   }
}
// get all thee events i attended:
export const getMyAttendedEvents=async (req,res,next)=>
{
try
{
// get the event the user attended:
const {_id}=req.data;
// then make the query the user can  make:
const events=await eventModel.find({'childrens.childId':{$in:[_id]}}).populate([{path:"addedBy"},{path:"updatedBy"}]).sort("-eventDate");
// return the resposne:
return res.json({success:true,events});
}
catch(err)
{
    return next(err);
}
}