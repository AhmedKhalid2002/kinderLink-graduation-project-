import mongoose,{Schema, Types} from "mongoose";
const childTokenSchema=new Schema(
{
token:
{
    type:String,
    required:true,
    unique:true,
},
childId:
{
    type:Types.ObjectId,
    ref:"children",
    required:true,
},
userAgent:
{
    type:String,
    required:true,
},
isValid:
{
    type:Boolean,
    default:true,
},
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true},strictQuery:true});
const childTokenModel=mongoose.model("childToken",childTokenSchema);
export default childTokenModel;