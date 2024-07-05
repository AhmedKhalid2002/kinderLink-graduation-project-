import childrenModel from "../../../db/models/children/children.model.js";
import groupModel from "../../../db/models/groups/groups.model.js";
import mealsModel from "../../../db/models/meals/meals.model.js";
import cloudinary from "../../utils/cliudinaryConfig.js";
import getWeekStart from "../../utils/datefunction.js";
import { updateData } from "../groups/groups.schema.js";

// add mealsConreoller:
export const addMeal=async (req,res,next)=>
{
try
{
// get the id of the admin:
const {_id}=req.data;
// get the data of meals:
const mealData=req.body;
// check if the weight have the gm or not:
if(!mealData.weight.includes("gm"))
    {
        mealData.weight=`${mealData.weight}gm`;
    }
// check on the photos of the meals:
let mealImages=[];
if(req.files.length>0)
    {
        // lop on the array:
        for(let i=0;i<req.files.length;i++)
            {
                const mealObject={};
                const sendingPhoto=await cloudinary.uploader.upload(req.files[i].path,{folder:`/meals/${mealData.mealName}/`});
                mealObject.public_id=sendingPhoto.public_id;
                mealObject.secure_url=sendingPhoto.secure_url;
                mealImages.push(mealObject);
            }
     mealData.mealImages=mealImages;      
    }
// parsing the mealIngredients into an array:s
const newMailIngredients=JSON.parse(mealData.mealsIngredients);
mealData.mealsIngredients=newMailIngredients;
// add the of the user as an field then check:
mealData.addedBy=_id;
// add the meal:
await mealsModel.create(mealData);
// get the added meal:
const getTheAddedMeal=await mealsModel.findOne({mealName:mealData.mealName}).populate([{path:"addedBy",select:"-password"}]);
const allmeals=await mealsModel.find().populate([{path:"addedBy",select:"-password"}]).sort("-createdAt -updatedAt");
// send the notifications:
// return the response:
return res.json({success:true,message:"the meal is added successfully",addedMeal:getTheAddedMeal,allMeals:allmeals});
}
catch(err)
{
    return next(err);
}
}
// update the data of the meal:
export const updateMeal=async  (req,res,next)=>
{
try
{
// get the id of the meal and  check on it:
const {mealId}=req.params;
const meals=await mealsModel.findOne({_id:mealId});
if(!meals)
    {
        return next(new Error("the meal is not exists check the id "));
    }
// get the data that will update:
const updatedData=req.body;
// check on the mealsIngredients:
if(updatedData.mealsIngredients)
    {
        updatedData.mealsIngredients=JSON.parse(updatedData.mealsIngredients);
    }  
// check on the if the meal have weight:
if(updatedData.weight)
    {
        if(!updateData.weight.includes("gm"))
            {
        updatedData.weight=`${updatedData.weight}gm`;
            }
            else
            {

            }
    }    
// heck on the mealImages:
if(req.files.length>0)
    {
            if(meals.mealImages.length>0)
            {
              // we will  push the new photos:
              var newArray1=[];
              for(let i=0;i<req.files.length;i++)
                {
                    let objectImages={};
                    const uplodingFile=await cloudinary.uploader.upload(req.files[i].path,{folder:`/meals/${meals.mealName}/`});
                    objectImages.secure_url=uplodingFile.secure_url;
                    objectImages.public_id=uplodingFile.public_id;
                    newArray1.push(objectImages);
                }
                const updatingImages=await mealsModel.findOneAndUpdate({_id:mealId},{$push:{mealImages:{$each:newArray1}}},{new:true});        
            }
            else
            {
                // we will add the new photo only:
                  // we will  push the new photos:
              var newArray2=[];
              for(let i=0;i<req.files.length;i++)
                {
                    let objectImages={};
                    const uplodingFile=await cloudinary.uploader.upload(req.files[i].path,{folder:`/meals/${meals.mealName}/`});
                    objectImages.secure_url=uplodingFile.secure_url;
                    objectImages.public_id=uplodingFile.public_id;
                    newArray2.push(objectImages);
                }
                updatedData.mealImages=newArray2;
            }
    }
// upadte the data:
const newMealF=await mealsModel.findOneAndUpdate({_id:mealId},updatedData,{new:true});
// send the response:
return res.json({success:true,message:"the meal is updated successfully",meal:newMealF});
}
catch(err)
{
    return next(err);
}
}
// delete the meal:
export const deleteMeal=async (req,res,next)=>
{
    try
    {
        const {mealId}=req.params;
        const meal=await mealsModel.findOne({_id:mealId});
        if(!meal)
            {
                return next(new Error("the meal is not exists or the meal id is not true or this meal may be deleted"));
            }
        await meal.deleteOne();
        const allMeals=await mealsModel.find().populate([{path:"addedBy",}]).sort("-createdAt -updatedAt");
        // return the response:
        return res.json({success:true,message:"the meal is deleted successfully",allMeals});
    }
    catch(err)
    {
        return next(err);
    }
}    
export const getAllIngredients=async (req,res,next)=>
{
try
{
// egt the ingredients of all meals:
const allMeals=await mealsModel.find();
// then lopp on each meal and get here ingredients:
   let allIngreaidemts=[]; 
   allMeals.forEach((ele)=>{
    const {mealsIngredients}=ele;
    allIngreaidemts.push(...mealsIngredients)
   });
   const final=new Set(allIngreaidemts);
   console.log(final);
   console.log(allIngreaidemts)
   // return the response :
   return res.json({success:true,allIngredients:[...final]});
}
catch(err)
{
    return next(err);
}
}
// get all meals:
export const getAllMealsOrGetByFilter=async (req,res,next)=>
{
try
{
 
let  meals;
console.log("yess");
// check onthe array filters first:
const {mealName,mealIngredients}=req.query;
// fisrt check if the name is exists:
if(mealName)
    {
        console.log("yes it")
            if(mealName.length>0)
            {
            meals=await mealsModel.find({mealName:{$regex:mealName,$options:"i"}}).populate([{path:"addedBy"}]).sort("-createdAt -updatedAt");
            }
            else
            {

            }
    }
else if(mealIngredients)
    {
        console.log("yes");
        if(mealIngredients.length>0)
            {
                console.log(JSON.parse(mealIngredients));
            meals=await mealsModel.find({mealsIngredients:{$all:JSON.parse(mealIngredients)}}).populate([{path:"addedBy"}]).sort("-createdAt -updatedAt");
            }
            else
            {

            }
    }
    else 
    {
      meals=await mealsModel.find({}).populate([{path:"addedBy"}]).sort("-createdAt -updatedAt");
    }
    // return the response:
    return res.json({success:true,meals})
}
catch(err)
{
    return next(err);
}
}
// get sp meal:
export const spMeal=async (req,res,next)=>
{
try
{
const {mealId}=req.params;
const meal=await mealsModel.findOne({_id:mealId}).populate([{path:"addedBy"}]);
if(!meal)
    {
        return next(new Error("the email is not exists check the id of the meal"));
    }
// return the response:
return res.json({success:true,meal});
}
catch(err)
{
    return next(err);
}
}
// get the superviosr with all the students that belong to this sueprvisor:
export const getChildsForSuperviosr=async (req,res,next)=>
{
try
{
// get the id of supervisor:
const  {_id}=req.data;
const userGroup=await groupModel.findOne({groupSupervisor:_id});
if(!userGroup)
    {
        return next(new Error("sorry,but you not asssigned to any group yet"));
    }
const {childId}=req.query;
if(childId)
    {
      const child=await childrenModel.findOne({_id:childId}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId",populate:[{path:"groupSupervisor"}]}]);

      if(!child)
        {
            return next(new Error("there is no childExists by this id"));
        }
        if(child.groupId.toString()!=userGroup._id.toString())
            {
                return next(new Error("the child is not assigned to yourGroup you can't see his profile"));
            }
            return res.json({success:true,children:child});
            
    }
else
{
  const allChildren=await childrenModel.find({groupId:userGroup._id}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId",populate:[{path:"groupSupervisor"}]}]).sort("childName");
  // return the resposne:
  return res.json({success:true,children:allChildren});
}    
}
catch(err)
{
    return next(err);
}
}
////////////////////////////////////////////
// choose the meals of the week(all the days of the week) :
   export const assignMealsToParent=async (req,res,next)=>
   {
       try
       {
        const {meals}=req.body;
        const {_id}=req.data;
        // hceck ont he child first:
        const child=await childrenModel.findOne({_id:_id});
        if(!child)
          {
            return next(new Error("the childId may is not true check the id then try"))
          }
        if(!child.groupId)
        {
            return next(new Error("the child not assign to group yet he should assign to an group first"));
        }
        // get the day now of the week:
        const dateNow=new Date();
        const dayNowOfTheWeek=getWeekStart(dateNow).getDay();
        console.log(dayNowOfTheWeek);
        let  flagDaysAndClock=true;
        let errorsOfWeekAndDays=[];
        let  flagMeals=true;
        let errorsOfMeals=[];
        let flagAdding=true;
        const errrorOfFlagAddding=[];
         const hoursNow=dateNow.getHours();
          //make the conditions first on the meals:
        for(let i=0;i<meals.length;i++)
            {
                //there is three conditions on each object:
                const {dayWeek}=meals[i];
                if(dayWeek==dayNowOfTheWeek)
                    {
                        if(hoursNow>9)
                            {
                               flagDaysAndClock=false;
                               errorsOfWeekAndDays.push(` in the day ${dayWeek} if you make meals for the today you should make it before 9AM `);
                            }
                    }
                    // the days is larger than the today:
                    else if(dayWeek>dayNowOfTheWeek)
                    {
                       continue;
                    }
                    else if(dayWeek<dayNowOfTheWeek)
                    {
                        if(dayNowOfTheWeek==6&&hoursNow>2)
                            {
                                console.log("yes it's");
                                continue;
                            }
                            else
                            {
                                console.log("yes it's no ");
                        flagDaysAndClock=false;
                        errorsOfWeekAndDays.push(`on the day ${dayWeek} you can't add meals for past day on the week you can make only for today or for the rest days of the week`);
                            }
                    }    
            }
            if(!flagDaysAndClock)
                {
                    return next(new Error(errorsOfWeekAndDays));
                }
            // make the condions on the meals and loop on it:
            for(let i=0;i<meals.length;i++)
                {
                    const {meal1,meal2}=meals[i];
                    if(!meal1&&!meal2)
                        {
                            flagMeals=false;
                            errorsOfMeals.push("you should  send at least one meal for  a day please check the data you send");
                        }
                    if(meal1)
                        {
                           const getMealsMeal1=await mealsModel.findOne({_id:meal1});
                           if(!getMealsMeal1)
                            {
                                flagMeals=false;
                                errorsOfMeals.push(`the meal1 of id ${meal1}  is not exists check the id or it may be deleted check the day ${meals[i].dayWeek}`);
                            }
                        }
                    if(meal2)
                        {
                          const getMealsMeal2=await mealsModel.findOne({_id:meal2});
                          if(!getMealsMeal2)
                            {
                                flagMeals=false;
                                errorsOfMeals.push(`the meal2 of id ${meal2} of the day${meals[i].dayWeek}`);
                            }
                        } 
                }
                // check the flag of the meal also:
                if(!flagMeals)
                    {
                        return next(new Error(errorsOfMeals));
                    }
                    
                // add the meals to the child:
               for(let i=0;i<child.meals.length;i++)
                {
                    const {meal1,meal2,dayWeek}=child.meals[i];
                    for(let j=0;j<meals.length;j++)
                        {
                         const dataofMeal=meals[j];
                         if(dayWeek===dataofMeal.dayWeek)
                            {
                             if(meal1||meal2)
                                {
                                  flagAdding=false;
                                  errrorOfFlagAddding.push(`this day ${dayWeek} is already have an meal you can't add meal to this day you can update it ohly or delete it `);
                                }
                             else
                             {
                                if(dataofMeal.meal1&&dataofMeal.meal2)
                                    {
                                        await childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal1':dataofMeal.meal1,'meals.$.meal2':dataofMeal.meal2}});
                                    }
                                else if(dataofMeal.meal1&&!dataofMeal.meal2)
                                    {
                                        await childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal1':dataofMeal.meal1}});
                                    }
                                    else if(dataofMeal.meal2&&!dataofMeal.meal1)
                                    {
                                        await childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal2':dataofMeal.meal2}});
                                    }
                                    else if(!dataofMeal.meal1&&!dataofMeal.meal2)
                                    {
                                      flagAdding=false;
                                      errrorOfFlagAddding.push(`this day ${dayWeek} is already you are not send meal1 or meal2 please check your data`);
                                    }    
                             }
                            }
                        }
                }
                if(!flagAdding)
                    {
                       return next(new Error(errrorOfFlagAddding));
                    }  
                // come the user again with the data;
                const updatedUser=await childrenModel.findOne({_id:_id}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId"}]);
                // returnt he resposne:
                return res.json({success:true,message:"the meals is addeed sucessfully",childMeals:updatedUser});
       }
       catch(err)
       {
        return next(err);
       }
   }
     // update the meal on sp day:
 export const updateMeals=async (req,res,next)=>
 {
    try
    {
        const {meals}=req.body;
        const {_id}=req.data;
        // hceck ont he child first:
        const child=await childrenModel.findOne({_id:_id});
        if(!child)
          {
            return next(new Error("the childId may is not true check the id then try"))
          }
        if(!child.groupId)
        {
            return next(new Error("the child not assign to group yet he should assign to an group first"));
        }
        // get the day now of the week:
        const dateNow=new Date();
        const dayNowOfTheWeek=getWeekStart(dateNow).getDay();
        let  flagDaysAndClock=true;
        let errorsOfWeekAndDays=[];
        let  flagMeals=true;
        let errorsOfMeals=[];
        let flagAdding=true;
        const errrorOfFlagAddding=[];
         const hoursNow=dateNow.getHours();
        // make the conditions first on the meals:
        for(let i=0;i<meals.length;i++)
            {
                // there is three conditions on each object:
                const {dayWeek}=meals[i];
                if(dayWeek==dayNowOfTheWeek)
                    {
                        if(hoursNow>9)
                            {
                               flagDaysAndClock=false;
                               errorsOfWeekAndDays.push(`on the day ${dayWeek} if you update meals for the today you should make it before 9AM `);
                            }
                    }
                    // the days is larger than the today:
                    else if(dayWeek>dayNowOfTheWeek)
                    {
                       continue;
                    }
                    else if(dayWeek<dayNowOfTheWeek)
                    {
                        if(dayNowOfTheWeek==6&&hoursNow>2)
                            {
                                console.log("yes it's");
                                continue;
                            }
                            else 
                            {
                                flagDaysAndClock=false;
                                errorsOfWeekAndDays.push(`on the day ${dayWeek} you can't update meals for past day on the week you can make only for today or for the rest days of the week`);
                            }
                    }    
            }
            if(!flagDaysAndClock)
                {
                    return next(new Error(errorsOfWeekAndDays));
                }
            // make the condions on the meals and loop on it:
            for(let i=0;i<meals.length;i++)
                {
                    const {meal1,meal2}=meals[i];
                    if(!meal1&&!meal2)
                        {
                            flagMeals=false;
                            errorsOfMeals.push("you should  send at least one meal for  a day please check the data you send");
                        }
                    if(meal1)
                        {
                           const getMealsMeal1=await mealsModel.findOne({_id:meal1});
                           if(!getMealsMeal1)
                            {
                                flagMeals=false;
                                errorsOfMeals.push(`the meal1 of id ${meal1}  is not exists check the id or it may be deleted check the day ${meals[i].dayWeek}`);
                            }
                        }
                    if(meal2)
                        {
                          const getMealsMeal2=await mealsModel.findOne({_id:meal2});
                          if(!getMealsMeal2)
                            {
                                flagMeals=false;
                                errorsOfMeals.push(`the meal2 of id ${meal2} of the day${meals[i].dayWeek} is not exists or it may be deleted`);
                            }
                        } 
                }
                // check the flag of the meal also:
                if(!flagMeals)
                    {
                        return next(new Error(errorsOfMeals));
                    }
                    
                // update the meals to the child:
               for(let i=0;i<child.meals.length;i++)
                {
                    const {meal1,meal2,dayWeek}=child.meals[i];
                    for(let j=0;j<meals.length;j++)
                        {
                         const dataofMeal=meals[j];
                         if(dayWeek===dataofMeal.dayWeek)
                            {
                                if(!meal1&&!meal2)
                                    {
                                        flagAdding=false;
                                        errrorOfFlagAddding.push(`for the day of the ${dayWeek} there is no meals added to be updated you should add meals fisrt then update`);
                                    }
                                if(dataofMeal.meal1&&dataofMeal.meal2)
                                    {
                                      await   childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal1':dataofMeal.meal1,'meals.$.meal2':dataofMeal.meal2}});
                                    }
                                else if(dataofMeal.meal1&&!dataofMeal.meal2)
                                    {
                                      await  childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal1':dataofMeal.meal1}});
                                    }
                                    else if(dataofMeal.meal2&&!dataofMeal.meal1)
                                    {
                                      await  childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal2':dataofMeal.meal2}});
                                    }
                                    else if(!dataofMeal.meal1&&!dataofMeal.meal2)
                                    {
                                      flagAdding=false;
                                      errrorOfFlagAddding.push(`this day ${dayWeek} is already you are not send meal1 or meal2 please check your data`);
                                    }    
                             }
                            
                        }
                }
                if(!flagAdding)
                    {
                       return next(new Error(errrorOfFlagAddding));
                    }  
                // come the user again with the data;
                const updatedUser=await childrenModel.findOne({_id:_id}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId"}]);
                // returnt he resposne:
                return res.json({success:true,message:"the meals is updated sucessfully",childMeals:updatedUser});
       }
       catch(err)
       {
        return next(err);
       }
   }
    // delete the meal of sp day or the all the week:
     export const deleteMealsForChild=async (req,res,next)=>
     {
         try
         {
           // get the id of the user:
           const {_id}=req.data;
           // check thet the child is exists;
           const child=await childrenModel.findOne({_id:_id});
           if(!child)
            {
                return next(new Error("the child id is not correct or the child account may be deleted"));s
            }
           // get the day of now:
           const date=new Date();
           const dayNow=getWeekStart(date).getDay();
           // getg the hours of now:
           const hoursNow=date.getHours();
           // check on the days and check on the hours:
           // loop and check:
           const {days}=req.body;
           let flagDaysHours=true;
           let arrayOfErrorsInDayWeeks=[];
           for(let i=0;i<days.length;i++)
            {
              if(days[i]==dayNow)
                {
                    if(hoursNow>9)
                        {
                           flag=false;
                           arrayOfErrorsInDayWeeks.push(`in the day of ${days[i]} you can't delete the meals after the 9Am`);
                        }
                }
                else if(days[i]>dayNow)
                 {
                    continue;
                 }  
                 else if(days[i]<dayNow)
                 {
                    if(dayNow==6&&hoursNow>2)
                        {
                            console.log("yes it's");
                            continue;
                        }
                        else 
                        {
                            flagDaysHours=false;
                            arrayOfErrorsInDayWeeks.push(`in the day of ${days[i]} you can't delete the meals for past and days ago already `)
                        }

                 } 
            }
            if(!flagDaysHours)
                {
                    return next(new Error(arrayOfErrorsInDayWeeks));
                }
            for(let i=0;i<child.meals.length;i++)
                {
                    const {dayWeek,meal1,meal2}=child.meals[i];
                    for(let j=0;j<days.length;j++)
                        {
                            if(dayWeek==days[j])
                                {
                                 await childrenModel.updateOne({_id:_id,'meals.dayWeek':dayWeek},{$set:{'meals.$.meal1':null,'meals.$.meal2':null}});
                                }
                                else
                                {
                                    continue;
                                }
                        }
                }  
            // get the user now:
            const userUpdated=await childrenModel.findOne({_id:_id}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId"}]);
            // return the resposne:
            return res.json({success:true,message:'the meals is deleted sucessfully',childMeals:userUpdated});    

         }
         catch(err)
         {
            return next(err);
         }
     }
    // get the profile for parent:
    export const getProfileForParent=async (req,res,next)=>
    {
      try
      {
        const {_id}=req.data;
        const userProfileWithMeals=await childrenModel.findOne({_id:_id}).populate([{path:"meals.meal1"},{path:"meals.meal2"},{path:"groupId"}]);
        return res.json({success:true,childProfileWithMeals:userProfileWithMeals});
      }
      catch(err)
      {
        return next(err);
      }
    }
    // empty all the meals for all the students on friday at 1Am(mashy yaam); (cron-job) or schedule job;(done);
// test (the events + meals); on postMan(not done);
 




