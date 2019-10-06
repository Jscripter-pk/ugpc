import React from "react";

export default React.createContext({
    isLoading:true,
    errMess:null,
    user:{},
    users:[],
    createUser: user => {},
    fetchUserById: () =>{},
    distributeMarks:marks=>{},
    removeUser: ()=>{},
    uploadProfileImage:image=>{},
    changeName:data=>{},
    changePassword:data=>{}
})