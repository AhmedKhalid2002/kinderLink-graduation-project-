import { Router } from "express";
import * as requestsSchema from './requests.schema.js';
import * as requetsController from './requests.controller.js';
import uploadingFileRequets from "../../utils/uploadingFile.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import paramsValidation from "../../middleWare/validation/params.validation.js";
import authentecatedParent from "../../middleWare/auth/parent.authentecation.js";
import reviewRequetsOrNot from "../../utils/checkIfItBeginReviewed.utils.js";

const requestsRouter=Router({mergeParams:true});
// make new requests:
requestsRouter.post("/makeRequest",uploadingFileRequets().fields([{name:"frontNationalId",maxCount:1},{name:"backNationalId",maxCount:1},{name:"birthCertificate",maxCount:1}]),bodyValidation(requestsSchema.addRequest),requetsController.addRequet);
// active the account the requests:
//  make the request:
requestsRouter.get("/activateAccount/:email",paramsValidation(requestsSchema.activationVaalidate),requetsController.activateEmail);
// login fro  the parent:
requestsRouter.post("/login",bodyValidation(requestsSchema.loginSchema),requetsController.loginParent);
// show results for the parent (must be authentecated):
requestsRouter.get("/requestResult",authentecatedParent,requetsController.getResult);
// updte the data:(not requeired an dthe email):
requestsRouter.patch("/updateRequetsData",authentecatedParent,reviewRequetsOrNot,bodyValidation(requestsSchema.upadateDataRequestAndEmail),requetsController.upadteRequetsAndEmail);
// update the national id
requestsRouter.patch("/updateNationalId",authentecatedParent,reviewRequetsOrNot,uploadingFileRequets().array("nationalId",2),requetsController.upadateNationalId);
// update the birth certificate:
requestsRouter.patch("/updateBirthCertificate",authentecatedParent,reviewRequetsOrNot,uploadingFileRequets().single('birthCertificate'),requetsController.updateBirthCertificate);
// update password:
requestsRouter.patch("/forgetPassword",bodyValidation(requestsSchema.forgetPassSchema),requetsController.forgetPassword);
// egt the code of fordet the password:
requestsRouter.patch("/setCode",bodyValidation(requestsSchema.getCodeSchema),requetsController.getCode);
// update the password:
requestsRouter.patch("/updatePassword",authentecatedParent,bodyValidation(requestsSchema.updatePasswordSchema),requetsController.updatePassword);
//logged out:
requestsRouter.get("/logout",authentecatedParent,requetsController.logout);
// get the user profile:
requestsRouter.get("/getProfileUser",authentecatedParent,requetsController.getProfile)
// delete the requets accoint and make all the token is in valid:
requestsRouter.delete("/deleteRequest",authentecatedParent,requetsController.deleteRequet);
// add profile picture:
requestsRouter.patch("/addProfilePhoto",authentecatedParent,uploadingFileRequets().single("profilePicture"),requetsController.profilePicture)
export default requestsRouter;
//uploads/requests/jehad ahmed heshafdm abd elrazek/childBirthCertificate/uploads/requests/jehad ahmed heshafdm abd elrazek/childBirthCertificate/z8lupixevdze3gyuov0o