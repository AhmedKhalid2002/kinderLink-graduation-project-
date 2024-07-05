import mongoose from 'mongoose';
async function connectToDb()
{
return await mongoose.connect("mongodb://127.0.0.1:27017/kinderLink").then(()=>console.log("the db is connected sucesssfylly")).catch(err=>console.log("the re is an erro in the connect to the db",err)); 
}
export default connectToDb;