import { Router } from "express";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as childrenController from './children.controller.js';
import * as childSchema from './children.schema.js';
import { authentecatedChildren } from "./children.authentecation.js";
import paramsValidation from "../../middleWare/validation/params.validation.js";
import uploadingFileRequets from "../../utils/uploadingFile.js";
import aplogizeRoueter from "../aplogizes/apogize.routes.js";
import eventRouter from "../events/events.routes.js";
import mealsRouter from "../meals/meals.routes.js";
const childRouter=Router({mergeParams:true});
childRouter.use("/aplogizes",aplogizeRoueter);
childRouter.use("/events",eventRouter);
childRouter.use("/meals",mealsRouter);
// this children api's:
// login api for children:
childRouter.post("/login",bodyValidation(childSchema.loginSchema),childrenController.login)
// get the profile of the user:
childRouter.get("/getProfile",authentecatedChildren,childrenController.getProfile);
// update specefiec data:
childRouter.patch("/updateEmail",authentecatedChildren,bodyValidation(childSchema.updateSpData),childrenController.upadateEmail)
// activate the account:
childRouter.get("/activateEmail/:email",paramsValidation(childSchema.activeAccount),childrenController.activateEmail)
// update phone:
childRouter.patch("/updatePhone",authentecatedChildren,bodyValidation(childSchema.updatePhone),childrenController.updatePhone);
// update password:
childRouter.patch("/updatePassword",authentecatedChildren,bodyValidation(childSchema.updatePassword),childrenController.updatePassword)
// forget password:
childRouter.patch("/forgetPassword",bodyValidation(childSchema.forgetPasswordSchema),childrenController.forgetPassword)
//get the code for forget pass:
childRouter.patch("/setFotrgetPass",bodyValidation(childSchema.getForgetCodeSchema),childrenController.getCodeForForgetPass);
// set profile oicture for the child:
childRouter.patch("/setProfilePicture",authentecatedChildren,uploadingFileRequets().single("profilePicture"),childrenController.setProfilePicture)
export default childRouter;