import requestsModel from "../../../db/models/requests/requests.model.js";
import tokenModel from "../../../db/models/token/token.model.js";
import jwt from 'jsonwebtoken';
async function authentecatedParent(req,res,next)
{
    let {token}=req.headers;
    // check first if the rokne is exixst or not:
    if(!token)
    {
        return next(new Error("you msyt send the token in the headers"));
    }

    // check on the barrer key if it's exists or not:
    let tokenResults=token.startsWith("ahmed__");
    if(!tokenResults)
    {
        return next(new Error("the token is not exists the bareer key"));
    }
    // get the final token :
    let finalToken=token.split("__")[1];
    // chekc if the token is exists or not and the validity of it:
    let userToken=await tokenModel.findOne({token:finalToken});
    if(!userToken)
    {
        return next(new Error("the token you are sended is not exists"));
    }
    if(!userToken.isValid)
    {
         return next(new Error("the token you are sended is not valid sorry"));
    }
    // extract the data of user from the token:
    let data=jwt.verify(finalToken,"secretKey");
    // chekc on the user first:
    let user=await requestsModel.findOne({_id:data.id});
    if(!user)
    {
        return next(new Error("the user is not exists"));
    }
    if(!user.isActivated)
    {
        return next(new Error("the user is not activated his email"));
    }
    if(!(user.isActivated||user.state=="notInQueue"))
    {
        return next(new  Error("the user email is not activated yet"));
    }
    // then check on what i want:
    req.userData=data;
    // then go to the next controller:
    return next();
}
export default authentecatedParent;