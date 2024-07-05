
import mongoose,{Schema, Types} from "mongoose";
const mealsSchema=new Schema({
    mealName:
    {
        type:String,
        required:true,
        unique:true,
    },
    mealsIngredients:
    {
        type:[{type:String}],
        default:[],
        required:true,
    },
    price:
    {
        type:Number,
        min:1,
        max:10000,
        required:true,
    },
    weight:
    {
        type:String,
        required:true,
    },
    mealImages:
    {
        type:[{public_id:{type:String,required:true},secure_url:{type:String,required:true}}],
        default:[],
    },
    addedBy:
    {
        type:Types.ObjectId,
        ref:"employee",
        required:true,
    },
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true},strictQuery:true});
const mealsModel=mongoose.model("meal",mealsSchema);
export default mealsModel;