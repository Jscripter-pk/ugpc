import React from "react";

export default React.createContext({
    isLoading:true,
    errMess:null,
    project:{},
    createProject: data =>{},
    fetchByStudentId: id =>{},
    addTaskToBacklog: (projectId,task) => {},
    planSprint: data => {},
    updateProject: project=>{},
    removeProject: ()=>{},
    uploadVision:(data,projectId)=>{}
})