import busModel from "../../../db/models/bus/bus.model.js";
import childrenModel from "../../../db/models/children/children.model.js";
import empModel from "../../../db/models/employees/employess.model.js";
import groupModel from "../../../db/models/groups/groups.model.js";
import sendingEmail from "../../utils/sendingEmails.js";
export const getFreeSuperviosrs=async  (req,res,next)=>
{
try
{
// get all bus superviosrs and check on each bus superviosrs which not assigned to bus yet:
console.log("fsfsfs");
const busSuperviosors=[];
const {busSuperviosrName}=req.query;
console.log(busSuperviosrName);
console.log(busSuperviosrName.length);
if(busSuperviosrName&&busSuperviosrName.length>0)
    {
         const allSuperviosrs=await empModel.find({isActivated:true,name:{$regex:busSuperviosrName,$options:"i"},role:"busSupervisor"}).sort("name");
         console.log(busSuperviosrName);
         console.log(allSuperviosrs);
         // loop in each bussupervoors:
         for(let i=0;i<allSuperviosrs.length;i++)
            {
                const busSup=await busModel.findOne({busSupervisor:allSuperviosrs[i]._id});
                if(!busSup)
                    {
                        busSuperviosors.push(allSuperviosrs[i]);
                    }
            }
            // return the response:
            return res.json({success:true,busSuperviosors});
    }
// hceck n eeach bus superviosrs that not assign to bus:
else
{
    const allBusSuperviosrs=await empModel.find({isActivated:true,role:'busSupervisor'}).sort("name")
for(let i=0;i<allBusSuperviosrs.length;i++)
    {
        const busSupervi=await busModel.findOne({busSupervisor:allBusSuperviosrs[i]._id});
        if(!busSupervi)
            {
                busSuperviosors.push(allBusSuperviosrs[i]);
            }
    }
    // returnt the resposne:
    return res.json({success:true,busSuperviosors});
}
}
catch(err)
{
    return next(err);
}
}
// get all the children by multi methods:
export const getAllFreeChildren=async (req,res,next)=>
{
    try
    {
        const {childName,groupName}=req.query;
        if(childName&&childName.length>0)
        {
          // get all the childen by this name :
          const allChildren=await childrenModel.find({bus:null,busService:true,childName:{$regex:childName,$options:"i"}}).populate([{path:"groupId",populate:[{path:"groupSupervisor"}]}]).sort("childName");
          // return the response:
          return res.json({success:true,allChildren})
        }
        else if(groupName&&groupName.length>0)
        {
            const allChildren=[];
            console.log("i entred that");
            console.log(groupName);
            // get all the the children by name:
            const getAllGroupsFirst=await groupModel.find({groupName:{$regex:groupName,$options:"i"}}).sort("groupName");
            // get all the children in each group:
            console.log(getAllGroupsFirst);
            for(let i=0;i<getAllGroupsFirst.length;i++)
            {
                
                const childrenGroup=await childrenModel.find({groupId:getAllGroupsFirst[i]._id,busService:true,bus:null}).populate([{path:"groupId",populate:[{path:"groupSupervisor"}]}]).sort("childName");
                allChildren.push(...childrenGroup);
            }
           // returnt the resposne:
           return res.json({success:true,allChildren})
        }
         else
        {
            // get all free children:
             const allChildren=await childrenModel.find({busService:true,bus:null}).sort("childName");
             // return gth eresponse:
              return res.json({success:true,allChildren});
        }   
    }
    catch(err)
    {
        return next(err);
    }
}
// create the bus:
export const createBus=async (req,res,next)=>
{
try
{
 // get the data of the bus and chekc on the data:
 const busData=req.body;
 const {busName,busSupervisor}=req.body;
 const busNameCheck=await busModel.findOne({busName});
 if(busNameCheck)
    {
        return next(new Error("the busName is already exixsts please change it"));
    }
 const busSupervisorCheck=await empModel.findOne({_id:busSupervisor});
 if(!busSupervisorCheck)
    {
        return next(new Error("this busSupervisor is not exists the id is wrong or the this employee may be deleted"));
    }
 if(busSupervisorCheck.role!='busSupervisor')
    {
        return next(new Error("the role of this employee is not busSupervisor check the employeeId"));
    }
 const bus=await busModel.findOne({busSupervisor});
 if(bus)
    {
        return next(new Error("the busSupervisor is already assigned to a bus"));
    }
 // get the data of the added by:
    const {_id}=req.data;
    busData.addedBy=_id;
 // save the document:
    await busModel.create(busData);
 // send emai to the:
 const sendingEM=await sendingEmail({to:busSupervisorCheck.email,subject:"YOUR BUS",text:"this email sended to you to tell you about your bus",html:`<div style='color:red;background-color:black;'><h2>bus Name:</h2><h1>${busData.busName}</h1><h2>bus Number:</h2><h1>${busData.busNumber}</h1></div>`});
 if(!sendingEM)
    {
        return next(new Error("the connection to internet may be instable or the email is inValid"));
    }
    const allBuses=await busModel.find({}).populate([{path:"busSupervisor"},{path:"addedBy"}]).sort('busName');
 // return the response:
 return res.json({success:true,message:"the bus is addded sucessfully",allBuses});
 // 
}
catch(err)
{
return next(err);
}
}
export const updateBus=async (req,res,next)=>
{
try
{
// et the id of the bus and check on it:
const busData=req.body;
const {busId}=req.params;
const {busSupervisor}=req.body;
const bus=await busModel.findOne({_id:busId});
if(!bus)
    {
        return next(new Error("the bus is not exists check the id or may be deleted"));
    }
if(busData.busSupervisor)
    {
      var superviosr=await empModel.findOne({_id:busSupervisor});
      if(!superviosr)
        {
            return next(new Error("the suoervisor is not exists please check the id or the employee may be deleted"));
        }
      if(superviosr.role!='busSupervisor')
        {
            return next(new Error("the role of the employee not busSupervispor check the id of the employee"));
        }
        const newBus=await busModel.findOneAndUpdate({busSupervisor:superviosr._id},{busSupervisor:null});
    }
// get the data of update snd check if the bussupervisor is will updte:
const {_id}=req.data;
busData.updatedBy=_id;
const newbus=await busModel.findOneAndUpdate({_id:bus._id},busData,{new:true}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"busSupervisor"}]);
if(busSupervisor)
    {
        const sendingEmailg=await sendingEmail({to:superviosr.email,subject:"your bus",text:"this is your bus",html:`<div style='color:red;background-color:black;'><h2>bus name:</h2><h1>${newbus.busName}</h1><h2>bus number:</h2><h1>${newbus.busNumber}</h1></div>`});
        if(!sendingEmailg)
            {
                return next(new Error("the intrenetconnection is not stable or the email is not valid"));
            }
    }
