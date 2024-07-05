function bodyValidation(schema)
{
    return (req,res,next)=>{
        try
        {
             // get the data from the body:
             const data=req.body;
             // chekc on the validity of the data:
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
};
export default bodyValidation;