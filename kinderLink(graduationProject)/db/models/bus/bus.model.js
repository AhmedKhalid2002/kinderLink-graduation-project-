import mongoose,{Schema, Types} from "mongoose";
const busSchema=new Schema({
busName:{
    type:String,
    required:true,
    unique:true,
},
busNumber:
{
    type:String,
    required:true,
    unique:true,
},
capacity:{
    type:Number,
    required:true,
},
busSupervisor:
{
    type:Types.ObjectId,
    ref:'employee',
    default:null,
},
addedBy:
{
    type:Types.ObjectId,
    ref:"employee"
},
updatedBy:{
    type:Types.ObjectId,
    ref:"employee"
},
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true},strictQuery:true});
busSchema.virtual("children",{localField:"_id",foreignField:"bus",ref:"children"});
const busModel=mongoose.model("bus",busSchema);
export default busModel;