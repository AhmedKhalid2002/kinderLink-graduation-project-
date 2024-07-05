import joi from 'joi';
export const addEmployeeSchema=joi.object(
    {
        name:joi.string().pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/).required().min(5).max(60),
        email:joi.string().email().required(),
        phone:joi.string().pattern(/^(010|011|012|015)(\d){8,9}$/).required(),
        address:joi.string().min(4).max(60).required(),
        salary:joi.string().pattern(/^[1-9]{1}[0-9]{1,6}$/).required(),
        role:joi.string().valid("admin","evaluator","interviewer","supervisor","socialSpecialist","busSupervisor").required(),
    }
).required();
export const login=joi.object({
    email:joi.string().email().required(),
    password:joi.string().required(),
    pinCode:joi.string().required(),
}).required();
export const ActiveAccountSchema=joi.object({
    email:joi.string().email().required(),
}).required();

export const updatePasswordSchema=joi.object({
    oldPassword:joi.string().required(),
    newPassword:joi.string().required().min(8).max(20),
    rePassword:joi.string().valid(joi.ref("newPassword")).required(),
}).required();

export const  forgetPassword=joi.object(
    {
        email:joi.string().email().required(),
    }
).required();

export const getCodeOfForget=joi.object({
    email:joi.string().email().required(),
    code:joi.string().required().length(5),
    password:joi.string().min(8).max(20).required(),
    rePassword:joi.string().valid(joi.ref("password")).required(),
}).required();

export const deleteAccount=joi.object({
    employeeId:joi.string().min(5).required(),
}).required();

export const updateSpDataOfUser=joi.object(
{
  phone:joi.string().pattern(/^(010|011|012|015)[0-9]{7,8}$/),
  address:joi.string().min(6),
  salary:joi.string().pattern(/^[1-9]{1}[0-9]{1,8}$/),
  role:joi.string().valid("admin","evaluator","interviewer","supervisor","socialSpecialist","busSupervisor"),
}).required();

export const getEmployeeForAdmin=joi.object({
    name:joi.string(),
    phone:joi.string().length(11),
}).required();

export const getEmplyeesRole=joi.object({
    role:joi.string().valid("admin","supervisor","socialSpecialist","evaluator","interviewer","busSupervisor","undefined"),
}).required();

export const addNote=joi.object({
    toEmployee:joi.string().required(),
    content:joi.string().min(1).max(700).required(),
}).required();

export const updateSteteNote=joi.object({
    arrayNotes:joi.array().items(joi.object({adminId:joi.string().required(),toEmployee:joi.string().required(),_id:joi.string().required(),seen:joi.boolean().required(),conetnt:joi.string().required(),date:joi.date().required()}).required()).min(1).required(),
}).required();
export const upadteContentNote=joi.object({
    content:joi.string().min(1).required(),
}).required();
export const noteId=joi.object({
    idNote:joi.string().min(5).required(),
}).required();

export const note=joi.object({
    noteId:joi.string().min(5).required(),
}).required();
export const getRequestsAdmin=joi.object({
    state:joi.string().valid("notInQueue","underRevising","refused","finalRefused","accepted","interviewing","waiting"),
}).required();
export const getASpsRequets=joi.object({
    requestId:joi.string().min(5).required(),
}).required();
export const getByNameRequet=joi.object({
    nameChild:joi.string().min(5),
    requestId:joi.string().min(5)
}).required();
export const getAnalysis=joi.object({
    month:joi.string().min(1).max(2),
}).required();
export const anlaysisEmployee=joi.object({
    employeeId:joi.string().min(5).required(),
}).required();
export const getIdOfEmployee=joi.object({
    employeeId:joi.string().min(5).required(),
}).required();
