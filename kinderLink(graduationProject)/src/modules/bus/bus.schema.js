import joi from 'joi';
export const getBusSuperviosrFilterByName=joi.object({
    busSuperviosrName:joi.string().min(0).max(40),
}).required();
export const getFreeChildren=joi.object(
{
childName:joi.string().min(0),
groupName:joi.string().min(0),
}).required();
export const addBus=joi.object(
{
busName:joi.string().min(2).max(50).required(),
busNumber:joi.string().min(6).max(8).required(),
capacity:joi.number().min(10).max(100).required(),
busSupervisor:joi.string().min(5).required(),
}).required();
export const checkId=joi.object(
    {
        busId:joi.string().min(5).required(),
    }
).required();
export const updataeBus=joi.object(
{
busName:joi.string().min(2).max(50),
busSupervisor:joi.string().min(5),
capacity:joi.number().min(10).max(100),
busNumber:joi.string().min(6).max(8),
}).required();
export const assignChildren=joi.object({
    children:joi.array().items(joi.string().min(5).required()).min(1).required(),

}).required();
export const removeChildren=joi.object({
    children:joi.array().items(joi.string().min(5).required()).min(1).required(),
}).required();
export const filterBus=joi.object({
    name:joi.string().min(0),
    seats:joi.string().min(0),
    min:joi.string().min(0),
    max:joi.string().min(0),
}).required();