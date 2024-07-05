import mongoose,{Schema, Types} from 'mongoose';
const aplogizeSchema=new Schema(
{
reasonForAbsence:
{
    type:String,
    required:true,
    min:5,
    max:400,
},
dateOfAbsence:
{
    type:Date,
    requierd:true,
},
from:
{
type:Types.ObjectId,
ref:"children",
requierd:true
},
seen:
{
    type:Boolean,
    default:false,
},
timeOfAplogize:
{
    type:String,
    required:true,
}
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true},strictQuery:true});
const aplogizeModel=mongoose.model("apologize",aplogizeSchema);
export default aplogizeModel;
