import joi from 'joi';
export const getRequestByEmailToEvaluator=joi.object({
    email:joi.string().email().required(),
}).required();

export const requestIdSchema=joi.object({
    requestId:joi.string().min(5).required(),
}).required();
export const requestRevieingByEvalSchema=joi.object({
    state:joi.string().valid("waiting","interviewing","refused").required(),
    condition:joi.string().min(5).max(700),
}).required();
export const getSpForIntervierer=joi.object({
    email:joi.string().required(),
}).required();
export const setInterviewTIme=joi.object({
    interviewTime:joi.date().greater(Date.now()).required(),
}).required();
export const rejectOrAcceptInterview=joi.object({
    state:joi.string().valid("accepted","finalRefused").required(),
    condition:joi.string().min(5).max(700),
    busService:joi.boolean(),
}).required();
export const updateWiatingState=joi.object({
    state:joi.string().valid("interviewing","refused").required(),
    condition:joi.string().min(5),
}).required();