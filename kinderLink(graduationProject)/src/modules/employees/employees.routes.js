import e, { Router } from "express";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as employeeeSchema from './employees.schema.js';
import * as employeeController from './employees.controller.js';
import paramsValidation from "../../middleWare/validation/params.validation.js";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import uploadingFileRequets from './../../utils/uploadingFile.js';
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import queryValidation from "../../middleWare/validation/query.validation.js";
import reviewRequestsRouter from "../reviewRequests/reviewRequest.routes.js";
import empModel from "../../../db/models/employees/employess.model.js";
import groupRouter from "../groups/groups.routes.js";
import aplogizeRoueter from "../aplogizes/apogize.routes.js";
import eventRouter from "../events/events.routes.js";
import mealsRouter from "../meals/meals.routes.js";
const employeeeRouter=Router({mergeParams:true});
// revieweing requests router:
employeeeRouter.use("/reviewRequest",reviewRequestsRouter);
// navigate to the groupsCreation:
employeeeRouter.use("/groups",groupRouter);
// naviagte tot the aplogizes to busSupervisor:
employeeeRouter.use("/aplogizesForBusSupervisor",aplogizeRoueter);
// events routes:
employeeeRouter.use("/events",eventRouter);
// meals routes:
employeeeRouter.use("/meals",mealsRouter);
// add an new employee:
employeeeRouter.post("/addEmployee",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(employeeeSchema.addEmployeeSchema),employeeController.addEmployee);
// activate the account:
employeeeRouter.get("/ActivateEmployee/:email",paramsValidation(employeeeSchema.ActiveAccountSchema),employeeController.actiavteAccount);
// login to al employeees:
employeeeRouter.post("/login",bodyValidation(employeeeSchema.login),employeeController.loginEmployee)
// upate the password of the account:
employeeeRouter.patch("/updatePassword",bodyValidation(employeeeSchema.updatePasswordSchema),authnetecatedEmployee,employeeController.updatePassword);
// foregt the password:
employeeeRouter.patch("/forgetPassword",bodyValidation(employeeeSchema.forgetPassword),employeeController.forgetPassword);
// get the code for the forget password:
employeeeRouter.patch("/getCode",bodyValidation(employeeeSchema.getCodeOfForget),employeeController.getCodeOfForget);
// update profile picture of employee:
employeeeRouter.patch("/updateProfilePhoto",authnetecatedEmployee,uploadingFileRequets().single("profilePicture"),employeeController.updateProfilePucture);
// delete the acocun tof the employeee:
employeeeRouter.delete("/deleteEmployee/:employeeId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(employeeeSchema.deleteAccount),employeeController.deleteAccount);
// update the data of the employee: save who updated it:
employeeeRouter.patch("/updateDataOfUser/:employeeId",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(employeeeSchema.updateSpDataOfUser),paramsValidation(employeeeSchema.deleteAccount),employeeController.updateDataEmployee);
// get an specefiec employee for admin to watch his profile:
employeeeRouter.get("/SpEmployeeByPhoneByName",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(employeeeSchema.getEmployeeForAdmin),employeeController.searchOnEmployeeforAdmin);
// get all the employyes by the role or not:
employeeeRouter.get("/getAllEmployee",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(employeeeSchema.getEmplyeesRole),employeeController.getEmployeeRole);
// get an specefeic data fo rthe admin:
employeeeRouter.get("/getSpEmployee/:employeeId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(employeeeSchema.deleteAccount),employeeController.getSpEmployee);
// add note for employeees(admin):
employeeeRouter.post("/addNote",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(employeeeSchema.addNote),employeeController.addNote);
// get the user profile with all notes:
employeeeRouter.get("/employeeProfile",authnetecatedEmployee,employeeController.getMyProfileUser);
// get the profile of admin with his notes:
employeeeRouter.get("/getAdminProfile",authnetecatedEmployee,authorizedEmployee("admin"),employeeController.getProfileAdmin);
// update the (state of seen ) to treu fro the notes:
employeeeRouter.patch("/updateSeenNote",authnetecatedEmployee,bodyValidation(employeeeSchema.updateSteteNote),employeeController.updateNoteSeen);
// update the conetnt of the note:
employeeeRouter.patch("/updateContentNote/:idNote",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(employeeeSchema.upadteContentNote),paramsValidation(employeeeSchema.noteId),employeeController.updateContentNote);
// delete an note (admin):
employeeeRouter.delete("/deleteNote",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(employeeeSchema.note),employeeController.deleteNote);
// logout for all employeees:
employeeeRouter.get("/logoutEmployee",authnetecatedEmployee,employeeController.logout);
// get requests to the admin to watch it without any actions on it:
employeeeRouter.get("/getRequests",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(employeeeSchema.getRequestsAdmin),employeeController.getRequestAdmin);
// get an specefiec reuqest for and admin:
employeeeRouter.get("/getSpRequestForAdmin/:requestId",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(employeeeSchema.getByNameRequet),paramsValidation(employeeeSchema.getASpsRequets),employeeController.getSpRequetForAdmin);
// updatt he pin code for any employees by the admin:
employeeeRouter.patch("/updatePinCode/:employeeId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(employeeeSchema.getIdOfEmployee),employeeController.upadatePinCodeForEmployee)
// get an specefiec requests by email only on every states:
employeeeRouter.get("/getAllRequestsInDifferentStates",authnetecatedEmployee,authorizedEmployee("admin"),employeeController.getRequests);
// get the information abdout the employees and thier work
   // this ithe api to show all the requests and the total of the requests  in a specefiedc month that beeen confirmed and how mush does the requests accepted nd rejected (analysis):
   employeeeRouter.get("/getAnalysis",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(employeeeSchema.getAnalysis),employeeController.getAnalysis);
   // this api that get the numnber of a specefiec employee of the number of requests that he has reviewed or interviewed:
   employeeeRouter.get("/getAnalysisForSpecefiecEmployee/:employeeId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(employeeeSchema.anlaysisEmployee),employeeController.anlayseSpEmployee);
// get the supervisor groups and the students in this group:
   // we should now can make  a virtual populate then do it:
employeeeRouter.get("/getSupervisorGroupAndChildren",authnetecatedEmployee,authorizedEmployee("supervisor"),employeeController.getSupervisorGroupAndStudent);
// get the group for specefiec busSupervisor:
employeeeRouter.get("/getSpBusForBusSupervisor",authnetecatedEmployee,authorizedEmployee("busSupervisor"),employeeController.getBusSuperviosr);
export default employeeeRouter;