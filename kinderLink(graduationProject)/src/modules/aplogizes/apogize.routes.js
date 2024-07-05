import { Router } from "express";
import { authentecatedChildren } from "../children/children.authentecation.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as aplogizeControler from './aplogize.controller.js';
import * as aplogizeSchema from './aplogtize.schema.js';
import paramsValidation from "../../middleWare/validation/params.validation.js";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import queryValidation from "../../middleWare/validation/query.validation.js";
const aplogizeRoueter=Router({mergeParams:true});
// aplogizes api's:
// add apologize:
aplogizeRoueter.post("/addApologize",authentecatedChildren,bodyValidation(aplogizeSchema.addApologizeSchema),aplogizeControler.addApollogize);
// update Sp apologize:
aplogizeRoueter.patch("/updateSpAplogize/:apId",authentecatedChildren,paramsValidation(aplogizeSchema.ckeckId),bodyValidation(aplogizeSchema.updateApologizeSchema),aplogizeControler.updateApologize);
// delete Sp apologize:
aplogizeRoueter.delete("/deleteApologize/:apId",authentecatedChildren,paramsValidation(aplogizeSchema.ckeckId),aplogizeControler.deleteApologize);
// get all apologizes for the user:
aplogizeRoueter.get("/getAllApologizesForParent",authentecatedChildren,aplogizeControler.getAllApologizes);
////////////////////////////////////////////////////
// api's for busSupervisor:
// get the aplogizes fro busSupervisor first:
aplogizeRoueter.get("/getAplogizesForBusSupervisorByFilter",authnetecatedEmployee,authorizedEmployee("busSupervisor"),queryValidation(aplogizeSchema.getDate),aplogizeControler.getAplogizesForBusSupervisor);

// get  a specefiec by id or by id or by childName:
aplogizeRoueter.get("/getAplogizesAboutSpChildByChildId",authnetecatedEmployee,authorizedEmployee("busSupervisor"),queryValidation(aplogizeSchema.getFilters),aplogizeControler.getSpecieficStudentAplogizeForBusSupervisor)
// upadet the apogizes state:
aplogizeRoueter.patch("/upadateAplogizesStates",authnetecatedEmployee,authorizedEmployee("busSupervisor"),bodyValidation(aplogizeSchema.upadateAplogizesSeenSchema),aplogizeControler.upadateSeenAplogizesState)
export default aplogizeRoueter;