// send the resposne:
return res.json({success:true,message:"the bus is updated sucessfully",bus:newbus});
}
catch(err)
{
    return next(err);
}
}
// delete the bus:
export const deleteBus=async (req,res,next)=>
{
try
{
// get the id of the bus:
const {busId}=req.params;
const bus=await busModel.findOne({_id:busId});
if(!bus)
    {
        return next(new Error("the bus is not exists the id may be worng or the bus may be deleted"));
    }
  await busModel.deleteOne({_id:busId});
  // make all the buses in children which in this bus to null:
  await childrenModel.updateMany({bus:bus._id},{bus:null});
  // get all the buses now:
  const buses=await busModel.find().populate([{path:"addedBy"},{path:"updatedBy"},{path:"busSupervisor"}]).sort("busName");
  // return the resposn:
  return res.json({success:true,message:"the bus is deleted sucessfully",buses});
}
catch(err)
{
    return next(err);
}
}
// assign children to the bus:
export const assignChildrenController=async (req,res,next)=>
{
try
{
const {busId}=req.params;
// check ont he bus first:
const bus=await busModel.findOne({_id:busId});
if(!bus)
    {
        return next(new Error("the bus is not exists check the id of bus or the bus you asked may be deleted"));
    }
// get the children
const {children}=req.body;
const busChildren=await childrenModel.find({bus:bus._id});
const lengthOfBusNow=busChildren.length;
const addedLength=lengthOfBusNow+children.length;
const restInBus=bus.capacity-lengthOfBusNow;
if(addedLength>bus.capacity||children.length>restInBus)
    {
       return next(new Error(`sorry we can't added the children beacuse the rest seats in the bus is ${restInBus} ans the number of children you want to assgin to bus is ${children.length}`));
    }
// loops in each studnet:
for(let i=0;i<children.length;i++)
    {
        const child=await childrenModel.findOne({_id:children[i]});
        if(!child)
            {
                return next(new Error(`the children with id ${children[i]} is not exists please  check the id or the child may be deleted`));
            }
        if(!child.busService)
            {
                return next(new Error(`the child with id ${child._id} is not waant to join bus service`));
            }
        if(child.bus)
            {
                return next(new Error(`the child with id ${child._id} is already assigned to bus`));
            }
        child.bus=bus._id;
        await  child.save();
    }  
    return res.json({success:true,message:"the children is assigned tot he bus sucessfully",theRestSeatsInBus:bus.capacity-(children.length+lengthOfBusNow),maximumCapacityOfBus:bus.capacity,numberOfchildrenNowInBus:lengthOfBusNow+children.length});     
}
catch(err)
{
return next(err);
}
}
// remove children from the bus:
export const removeChildren=async (req,res,next)=>
{
try
{
    // check on the id of the bus:
    const {busId}=req.params;
    const bus=await busModel.findOne({_id:busId});
    if(!bus)
        {
            return next(new Error("the busId is not exists check the id of the bus or the bus may be deleted"));
        }
    //check on the children first:
    const {children}=req.body;
    
    // loops on the children:
    
    for(let i=0;i<children.length;i++)
        {
            const child=await childrenModel.findOne({_id:children[i]});
            if(!child)
            {
               return next(new Error(`the child with thwe id ${children[i]} is not exists or the childProfile may be deleted`));
            }
            console.log("yes");
            if(child.bus.toString()!=bus._id)
                {
                    return next(new Error(`the child with id ${child[i]} is not assigned to this bus can't remove aonther bus`));
                }
            child.bus=null;
            await child.save();

        }
    const childrenInBus=await childrenModel.find({bus:bus._id});
    const theRest=bus.capacity-childrenInBus.length;
    return res.json({success:true,message:"the children is removed sucessfully fro the bus",maximumCapacityOfBus:bus.capacity,theRestSeatsInBus:theRest,numberOfchildrenNowInBus:childrenInBus.length});   
}
catch(err)
{
    return next(err);
}
}
// get all ther buses:
export const getAllBuses=async (req,res,next)=>
{
try
{
    const allBuses=await busModel.find({}).populate([{path:"busSupervisor"},{path:"addedBy"},{path:"updatedBy"}]).sort("busName");
    const buses=[];
    const busSeatsInformation=[];
    // looops on each bus:
    for(let i=0;i<allBuses.length;i++)
        {
            let  object={};
            const childrenInBus=await childrenModel.find({bus:allBuses[i]._id});
            object.theRestSeats=allBuses[i].capacity-childrenInBus.length;
            object.numberOfChildrenInBus=childrenInBus.length;
            object.children=childrenInBus;
            busSeatsInformation.push(object);
        }
        return res.json({success:true,allbuses:allBuses,busSeatsInformation});
}
catch(err)
{
    return next(err);
}
}
// get a sp bus:
export const getSpBus=async (req,res,next)=>
{
try
{
const {busId}=req.params;
const bus=await busModel.findOne({_id:busId}).populate([{path:"children"},{path:"addedBy"},{path:"updatedBy"},{path:"busSupervisor"}]);
const theRestInbuses=bus.capacity-bus.children.length;
const theNumberOfChildrenInBus=bus.children.length;
// returtn the respose:
return res.json({success:true,bus,theRestInbuses,theNumberOfChildrenInBus});
}
catch(err)
{
return next(err);
}
}
// remove the busSuperviosr from bus:
export const removeBusSupervisor=async (req,res,next)=>
{
try
{
    const {busId}=req.params;
    const bus=await busModel.findOne({_id:busId});
    if(!bus)
        {
            return next(new Error("the bus is not exists orm the bus may be deleted"));
        }
        if(!bus.busSupervisor)
        {
            return next(new Error("the bus is already not assign to any busSupervisor"));
        }
        console.log("ahmed");
        bus.busSupervisor=null;
        await bus.save();
        const newBus=await busModel.findOne({_id:busId}).populate([{path:"busSupervisor"},{path:"addedBy"},{path:"updatedBy"},{path:"busSupervisor"},{path:"children"}]);
        const theRestSeatsInBus=newBus.capacity-newBus.children.length;
        const theNumberOfChildrenNowInBus=newBus.children.length;
        return res.json({success:true,message:"busSuperviosr is removed sucessfully",bus:newBus,theRestSeatsInBus,theNumberOfChildrenNowInBus});
}
catch(err)
{
    return next(err);
}
}
// filter by name and by the free minimu and maximum capacity of the buses to get the bus not chilren:
export const getFilter= async(req,res,next)=>
{
try
{
let {name,seats,min,max}=req.query;
if(name)
    { 
         if(name.length>0)
            {
             const buses=await busModel.find({busName:{$regex:name,$options:"i"}}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
             const informationsAboutSeatsInEachBus=[];
             console.log("name",name);
             for(let i=0;i<buses.length;i++)
                {
                    const childrenBus=await childrenModel.find({bus:buses[i]._id});
                    let object={};
                    object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                    object.numberOfReservedSeats=childrenBus.length;
                    object.maximumCapacity=buses[i].capacity;
                    informationsAboutSeatsInEachBus.push(object);
                }
                return res.json({success:true,buses,informationsAboutSeatsInEachBus});
            }
            else{
                const informationsAboutSeatsInEachBus=[];
              const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                for(let i=0;i<buses.length;i++)
                    {
                        const childrenBus=await childrenModel.find({bus:buses[i]._id});
                        let object={};
                        object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                        object.numberOfReservedSeats=childrenBus.length;
                        object.maximumCapacity=buses[i].capacity;
                        informationsAboutSeatsInEachBus.push(object);
                    }
                    return res.json({success:true,buses,informationsAboutSeatsInEachBus});
             }
    }
    if(seats)
        {
            seats=+seats;
            if(seats>0)
            {
               if((min!="yes"||min!="no"&&!max)&&(max!="yes"||max!="no"&&!min))
                {
                    return next(new Error("the value of the min and max must be yes or no or it may be empty"));
                }
                if(min=="yes"&&max=="yes")
                    {
                        return next(new Error("you can't choose min and max at the same time please check one of them if you want"))
                    }
                if(!min&&!max)
                    {
                        const informationsAboutSeatsInEachBus=[];
                        let array=[];
                        const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                          for(let i=0;i<buses.length;i++)
                              {
                                  const childrenBus=await childrenModel.find({bus:buses[i]._id});
                                  if((buses[i].capacity-childrenBus.length)==seats)
                                    {
                                        let object={};
                                        array.push(buses[i]);
                                        object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                                        object.numberOfReservedSeats=childrenBus.length;
                                        object.maximumCapacity=buses[i].capacity;
                                        informationsAboutSeatsInEachBus.push(object);
                                    }
                                    else
                                    {
                                        continue;
                                    }
                              }
                              return res.json({success:true,buses:array,informationsAboutSeatsInEachBus}); 
                    }
                    
                    if(min=="yes")
                        {
                            const informationsAboutSeatsInEachBus=[];
                            const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                            let array=[];
                            console.log("yes");
                              for(let i=0;i<buses.length;i++)
                                  {
                                    console.log("i enter the loop now")
                                      const childrenBus=await childrenModel.find({bus:buses[i]._id});
                                      const dif=childrenBus.length-buses[i].capacity
                                      if(buses[i].capacity-childrenBus.length>=seats)
                                        {
                                            console.log("yes in the loop");
                                            array.push(buses[i]);
                                            let object={};
                                            object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                                            object.numberOfReservedSeats=childrenBus.length;
                                            object.maximumCapacity=buses[i].capacity;
                                            informationsAboutSeatsInEachBus.push(object);
                                        }
                                        else
                                        {
                                            continue;
                                        }
                                  }
                                  return res.json({success:true,buses:array,informationsAboutSeatsInEachBus});
                        }
                        if(max=="yes")
                            {
                                const informationsAboutSeatsInEachBus=[];
                                let array=[];
                                const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                                  for(let i=0;i<buses.length;i++)
                                      {
                                          const childrenBus=await childrenModel.find({bus:buses[i]._id});
                                          if((buses[i].capacity-childrenBus.length)<=seats)
                                            {
                                                let object={};
                                                array.push(buses[i]);
                                                object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                                                object.numberOfReservedSeats=childrenBus.length;
                                                object.maximumCapacity=buses[i].capacity;
                                                informationsAboutSeatsInEachBus.push(object);
                                            }
                                            else
                                            {
                                                continue;
                                            }
                                      }
                                      return res.json({success:true,buses:array,informationsAboutSeatsInEachBus});
                            }
                            if(min=="no"&&max=="no")
                                {
                                    const informationsAboutSeatsInEachBus=[];
                                    let array=[];
                                    const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                                      for(let i=0;i<buses.length;i++)
                                          {
                                              const childrenBus=await childrenModel.find({bus:buses[i]._id});
                                              if((buses[i].capacity-childrenBus.length)==seats)
                                                {
                                                    let object={};
                                                    array.push(buses[i]);
                                                    object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                                                    object.numberOfReservedSeats=childrenBus.length;
                                                    object.maximumCapacity=buses[i].capacity;
                                                    informationsAboutSeatsInEachBus.push(object);
                                                }
                                                else
                                                {
                                                    continue;
                                                }
                                          }
                                          return res.json({success:true,buses:array,informationsAboutSeatsInEachBus}); 
                                }
                            
            }
            else 
            {
                const finalBuses=[];
              const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
                for(let i=0;i<buses.length;i++)
                    {
                        const childrenBus=await childrenModel.find({bus:buses[i]._id});
                        let object={...childrenBus};
                        object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                        object.numberOfReservedSeats=childrenBus.length;
                        finalBuses.push(object);
                    }
                    return res.json({success:true,buses:finalBuses});
            }
        }
        const informationsAboutSeatsInEachBus=[];
        const  buses=await busModel.find({}).populate([{path:"addedBy"},{path:"updatedBy"},{path:"children"}]).sort("busName");
          for(let i=0;i<buses.length;i++)
              {
                  const childrenBus=await childrenModel.find({bus:buses[i]._id});
                  let object={};
                  object.numberAvailableSeats=buses[i].capacity-childrenBus.length;
                  object.numberOfReservedSeats=childrenBus.length;
                  object.maximumCapacity=buses[i].capacity;
                  informationsAboutSeatsInEachBus.push(object);
              }
              return res.json({success:true,buses,informationsAboutSeatsInEachBus});
}
catch(err)
{
    return next(err);
}
}
