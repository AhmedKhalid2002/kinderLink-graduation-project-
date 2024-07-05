import { Router, query } from "express";
import authnetecatedEmployee from "../../middleWare/auth/employeee.auth.js";
import authorizedEmployee from "../../middleWare/authorization/employee.authrization.js";
import bodyValidation from "../../middleWare/validation/bodyValidation.js";
import * as groupController  from './groups.controller.js';
import * as groupSchema from './groups.schema.js';
import queryValidation from "../../middleWare/validation/query.validation.js";
import paramsValidation from "../../middleWare/validation/params.validation.js";
const groupRouter=Router({mergeParams:true});
// all the api's for the group creation:

// get all free syudents not in group or by the regions:
groupRouter.get("/getAllChildrenNotInGroup",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(groupSchema.getAllFreeStudentsInSpRegion),groupController.getAllFreeStudents);
//get all free supervisor:
groupRouter.get("/allFreeSupervisor",authnetecatedEmployee,authorizedEmployee("admin"),groupController.getAllFreeSupervisor)
//make a new group:
groupRouter.post("/makeGroup",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(groupSchema.addGroup),groupController.makeGroup);
//delete the group:
groupRouter.delete("/deleteGroup/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),groupController.deleteGroup);
//upadet the dta of the group:
groupRouter.patch("/updateGroup/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),bodyValidation(groupSchema.updateData),groupController.updateGroupData);
// update the groupSupervisor:
groupRouter.patch("/upadateGroupSupervisor/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),bodyValidation(groupSchema.upadteSupervisorGroup),paramsValidation(groupSchema.deleteGroupSchema),groupController.updateGroupSupervisor);
// make the grou withoyt supervoisor:
groupRouter.patch("/makeGroupWithoutSuperviosr/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),groupController.makeGroupWithoutSuperviosr);
// get all the gripus on the state of he t have a supervisor or that not have have a supervisor or if you not sending the query you will get all the groups:
groupRouter.get("/allGroupsForAdmin",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(groupSchema.getAllGroups),groupController.getAllGroups);
//assign a stubedts to the group:
groupRouter.patch("/assignChildrenTOGroup/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),bodyValidation(groupSchema.addStuents),groupController.assginChildrenToGroup);
// get all gropus by nane search:
groupRouter.get("/allGroupsFIlterByName",authnetecatedEmployee,authorizedEmployee("admin"),queryValidation(groupSchema.getAllByFilter),groupController.getAllByNameOrByFIlter)
// get sp group by id with all students and with all :
groupRouter.get("/getSpGroupWithAllDataAndStudents/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),groupController.getSpWithAllData)
// remove students from a sp group:
groupRouter.patch("/removeChildrenFromSpGroup/:groupId",authnetecatedEmployee,authorizedEmployee("admin"),paramsValidation(groupSchema.deleteGroupSchema),bodyValidation(groupSchema.removeChildrenFromGroup),groupController.removeChildren);
//
export default groupRouter;