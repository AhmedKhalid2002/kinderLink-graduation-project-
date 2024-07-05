import empTokenModel from "../../../db/models/employeeeToken/empToken.model.js";
import jwt from 'jsonwebtoken';
import empModel from "../../../db/models/employees/employess.model.js";
const authnetecatedEmployee=async (req,res,next)=>{
    try
    {
     // get the token from the headers first:
    let {token}=req.headers;
    // cehck if the tokn is exists or not:
    if(!token)
    {
        return next(new Error("you must send the token in the headers"));
    }
    // check on the token if exists the barer key:
    if(!token.startsWith("ahmed__"))
    {
        return next(new Error("the bareer key is not found in the token"));
    }
    // chekc on the token if it exists or not:
    let finalToken=token.split("__")[1];
    // cehck on if the token is exists:
    let tokenReults=await empTokenModel.findOne({token:finalToken});
    if(!tokenReults)
    {
        return next(new Error("the token is not exists"));
    }
    if(!tokenReults.isValid)
    {

        return next(new Error("the token you are sended it is no longer valid!!!"));
    }
    // get the data from th etokne:
    let user=jwt.verify(finalToken,"secretKey");
    // check on the user and the activity of the account:
    let getUser=await empModel.findOne({_id:user.id});
    if(!getUser)
    {
        return next(new Error("the user is not exists"));

    }
    if(!getUser.isActivated)
    {
        return next(new Error("the user account is notActivated yet"));
    }
    // save the dta on the next controller by add the data of the user:
    req.data=getUser;
    // then go to the next controller:
    return next();
    }
    catch(err)
    {
      return next(err);
    }
}
export default authnetecatedEmployee;