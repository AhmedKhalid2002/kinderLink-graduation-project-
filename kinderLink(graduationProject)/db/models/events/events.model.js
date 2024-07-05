
import mongoose,{Schema,Types} from "mongoose";
const eventsSchema=new Schema({
eventName:{
    type:String,
   
},
eventDescribtion:
{
type:String,

},
eventPrice:
{
    type:Number,
    required:true,
    min:1,
    max:120000,
},
eventDate:
{
    type:Date,
   
},
capacity:
{
type:Number,

min:1,
max:200000,
},
childrens:
{
    type:[{type:{childId:{type:Types.ObjectId,ref:"children",required:true},payed:{type:Boolean,default:false}}}],
    default:[],
},
addedBy:
{
type:{
    type:Types.ObjectId,
    ref:"employee",
},

},
eventPhotos:
{
    type:[{public_id:{type:String,required:true},secure_url:{type:String,required:true}}],
    default:[],
},
updatedBy:
{
    type:Types.ObjectId,
    ref:"employee",
}
},
{timestamps:true,strictQuery:true,toObject:{virtuals:true},toJSON:{virtuals:true}});
const eventModel=mongoose.model("event",eventsSchema);
export default eventModel;