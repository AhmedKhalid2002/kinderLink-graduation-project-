import { Router } from "express";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as busController from './bus.controller.js';
import * as busSchema  from './bus.schema.js';
import paramsValidation from "../../middleWare/validation/params.validation.js";
import queryValidation from "../../middleWare/validation/query.validation.js";
const busRouter=Router({mergeParams:true});
// admin >>>>>>>bus api's:
// get all the bussupervisor free:
busRouter.get("/getFreeBusSeueprvisorsOrGetFilterByName",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(busSchema.getBusSuperviosrFilterByName),busController.getFreeSuperviosrs);
// get all children free or get all cheildren free in a sp region or get all children free from a sp group:
busRouter.get("/getAllFreeChildrenWithoutBus",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(busSchema.getFreeChildren),busController.getAllFreeChildren);
// create bus:
busRouter.post("/createBus",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(busSchema.addBus),busController.createBus);
// update bus data:
busRouter.patch("/updateBus/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),bodyValidation(busSchema.updataeBus),busController.updateBus);
//delete the bus:
busRouter.delete("/deleteSpBus/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),busController.deleteBus);
// assign childfren to the bus:
busRouter.patch("/assignChildrenToBus/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),bodyValidation(busSchema.assignChildren),busController.assignChildrenController);
// remove children from the bus:
busRouter.patch("/removeChildren/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),bodyValidation(busSchema.removeChildren),busController.removeChildren);
// get all buses:
busRouter.get("/getAllBusesForAdmin",authnetecatedEmployee,authorizedEmployee("admin"),busController.getAllBuses)
// get sp bus with all data:
busRouter.get("/getSpBusForAdmin/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),busController.getSpBus);
// remove the busSupervisor:
busRouter.patch("/removeBusSupervisor/:busId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(busSchema.checkId),busController.removeBusSupervisor);
// filter by name or by an nay thing fromt he  :
busRouter.get("/getBusesByFilter",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(busSchema.filterBus),busController.getFilter)
// ---------------------------------- ------------------------------- -----------------------------------
export default busRouter;