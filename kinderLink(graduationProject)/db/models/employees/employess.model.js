

import mongoose,{ Schema, Types } from "mongoose";import { nanoid } from "nanoid";
;


const empSchema=new Schema({
name:
{
    type:String,
    required:true,
    unique:true,
},
email:
{
    type:String,
    required:true,
    unique:true,
},
password:
{
    type:String,
    required:true,
    min:8,
    max:20
},
phone:
{
    type:String,
    min:11,
    max:12,
    required:true,
    unique:true,
},
address:{
    type:String,
required:true,
min:4,
max:70,
},
salary:
{
    type:String,
    required:true,
},
role:{
    type:String,
    required:true,
    enum:["admin","evaluator","interviewer","supervisor","socialSpecialist","busSupervisor"],
},
profilePicture:
{
type:{
    public_id:{type:String,required:true,unique:false},
    secure_url:{type:String,required:true,unique:false},
},
default:{secure_url:`${nanoid(3)}/https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?w=740&t=st=1710772847~exp=1710773447~hmac=506342c6e72517ec91d5cd557ade4499c2d23c87fbdc50bbff4c491a9012f5cf`,public_id:nanoid(10)},
required:false,
unique:false,
},
pinCode:{
    type:String,
    length:5,
},
isActivated:
{   
    type:Boolean,
    default:false,
},
addedBy:{
    type:Types.ObjectId,
    ref:"employee",
  
},
updatedBy:{
    type:Types.ObjectId,
    ref:"employee",
},
deletedBy:{
    type:Types.ObjectId,
    ref:"employee",
},
resetCode:{
    type:String,
    length:5,
},
notes:{
    type:[{adminId:{type:Types.ObjectId,ref:"employee",required:true},toEmployee:{type:Types.ObjectId,required:true,ref:"employee"},content:{type:String,required:true},seen:{type:Boolean,default:false},date:{type:Date,required:true,default:Date.now()}}],
    req:false,
    default:[],
}

},{timestamps:true,strictQuery:true,toObject:{virtuals:true},toJSON:{virtuals:true}});
empSchema.virtual("groups",{localField:"_id",foreignField:"groupSupervisor",ref:"group"})
const empModel=mongoose.model("employee",empSchema);
export default empModel;
