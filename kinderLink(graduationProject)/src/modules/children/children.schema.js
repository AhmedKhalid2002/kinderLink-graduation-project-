import joi from 'joi';
export const loginSchema=joi.object({
    email:joi.string().email().required(),
    password:joi.string().min(8).required(),
}).required();
export const updateSpData=joi.object({
    email:joi.string().email().required(),
}).required();
export const activeAccount=joi.object({
    email:joi.string().email().required(),
}).required();
export const updatePhone=joi.object({
    phone:joi.string().pattern(/^(010|011|012|015)[0-9]{8,9}$/).required(),
}).required();
export const updatePassword=joi.object({
    oldPassword:joi.string().required(),
    newPassword:joi.string().min(8).max(20).required(),
    confirmPassword:joi.string().valid(joi.ref("newPassword")).required(),
}).required();
export const forgetPasswordSchema=joi.object({
email:joi.string().email().required(),
}).required();
export const getForgetCodeSchema=joi.object(
    {
        email:joi.string().email().required(),
        resetCode:joi.string().required(),
        password:joi.string().min(8).max(20).required(),
        confirmPassword:joi.string().required(),
    }
).required();
