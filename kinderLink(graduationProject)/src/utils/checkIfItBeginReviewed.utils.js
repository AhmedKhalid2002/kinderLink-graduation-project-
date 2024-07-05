import requestsModel from './../../db/models/requests/requests.model.js';

async function reviewRequetsOrNot(req,es,next)
{
   // get the data from the req first:
   let {id,state}=req.userData;
   // then check on the model from if it's not have a  value or not:
 let user=await requestsModel.findOne({_id:id,evaluatedBy:{$eq:null}});
 if(!user)
 {
    return next(new Error("sorry you can't update the data of th erequest after the requets reviewed make a new request if you want"));
 };
 return next();
}
export default reviewRequetsOrNot;