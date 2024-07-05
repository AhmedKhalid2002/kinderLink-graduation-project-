import childrenModel from "../../../db/models/children/children.model.js";
import childTokenModel from "../../../db/models/childrenToken/children.token.js";
import jwt from 'jsonwebtoken';
export const authentecatedChildren=async (req,res,next)=>
{
try
{
// get the token from the headers first:
const {token}=req.headers;
console.log(token);
if(!token)
{
    return next(new Error("yoiu must send the token in headers"));
}
// check on the bareer key in the token:
if(!token.startsWith("ahmed__"))
{
return next(new Error("the token is not contain the bareer Key"));
}
// split the bareerKey from the token:
const finalToken=token.split("__")[1];
// compare the token in the token model:
const tokenAfterSearch=await childTokenModel.findOne({token:finalToken});
if(!tokenAfterSearch)
{
    return next(new Error("the token is not exists"));
}
// chekc on the validity of the token:
if(!tokenAfterSearch.isValid)
{
    return next(new Error("the token is not valid"));
}
// get the id of the user:
let {childId}=jwt.verify(finalToken,"secretKey");
// check on the id of the user and if he is exists:
const child=await childrenModel.findOne({_id:childId});
if(!child)
{
    return next(new Error("the account is not exists"));
}
if(!child.isActiveted)
{
    return next(new Error("the user accouent must be activated first"))
}
// make req.data:
req.data=child;
// returb thot he next controller:
return next();
}
catch(err)
{
    return next(err);
}
}