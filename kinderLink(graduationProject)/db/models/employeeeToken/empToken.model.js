import mongoose,{Schema, Types} from "mongoose";
const empTOkenSchema=new Schema({
  token:
  {
    type:String,
    required:true,
    unique:true,
  },
  employeeId:
  {
    type:Types.ObjectId,
    ref:"employee",
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
  }
},{timestamps:true,strictQuery:true,toObject:{virtuals:true},toJSON:{virtuals:true}});
const empTokenModel=mongoose.model("empTokenModel",empTOkenSchema);
export default empTokenModel;