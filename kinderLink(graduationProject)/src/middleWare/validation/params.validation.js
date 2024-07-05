function paramsValidation(schema)
{
    return (req,res,next)=>
    {
        try
    {
    const data=req.params;
    const results=schema.validate(data,{abortEarly:false});
     // chekc on the results:
     if(!results.error)
     {
        return next();
     }
     // thn get the rror of the data:
     let errorLists=[];
     results.error.details.forEach((ele)=>errorLists.push(ele.message));
     return next(new Error(`${errorLists}`));
    }
    catch(err)
    {
        return next(err);
    }
    }
}
export default paramsValidation;