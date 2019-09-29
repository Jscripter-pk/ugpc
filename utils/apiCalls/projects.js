import fetch from "isomorphic-unfetch";
import {serverUrl} from "../config";
import {isAuthenticated} from "../../auth";

export const assignSupervisorAutoAPI = async (projectId,title) =>{
    const res = await fetch(`${serverUrl}/projects/supervisor/assign`,{
        method:'PUT',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        },
        body:JSON.stringify({projectId,title})
    });
    return await res.json();
};

export const generateAcceptanceLetterAPI = async (projectId,regNo)=>{
    const res = await fetch(`${serverUrl}/projects/generate/acceptanceLetter`,{
        method:'PUT',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        },
        body:JSON.stringify({projectId,regNo})
    });
    return await res.json();
};
export const fetchFinalDocumentationsBySupervisorAPI = async ()=>{
    const res = await fetch(`${serverUrl}/projects/fetch/finalDocumentation/by/supervisor/${isAuthenticated().user._id}`,{
        method:'GET',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        }
    });
    return await res.json();
};
export const fetchForEvaluationProjectsAPI = async ()=>{
    const res = await fetch(`${serverUrl}/projects/fetch/forEvaluation?committees[]=${isAuthenticated().user.ugpc_details.committees}`,{
        method:'GET',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        }
    });
    return await res.json();
};

export const scheduleInternalAPI = async data =>{
    const res = await fetch(`${serverUrl}/projects/schedule/internal`,{
        method:'PUT',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        },
        body:JSON.stringify(data)
    });
    return await res.json();
};
export const scheduleExternalAPI = async data =>{
    const res = await fetch(`${serverUrl}/projects/schedule/external`,{
        method:'PUT',
        headers:{
            Accept:'application/json',
            "Content-Type":'application/json',
            Authorization:`Bearer ${isAuthenticated().token}`
        },
        body:JSON.stringify(data)
    });
    return await res.json();
};
