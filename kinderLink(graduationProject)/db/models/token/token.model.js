import mongoose,{Schema, Types} from "mongoose";
const tokenSchema=new Schema({
token:
{
    type:String,
    required:true,
    unique:true,
},
userId:
{
    type:Types.ObjectId,
    ref:"request",
    required:true,
},
isValid:
{
    type:Boolean,
    default:true,
},
userAgent:
{
    type:String,
    required:true,
}
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true}});
const tokenModel=mongoose.model("token",tokenSchema);
export default tokenModel;