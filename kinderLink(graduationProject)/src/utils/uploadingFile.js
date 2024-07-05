import multer,{diskStorage} from 'multer';
function uploadingFileRequets()
{
   try
   {
    const st=diskStorage({});
    const multerObject=multer({storage:st,fileFilter:(req,file,cb)=>{
        if(file.mimetype!="image/png"&&file.mimetype!="image/jpeg"&&file.mimetype!="image/webp")
        {
          cb(new Error("the file format should be an image(.jpg|.png)"),false)
        }
        else{
            cb(null,true)
        }
    }});
    console.log("yes okay");
    return multerObject;
   }
   catch(err)
   {
    console.log(err);
    return next(err);
   
   }
};
export default uploadingFileRequets;