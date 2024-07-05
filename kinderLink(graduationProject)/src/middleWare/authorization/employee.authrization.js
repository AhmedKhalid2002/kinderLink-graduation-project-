const authorizedEmployee=(roleEmployee)=>{
return (req,res,next)=>{
try
{
    // get the data of the user then check :
    let {role,email}=req.data;
    // chekc on the user of the state of th user the same state of the that required:
    if(role!=roleEmployee)
    {
        return next(new Error(`sorry you haven't the authorization to do this operation`));
    }
    // fo to the next controller or moddleware:
    return next();
}
catch(err)
{
    return next(err);
}
}
}
export default authorizedEmployee;