import joi from 'joi';
export const addMeal=joi.object({
    mealName:joi.string().min(1).max(200).required(),
    mealsIngredients:joi.string().required(),
    price:joi.number().min(1).max(10000).required(),
    weight:joi.string().min(1).required(),
}).required();

export const updatseMealData=joi.object(
{
mealName:joi.string(),
mealsIngredients:joi.string(),
price:joi.string(),
wiegth:joi.string(),
}).required();

export const checkMealId=joi.object({
mealId:joi.string().min(5).required(),
}).required();

export const getAllMealsFIlters=joi.object(
{
mealName:joi.string().min(0),
mealIngredients:joi.string()
}).required();
export const assignMealsToParent=joi.object(
{
 meals:joi.array().items(joi.object({dayWeek:joi.number().min(0).max(5),meal1:joi.string().min(5),meal2:joi.string().min(5)}).required()).max(6).required(),

}).required();
export const deleteMealsForChildSchema=joi.object({
    days:joi.array().items(joi.number().min(0).max(5)).min(1).required(),
}).required();

export const getFilterForSpChild=joi.object({
    childId:joi.string().min(5),
}).required();