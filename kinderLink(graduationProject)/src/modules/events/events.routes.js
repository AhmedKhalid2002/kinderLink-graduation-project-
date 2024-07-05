import { Router } from "express";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as eventsController from './events.controller.js';
import * as eventSchema from './events.schema.js';
import uploadingFileRequets from "../../utils/uploadingFile.js";
import paramsValidation from "../../middleWare/validation/params.validation.js";
import queryValidation from './../../middleWare/validation/query.validation.js';
import { authentecatedChildren } from "../children/children.authentecation.js";
const eventRouter=Router({mergeParams:true});
// events Api:
   // evenyts with ethe mpoyee actions:
   // create an event:
   eventRouter.post("/addEvent",authnetecatedEmployee,authorizedEmployee("admin"),uploadingFileRequets().any(),eventsController.addEvent);
   // deledt the event:
   eventRouter.delete("/deleteEvent/:eventId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(eventSchema.checkId),eventsController.deleteEvent);
   // upadte the evnt:
   eventRouter.patch("/updateEvent/:eventId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(eventSchema.checkId),bodyValidation(eventSchema.upadteEventSchema),uploadingFileRequets().any(),eventsController.updateEvent);
   // get  all the events and make filter also:
   eventRouter.get("/getAllEventsOrByFilter",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(eventSchema.getFilter),queryValidation(eventSchema.getFilterOnDate),eventsController.getAllEventsAndFilter);
   // get the sp students with all his events:
   eventRouter.get("/getSpUserWithAllEvents",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(eventSchema.getSpStudentWithAllEvents),eventsController.getSpChildrenWithEvenst);
   //get the sp event with all the information:
   eventRouter.get("/getEventWithAllInf",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(eventSchema.getEvetsByName),eventsController.getSpEvent);
   //upadte the state of the pay for child:(not completed):
   eventRouter.patch("/updatePayState",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(eventSchema.updatePayState),eventsController.updatePayState)
   ////////////////////////////////////////////////////////////////
   // children opertion:
   // show all events to the parent:
   eventRouter.get("/getAllEventsToPaernt",authentecatedChildren,queryValidation(eventSchema.getStateForReserve),eventsController.getAllEvemtsForParemts);
   // reserve an event:
   eventRouter.patch("/reserveATicket/:eventId",authentecatedChildren,paramsValidation(eventSchema.checkId),eventsController.joinToEvent)
   // delete join to an event:
   eventRouter.delete("/removeMyReservation/:eventId",authentecatedChildren,paramsValidation(eventSchema.checkId),eventsController.removeMyReservation)
   // show all the events you joined to:
   eventRouter.get("/getAllEventsIAttended",authentecatedChildren,eventsController.getMyAttendedEvents);
export default eventRouter;