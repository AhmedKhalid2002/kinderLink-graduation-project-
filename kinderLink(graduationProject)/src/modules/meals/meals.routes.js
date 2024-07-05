import { Router } from "express";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as mealsController from './meals.controller.js';
import * as mealsSchema from './meals.schema.js';
import uploadingFileRequets from "../../utils/uploadingFile.js";
import paramsValidation from "../../middleWare/validation/params.validation.js";
import queryValidation from "../../middleWare/validation/query.validation.js";
import { authentecatedChildren } from "../children/children.authentecation.js";
const mealsRouter=Router({mergeParams:true});
// admin opeartions:
   // add the new meal:
     mealsRouter.post("/addMeal",authnetecatedEmployee,authorizedEmployee("admin"),uploadingFileRequets().any(),bodyValidation(mealsSchema.addMeal),mealsController.addMeal);
    // update the meal data:
    mealsRouter.patch("/updateMeal/:mealId",authnetecatedEmployee,authorizedEmployee("admin"),uploadingFileRequets().any(),paramsValidation(mealsSchema.checkMealId),bodyValidation(mealsSchema.updatseMealData),mealsController.updateMeal);
    // delete the meal:
    mealsRouter.delete("/deleteMeal/:mealId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(mealsSchema.checkMealId),mealsController.deleteMeal);
    // get all the ingredients:(for two admin  +parents)
    mealsRouter.get("/getAllIngredients",authnetecatedEmployee,authorizedEmployee("admin"),mealsController.getAllIngredients);
    // get all meals (for admins+parents):
    mealsRouter.get("/getAllMealsOrGetByFilter",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(mealsSchema.getAllMealsFIlters),mealsController.getAllMealsOrGetByFilter);
    // get the sp meal (for two parents and admins):(for two admin+parent)
    mealsRouter.get("/getSpMeal/:mealId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(mealsSchema.checkMealId),mealsController.spMeal);
    // get a sp child for superviosr:(filter all or sp);
    mealsRouter.get("/getChildrenWIthTheirMealsForSupervisor",authnetecatedEmployee,authorizedEmployee("supervisor"),queryValidation(mealsSchema.getFilterForSpChild),mealsController.getChildsForSuperviosr)
    //////////////////////////////////////////////////////////////////////////////
    // parent routers:
    // get all the ingredients to parent:
    mealsRouter.get("/getAllIngredientsForParent",authentecatedChildren,mealsController.getAllIngredients);
    // get all the meals for the parents:
    mealsRouter.get("/getAllMealsOrGetByFilterForParent",authentecatedChildren,queryValidation(mealsSchema.getAllMealsFIlters),mealsController.getAllMealsOrGetByFilter);
    // get sp meal for the parent:
    mealsRouter.get("/getSpMealForParent/:mealId",authentecatedChildren,paramsValidation(mealsSchema.checkMealId),mealsController.spMeal);
    // assign meal to the children:(mashy ya3m):
    mealsRouter.patch("/assignMealToChild",authentecatedChildren,bodyValidation(mealsSchema.assignMealsToParent),mealsController.assignMealsToParent); 
    // update meals:
    mealsRouter.patch("/updateMealsForUser",authentecatedChildren,bodyValidation(mealsSchema.assignMealsToParent),mealsController.updateMeals);
    // delete meals:
    mealsRouter.delete("/deleteMealsForChild",authentecatedChildren,bodyValidation(mealsSchema.deleteMealsForChildSchema),mealsController.deleteMealsForChild);
    // get the childMealsProfile:
    mealsRouter.get("/getProfileMealsOfChildToParent",authentecatedChildren,mealsController.getProfileForParent)

export default mealsRouter;