import joi from 'joi';
export const addApologizeSchema=joi.object(
{
    reasonForAbsence:joi.string().min(5).max(400).required(),
    dateOfAbsence:joi.date().required(),
}).required();
export const ckeckId=joi.object({
    apId:joi.string().min(5).required(),
}).required();
export const updateApologizeSchema=joi.object(
{
    reasonForAbsence:joi.string().min(5).max(400).required(),
}).required();
export const getFilters=joi.object({
    
    childId:joi.string().min(5).required(),
}).required();
export const upadateAplogizesSeenSchema=joi.object({
    apologizesId:joi.array().items(joi.string().min(5).required()).min(1).required(),
}).required();
export const getDate=joi.object({
    dateOfAbsence:joi.date(),
}).required();