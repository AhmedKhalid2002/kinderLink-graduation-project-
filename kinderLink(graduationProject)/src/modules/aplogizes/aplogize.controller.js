import aplogizeModel from "../../../db/models/apologises/apologiizes.model.js";
import busModel from "../../../db/models/bus/bus.model.js";
import childrenModel from "../../../db/models/children/children.model.js";
import groupModel from "../../../db/models/groups/groups.model.js";
import moment from 'moment-timezone';
// add the aplogize by the children:
export const addApollogize=async (req,res,next)=>
{
    try
    {
        // Get the id of the user
        const { _id } = req.data;
        
        // Check if the child is in a group first and the group is already in bus
        const child = await childrenModel.findOne({ _id });
        if (!child) {
            return next("There is no child exists by this ID or the account of the child may be deleted");
        }
        if (!child.busService) {
            return next(new Error("You are not joined to the bus service"));
        }
        if (!child.bus) {
            return next(new Error("The child is not in bus, they can't make an apology"));
        }
        
        // Get the data of the apologize now
        const { dateOfAbsence } = req.body;
        let allDataApologize = req.body;
        
        // Parse the date input using moment.js to handle flexible formats
        const newDate = moment.tz(dateOfAbsence, ['YYYY-MM-DD', 'YYYY-M-D', 'MM/DD/YYYY', 'M/D/YYYY', 'YYYYMMDD', 'M.D.YYYY'], 'UTC').startOf('day');
        
        if (!newDate.isValid()) {
            return next(new Error("Invalid date format. Please use a valid date format."));
        }
        
        // Check on the date
        const dateNow = moment().tz('UTC').startOf('day');
        
        if (newDate.year() !== dateNow.year()) {
            return next(new Error(`The year must be the current year ${dateNow.year()}`));
        }
        
        if (newDate.month() !== dateNow.month()) {
            return next(new Error("The month you enter must be the current month or if you want to make an apology for the next day, it must be done before 7 AM but must be in the current month"));
        }
        
        if (newDate.date() === dateNow.date()) {
            if (moment().tz('UTC').hours() >= 7) {
                return next(new Error("You must make the apology for today before 7 AM"));
            }
        } else if (newDate.date() !== dateNow.add(1, 'day').date()) {
            return next(new Error("The apology must be created for today or for tomorrow only"));
        }
        
        // Check if the user already has an apology for this date
        const userApology = await aplogizeModel.findOne({ from: _id, dateOfAbsence: newDate.toDate() });
        
        if (userApology) {
            return next(new Error("Sorry, you can't make more than one apology on the same day"));
        }
        
        // Add the ID of the user who added this
        allDataApologize.from = _id;
        allDataApologize.timeOfAplogize = moment().tz('UTC').format('HH:mm:ss');
        allDataApologize.dateOfAbsence = newDate.toDate();
        
        // Save the data document in the db
        await aplogizeModel.create(allDataApologize);
        
        // Return the response
        const allApologizeUsers = await aplogizeModel.find({ from: _id }).sort("-createdAt");
        
        // Return the response
        return res.json({ success: true, message: "The apology is added successfully", allChildApologize: allApologizeUsers });
        
        
    }
    catch(err)
    {
        return next(err);
    }
}
// update apologize:
export const updateApologize=async (req,res,next)=>
{
try
{
// get the id of the user:
const {_id}=req.data;
// get the id of the apologize:
const {apId}=req.params;

const apologize=await aplogizeModel.findOne({_id:apId});
// chekc if the user and the apologize that have this apologize:
if(!apologize)
{
    return next(new Error("the apologizeId is not exists or the apologize may be deleted"));
}
if(apologize.from.toString()!=_id.toString())
{
    return next(new Error("youy are not the owner of this apologize the owner only who make the aplogize is resposible for it"));
}
// seen state:
if(apologize.seen)
    {
        return next(new Error("sorry you can't update the aplogizes afetr it seen by the busSupervisor"));
    }
//heck if the aplogizes after the day or not:
const date=new Date();
if(apologize.dateOfAbsence<date)
    {
        return next(new Error("you can't upadte the aplogize afetr the day of aplogize"));
    }
// get the apologize data:
const {reasonForAbsence}=req.body;
apologize.reasonForAbsence=reasonForAbsence;
await apologize.save();
const apNew=await aplogizeModel.findOne({_id:apId});
// then returntthe resposne:
return res.json({success:true,message:"the apologize is updated sucessfully",apologizeAfterUpdate:apNew});

}
catch(err)
{
    return next(err);
}
}
// delete apologize:
export const deleteApologize=async (req,res,next)=>
{
try
{
    //get the id of apologize:
    const {apId}=req.params;
    const apologize=await aplogizeModel.findOne({_id:apId});
    // get the id of the user:
    const {_id}=req.data;
    if(!apologize)
    {
        return next(new Error("the apoogize is not exists or the id is not correct or the it may delete"));
    }
    if(apologize.from.toString()!=_id.toString())
    {
        return next(new Error("you are not the owner of this apologize the owner only have the aauthority"));
    }
    if(apologize.seen==true)
    {
        return next(new Error("the apologize can't be deleted after it seen by the busSuperviosr"));
    }
    // make the query:
    await apologize.deleteOne();
    // get all the apologizes:
    const allAp=await aplogizeModel.find({from:_id}).sort("-createdAt");
    // return the resposne:
    return res.json({success:true,message:"the apologize is deleted successfully",userApologizes:allAp});
}
catch(err)
{
    return next(err);
}
}
// get all user Apologize:
export const getAllApologizes=async (req,res,next)=>
{
    try
    {
       // get the id of th user:
       const {_id}=req.data;
       // get all the apologizes of the childene:
       const apologizes=await aplogizeModel.find({from:_id}).sort("-createdAt")
       // returnt the response:
       return res.json({success:true,apologizes});
    }
    catch(err)
    {
        return next(err);
    }
}
// test this api's:
export const getAplogizesForBusSupervisor=async (req,res,next)=>
{
try
{
    // Get the id of the busSupervisor first
    const { _id } = req.data;
    const AllAblogizes = [];
    
    // Check if the bus has a supervisor now or not
    const empBus = await busModel.findOne({ busSupervisor: _id });
    if (!empBus) {
        return next(new Error("You are not joined as a bus supervisor already"));
    }
    
    // Get all the children assigned to the bus
    const children = await childrenModel.find({ bus: empBus._id });
    const allChildrenIds = children.map(child => child._id);
    
    // Check if the supervisor wants to get apologies for a specific date
    const { dateOfAbsence } = req.query;
    
    if (dateOfAbsence) {
        const parsedDate = moment.tz(dateOfAbsence, 'UTC').startOf('day');
    
        if (!parsedDate.isValid()) {
            return next(new Error("Invalid date format. Please use a valid date format."));
        }
    
        const formattedDate = parsedDate.toDate();
    
        // Fetch apologies for the specific date
        const allAplogizes = await aplogizeModel.find({
            from: { $in: allChildrenIds },
            dateOfAbsence: formattedDate
        }).populate([{ path: "from" }]).sort("-createdAt -updatedAt");
    
        // Separate seen and unseen apologies
        const AllTheSeen = [];
        const allNotSeen = [];
        for (let i = 0; i < allAplogizes.length; i++) {
            if (allAplogizes[i].seen) {
                AllTheSeen.push(allAplogizes[i]);
            } else {
                allNotSeen.push(allAplogizes[i]);
            }
        }
    
        // Return the response
        return res.json({
            success: true,
            allAplogizes: allAplogizes,
            lengthOfAllAplogizes: allAplogizes.length,
            allNotSeenAplogizes: allNotSeen,
            lengthOfNotSeen: allNotSeen.length,
            allSeen: AllTheSeen,
            NumberOfSeenAplogizes: AllTheSeen.length
        });
    }
    
    // Fetch all apologies if no specific date is provided
    const allAplogizes = await aplogizeModel.find({
        from: { $in: allChildrenIds }
    }).populate([{ path: "from" }]).sort("-createdAt -updatedAt");
    
    // Separate seen and unseen apologies
    const AllTheSeen = [];
    const allNotSeen = [];
    for (let i = 0; i < allAplogizes.length; i++) {
        if (allAplogizes[i].seen) {
            AllTheSeen.push(allAplogizes[i]);
        } else {
            allNotSeen.push(allAplogizes[i]);
        }
    }
    
    // Return the response
    return res.json({
        success: true,
        allAplogizes: allAplogizes,
        lengthOfAllAplogizes: allAplogizes.length,
        allNotSeenAplogizes: allNotSeen,
        lengthOfNotSeen: allNotSeen.length,
        allSeen: AllTheSeen,
        NumberOfSeenAplogizes: AllTheSeen.length
    });
    
    
}
catch(err)
{
    return next(err);
}
}
export const getSpecieficStudentAplogizeForBusSupervisor=async (req,res,next)=>
{
try
{
 // get the id of the busSupervispr:
 const {_id}=req.data;
 const busSupervisor=await busModel.findOne({busSupervisor:_id});
 if(!busSupervisor)
    {
        return next(new Error("the busSperviosr is not assigned to  any bus yet"));
    }
 // hcekc on the bus and the children:
 const {childId}=req.query;
 const child=await childrenModel.findOne({_id:childId});
 if(!child)
    {
        return next(new Error("there is no child by this id or the child with this id may be deleted"));
    }   
 if(child.bus.toString()!=busSupervisor._id.toString())
    {
        return next(new Error("this child is not in your bus"));
    }
    // get all the aplogizes for this user:
    const allAplogizes=await aplogizeModel.find({from:child._id}).populate([{path:"from"}]).sort("-createdAt -updatedAt");
    // get the seen and get the not seen:
    const allseen=[];
    const getNotSeen=[];
    allAplogizes.forEach((ele)=>{
        if(ele.seen)
            {
               allseen.push(ele);
            }
            else
            {
              getNotSeen.push(ele);
            }
    })
    // return the response:
    return res.json({success:true,allAplogizes:allAplogizes,numberOfAllAplogizes:allAplogizes.length,allAplogizesSeen:allseen,numberOfAllSeen:allseen.length,allNotSeen:getNotSeen,numberOfAllNotSeen:getNotSeen.length});
}
catch(err)
{
    return next(err);
}
}
export const upadateSeenAplogizesState=async (req,res,next)=>
{
try
{
// cosnt get the aplogizes :
const {apologizesId}=req.body;
const afterUpdates=[];
// loops in aplogizes:
if(apologizesId.length<1)
{
    return next(new Error("the update  aplogizes must be at least one aplogize"));
}
for(let i=0;i<apologizesId.length;i++)
{
    const aplogizesUpdates=await aplogizeModel.findOneAndUpdate({_id:apologizesId[i]},{seen:true});
    if(!aplogizesUpdates)
    {
        return next(new Error(`the aplogize with th id ${apologizesId[i]} not exists or may be deleted`));
    }
    afterUpdates.push(aplogizesUpdates);
}
// return the response:
return res.json({success:true,message:"the aplogizes states is updated sucesfully",aploizesAfterUpdates:afterUpdates});
}
catch(err)
{
    return next(err);
}
}
