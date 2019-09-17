import React, {useReducer, useEffect} from 'react';
import VisionDocsContext from './visionDocs-context';
import {visionDocsReducer} from "./visionDocsReducer";
import {
    getDocsByCommittee,
    commentOnVision,
    changeStatusAction,
    scheduleVisionDefenceAction,
    submitAdditionFilesVisionDocAction,
    addMarksAction,
    generateAcceptanceLetterAction,
    assignSupervisorAction
} from "./ActionCreators";
import {assignSupervisorAutoAPI, generateAcceptanceLetterAPI} from "../../utils/apiCalls/projects";
import {changeStatusAPI} from "../../utils/apiCalls/visionDocs";

const VisionDocsState = (props) => {
    const [state, dispatch] = useReducer(visionDocsReducer,{
        isLoading:true,
        errMess:null,
        visionDocs:[]
    });
    const fetchByCommittee =async ()=>{
         return await getDocsByCommittee(dispatch);
    };
    const comment = async comment =>{
        return await commentOnVision(comment);
    }
    const changeStatus = async status =>{
        const res =await changeStatusAPI(status);
        await getDocsByCommittee(dispatch);
        return await res;
    };
    const scheduleVisionDefence = async data =>{

        return await scheduleVisionDefenceAction(data,dispatch);
    };
    const submitAdditionFilesVisionDoc = async (formData,type) =>{
        return await submitAdditionFilesVisionDocAction(formData,type,dispatch);
    };
    const addMarks = async (marks,projectId) =>{
        return await addMarksAction(marks,projectId,dispatch);
    };
    const generateAcceptanceLetter = async (projectId,regNo) =>{
        const result = await generateAcceptanceLetterAPI(projectId,regNo);
        dispatch(generateAcceptanceLetterAction(projectId,await result.issueDate,regNo))
        return await result;
    };
    const assignSupervisorAuto = async (projectId,title)=>{
        console.log('Title',title);
        const result = await assignSupervisorAutoAPI(projectId,title);
        dispatch(assignSupervisorAction(projectId,await result.supervisor));
        return await result
    }
useEffect(()=>{
    console.log('Vision Docs State:',state)
},[state])
    return (
        <VisionDocsContext.Provider value={{
            visionDocs:state,
            fetchByCommittee,
            comment,
            changeStatus,
            scheduleVisionDefence,
            submitAdditionFilesVisionDoc,
            addMarks,
            generateAcceptanceLetter,
            assignSupervisorAuto
        }}>
            {props.children}
        </VisionDocsContext.Provider>
    );
};

export default VisionDocsState;