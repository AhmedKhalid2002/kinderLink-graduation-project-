import { Router } from "express";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import * as reviewController from './reviewRequest.controller.js';
import * as reviewSchema from './reviewRequest.schema.js';
import queryValidation from "../../middleWare/validation/query.validation.js";
import authnetecatedEmployee from './../../middleWare/auth/employeee.auth.js';
import paramsValidation from "../../middleWare/validation/params.validation.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
const reviewRequestsRouter=Router({mergeParams:true});
// evaluator api's:
   // get the al the request that the state is underReviewing from the collection request model:
   reviewRequestsRouter.get("/getRequestsToEvaluator",authnetecatedEmployee,authorizedEmployee("evaluator"),reviewController.getEvaluatorRequestsAll);
   // get an sp request by the email thta you want:
   reviewRequestsRouter.get("/getSpRequestToEvaluator",authnetecatedEmployee,authorizedEmployee("evaluator"),queryValidation(reviewSchema.getRequestByEmailToEvaluator),reviewController.getSpRequestByEmail);
   // review by the avaluator  now:
   reviewRequestsRouter.patch("/reviewByEvalauator/:requestId",authnetecatedEmployee,authorizedEmployee("evaluator"),paramsValidation(reviewSchema.requestIdSchema),bodyValidation(reviewSchema.requestRevieingByEvalSchema),reviewController.reviewRequestByEvaluator);
   // get  all the requests revieweed by an eva:s
   reviewRequestsRouter.get("/getRequestsRevBySpEval",authnetecatedEmployee,authorizedEmployee("evaluator"),reviewController.getAllThatTherqeuestsThatReviesedByEV);
    // upadte the sp waiting reuets by the evaluator:
    reviewRequestsRouter.patch("/updateWitingState/:requestId",authnetecatedEmployee,authorizedEmployee("evaluator"),paramsValidation(reviewSchema.requestIdSchema),bodyValidation(reviewSchema.updateWiatingState),reviewController.updateWaitingState)
// interviewer review:
   // get the requets that not have an interview time:
   reviewRequestsRouter.get("/notHaveTimeForInterviewer",authnetecatedEmployee,authorizedEmployee("interviewer"),reviewController.getAllNotHaveTime);
   // get all the request that have atime and wait for results:
   reviewRequestsRouter.get("/getAllRequetsThatHaveTimeForInterviewer",authnetecatedEmployee,authorizedEmployee("interviewer"),reviewController.getAllThatHaveInterviewTime);
   // get all the request sto the interviewrer that on the sp state:
   reviewRequestsRouter.get("/allIntervieweingStageForInterviewer",authnetecatedEmployee,authorizedEmployee("interviewer"),reviewController.getInterviewing)
   // get the requests spby the email:
   reviewRequestsRouter.get("/SpRequetsForInterviwer",authnetecatedEmployee,authorizedEmployee("interviewer"),queryValidation(reviewSchema.getSpForIntervierer),reviewController.getSpForInterviewer);
   // review the intervieweing:
   // set an interview time for the user:
   reviewRequestsRouter.patch("/setInterviewTime/:requestId",authnetecatedEmployee,authorizedEmployee("interviewer"),paramsValidation(reviewSchema.requestIdSchema),bodyValidation(reviewSchema.setInterviewTIme),reviewController.setInterviewTime);
   //update the interviewTime:
   reviewRequestsRouter.patch("/upadteTimeInterview/:requestId",authnetecatedEmployee,authorizedEmployee("interviewer"),paramsValidation(reviewSchema.requestIdSchema),bodyValidation(reviewSchema.setInterviewTIme),reviewController.updateInterviewTime);
   // reject the interview:
   reviewRequestsRouter.patch("/setInterviewResult/:requestId",authnetecatedEmployee,authorizedEmployee("interviewer"),paramsValidation(reviewSchema.requestIdSchema),bodyValidation(reviewSchema.rejectOrAcceptInterview),reviewController.rejectOrAcceptInterview);
   reviewRequestsRouter.get("/getAllIntreviewedRequestsForThisInterviewer",authnetecatedEmployee,authorizedEmployee("interviewer"),reviewController.getAllInterviewedRequests);
  
   // test this api's;
export default reviewRequestsRouter;