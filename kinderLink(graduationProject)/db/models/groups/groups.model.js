import mongoose,{Schema,Types} from "mongoose";
const groupShema=new Schema({
    groupName:
    {
        type:String,
        required:true,
        unique:true,
    },
    createdBy:
    {
        type:Types.ObjectId,
        ref:"employee",
        required:true,
    },
    updatedBy:
    {
        type:Types.ObjectId,
        ref:"employee",
    },
    capacity:
    {
        type:Number,
        required:true,
    },
    groupSupervisor:
    {
        type:Types.ObjectId,
        ref:"employee",
    },
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true},strictQuery:true});
groupShema.virtual("childrenGroup",{localField:"_id",foreignField:"groupId",ref:"children"});
const groupModel=mongoose.model("group",groupShema);
export default groupModel;
