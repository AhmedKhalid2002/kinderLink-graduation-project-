import joi from 'joi';
export const addEventSchema=joi.object(
{
eventName:joi.string().min(2).max(500).required(),
eventDescribtion:joi.string().min(5).max(1000).required(),
eventPrice:joi.string().required(),
eventDate:joi.date().required(),
capacity:joi.string().required(),
}).required();
export const checkId=joi.object({
eventId:joi.string().min(5).required(),
}).required();
export  const upadteEventSchema=joi.object({
    eventName:joi.string().min(2).max(500),
    eventPrice:joi.number().min(1),
    eventDate:joi.date().greater(new Date()),
    eventDescribtion:joi.string().min(5).max(1200),
    capacity:joi.number().min(1),
}).required();
export const getFilter=joi.object(
{
    eventName:joi.string().min(0),
    min:joi.number().min(0),
    max:joi.number().min(0),
    eventDate:joi.date(),
}).required();
export const getFilterOnDate=joi.object({
lessThan:joi.string().valid("yes","no"),
greaterThan:joi.string().valid("yes","no"),
}).required();
export const getSpStudentWithAllEvents=joi.object(
{
    idOfUser:joi.string().min(0),
    childName:joi.string().min(0)
}).required();
export const getEvetsByName=joi.object({
    eventName:joi.string().min(0).required(),
}).required();
export const getStateForReserve=joi.object(
{
state:joi.string().valid('fullCapacityReservation','elapsedTravels','availableForReverse',"").required(),
}).required();
export const updatePayState=joi.object({
    childIds:joi.array().items(joi.string().min(5).required()).min(1).required(),
    eventId:joi.string().min(5).required(),
}).required();