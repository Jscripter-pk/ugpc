import fetch from "isomorphic-unfetch";
import {serverUrl} from "../config";
import {isAuthenticated} from "../../auth";

export const assignSupervisorAuto = async (projectId,title) =>{
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

export const generateAcceptanceLetter = async (projectId,regNo)=>{
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
}