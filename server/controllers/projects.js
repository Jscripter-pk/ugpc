const Projects = require('../models/projects');
const Users = require('../models/users');
const mongoose = require('mongoose');
const {sendEmail} = require("../helpers");
const moment = require('moment');
const _ = require('lodash');

exports.getAllProjects = (req, res)=>{
    Projects.find()
        .populate('students','_id name')
        .then(projects => {
            res.json(projects);
        })
        .catch(err => res.status(400).json({error:err}))
};
exports.findByStudentId = (req,res,next,id)=>{

    Projects.find({students:id})
        .populate('students','_id name department student_details')
        .populate('documentation.visionDocument.comments.author','_id name role department')
        .populate('details.supervisor','_id name supervisor_details.position')
        .populate('details.backlog.assignee', '_id name department student_details')
        .populate('details.backlog.createdBy', 'name')
        .populate({path:'details.sprint.todos.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.todos.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.inProgress.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.inProgress.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.inReview.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.inReview.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.done.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.done.createdBy',model:'Users',select:'name'})
        .then(project => {
            req.project = project[0];
            next()
        })
        .catch(err => {
            res.status(400).json({error:err});
            next();
        })
};
exports.findByProjectId = (req,res,next,id)=>{

    Projects.findById(id)
        .populate('students','_id name department student_details')
        .populate('documentation.visionDocument.comments.author','_id name role department')
        .populate('details.supervisor','_id name supervisor_details.position')
        .populate('details.backlog.assignee', '_id name department student_details')
        .populate('details.backlog.createdBy', 'name')
        .populate({path:'details.sprint.todos.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.todos.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.inProgress.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.inProgress.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.inReview.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.inReview.createdBy',model:'Users',select:'name'})
        .populate({path:'details.sprint.done.assignee',model:'Users',select:'name department student_details email'})
        .populate({path:'details.sprint.done.createdBy',model:'Users',select:'name'})
        .then(project => {
            req.project = project;
            next()
        })
        .catch(err => {
            res.status(400).json({error:err});
            next();
        })
};
exports.createProject = (req, res) => {

    const project = new Projects(req.body);
    project.save()
        .then(data => res.json(data))
        .catch(err => res.json({error:err}))
};


exports.assignSupervisor = async (req,res)=>{
    try {
        const {projectId,title} = req.body;
        //Finding Supervisor with minimum Numbers of Projects
        const supervisors =await Users.aggregate([
            {$match:{"role":'Supervisor'}},
            {
                $project:{
                    email:1,
                    name:1,
                    projectsCount:{
                        $cond: {
                            if: {
                                $isArray: "$supervisor_details.projects"
                            }, then: {
                                $size: "$supervisor_details.projects"
                            }, else: "0"
                        }}
                }
            },
            {$sort:{projectsCount: -1}},
            {
                $group:{
                    "_id":"$projectsCount",
                    details:{$push:"$$ROOT"},
                }
            },
        ]);

        //Choosing Supervisor Randomly from minimum Numbers
        if (supervisors.length === 0){
            await res.json({error:'Seems like no Supervisor has been registered Yet!'})
        }
        const supervisor = await _.sample(supervisors[0].details);

        //Assigning Supervisor-Updating Project
        const project =await Projects.findOneAndUpdate(projectId,
            {"details.supervisor":supervisor._id},
            {new:true}
            ).populate('students','-_id email student_details.regNo')
            .populate({path:'details.supervisor',model:'Users',select:'name supervisor_details.position'})
            .select('students title details.supervisor');
        const studentEmails =await project.students.map(student => student.email);

        //Adding Project to Supervisor Details
        const a = await Users.updateOne({_id:supervisor._id},{
            $push:{
                "supervisor_details.projects":{
                    project:projectId,
                    title
                }
            }
        })

        //Sending Emails

        const supervisorEmailData = {
            from: "noreply@node-react.com",
            to: supervisor.email,
            subject: "Project Assigned | Supervision",
            text: `Dear Supervisor,\nProject named as ${title} And students with Registration Numbers: ${project.students.map(student => student.student_details.regNo)}, is assign to You`,
            html: `
                <p>Dear Supervisor,</p>
                <p>The Project named as: ${title}</p>
                <p>And students with Registration Numbers:</p>
                ${project.students.map(student => `<p>${student.student_details.regNo}</p>`)}
                <p>is assigned to you for supervision</p>
                <br/>
                <p>Regards!</p>
            `
        };
        const studentsEmailData = {
            from: "noreply@node-react.com",
            to: studentEmails,
            subject: "Supervisor Assigned",
            text: `Dear Student,\n Name: ${supervisor.name}\n email:${supervisor.email}\n is assigned to your Project as a Supervisor`,
            html: `
                <p>Dear Student,</p>
                <p><b>Name: </b> ${supervisor.name}</p>
                <p><b>Email: </b> ${supervisor.email}</p>
                <p>is Assigned to your Project as a Supervisor </p>
            `
        };
        await sendEmail(supervisorEmailData);
        await sendEmail(studentsEmailData);
        await res.json({success:'Assigned',supervisor:project.details.supervisor})
    }
    catch (e) {
        await res.json({error:e.message})
    }

};

exports.generateAcceptanceLetter = async (req, res)=>{
    const {projectId,regNo} = req.body;
    const date = Date.now();
    const estimatedDeadline =  moment(date).add(4,'M').add(1,'d').startOf('d');
    const result= await Projects.updateOne(
        {"_id":projectId},
        {
            $set:{
                "details.acceptanceLetter":{
                        name:`${regNo}.pdf`,
                        issueDate:date
                    },
                "details.estimatedDeadline":estimatedDeadline
            }
        }
        );
    if (result.ok){
        await res.json({issueDate:date})
    }
};

exports.fetchFinalDocumentationsBySupervisor = async (req,res)=>{
    try {
        const {supervisorId} = req.params;
        const result = await Projects.find({"details.supervisor":supervisorId})
            .select('documentation.finalDocumentation documentation.visionDocument.title documentation.visionDocument.status students details.estimatedDeadline department')
            .populate('students','name student_details');
        await res.json(result)
    }catch (e) {
        await res.json(e.message)
    }
};

exports.changeFDStatus = async (req,res)=>{
    try {
        console.log('change Status');
        const {status,projectId,documentId,comment} = req.body;
        const result = await Projects.findOneAndUpdate({"_id":projectId,"documentation.finalDocumentation._id":documentId},
            {
                $set:{
                    "documentation.finalDocumentation.$.status":status,
                }
            })
            .select('students')
            .populate('students','email')
        //Sending Emails
        const emails = await result.students.map(student => student.email);
        const studentEmailData = {
            from: "noreply@node-react.com",
            to: emails,
            subject: "Final Documentation Status Changed",
            text: `Dear Student,\nYour Final Documentation status has changed to ${status},\nRegards`,
            html: `
                <p>Dear Student,</p>
                <p>Your Final Documentation status has changed to <b>${status}</b></p>
                ${comment !== undefined ? `<p><b>Comments:</b> ${comment}</p>` :''}
                <br/>
                <p>Regards!</p>
            `
        };
        await sendEmail(studentEmailData);
        await res.json({message:'Success'})
    }catch (e) {
        await res.json(e.message)
    }
};

exports.fetchForEvaluation = async (req,res) =>{
    try {
        const {committees} = req.query;
        const result = await Projects.aggregate([
            {$match:{"department":{$in:committees}}},
            {$unwind:"$documentation.visionDocument"},
            {$match:{
                $or:[{"documentation.visionDocument.status":'Approved'},{"documentation.visionDocument.status":'Approved With Changes'}]
                }
            },
            {
                $project:{
                    "department":1,
                    "documentation.visionDocument.title":1,
                    "documentation.finalDocumentation":1,
                    "details.internal":1,
                    "details.external":1,
                    "details.supervisor":1
                }
            },
            {$unwind: "$documentation.finalDocumentation"},
            {
                $match:{
                    "documentation.finalDocumentation.status":{$nin:['Waiting for Approval','Approved']}
                }
            }
        ]);
        const projects = await Projects.populate(result,{path:"details.supervisor",model:'Users',select:"name supervisor_details.position"})
        await res.json(projects)
    }catch (e) {
        await res.json(e.message)
    }
};

exports.scheduleInternal = async (req,res)=>{
    try {
        const {venue,selectedDate,projectId,originalname,filename,title} = req.body;
        //Finding Supervisor with minimum Numbers of Projects
        const examiners =await Users.aggregate([
            {$match:{"ugpc_details.committeeType":'Evaluation'}},
            {
                $project:{
                    email:1,
                    name:1,
                    projectsCount:{
                        $cond: {
                            if: {
                                $isArray: "$ugpc_details.projects"
                            }, then: {
                                $size: "$ugpc_details.projects"
                            }, else: "0"
                        }}
                }
            },
            {$sort:{projectsCount: -1}},
            {
                $group:{
                    "_id":"$projectsCount",
                    details:{$push:"$$ROOT"},
                }
            },
        ]);

        //Choosing Supervisor Randomly from minimum Numbers
        if (examiners.length === 0){
            await res.json({error:'Seems like no Examiner has been registered Yet!'})
        }
        const examiner = await _.sample(examiners[0].details);

        //Assigning Supervisor-Updating Project
        const project =await Projects.findOneAndUpdate(projectId,
            {
                "details.internal.examiner":examiner._id,
                "details.internal.date":selectedDate
            },
            {new:true}
        ).populate('students','-_id email student_details.regNo')
            .populate({path:'details.internal.examiner',model:'Users',select:'name ugpc_details.position'})
            .select('students title details.supervisor');
        const studentEmails =await project.students.map(student => student.email);

        //Adding Project to Supervisor Details
        const a = await Users.updateOne({_id:examiner._id},{
            $push:{
                "ugpc_details.projects":{
                    project:projectId,
                    title
                }
            }
        });

        //Sending Emails

        const examinerEmailData = {
            from: "noreply@node-react.com",
            to: examiner.email,
            subject: "Project Assigned | Internal Evaluation",
            text: `Dear Examiner,\nProject named as ${title} And students with Registration Numbers: ${project.students.map(student => student.student_details.regNo)}, is assign to You for Internal Evaluation`,
            html: `
                <p>Dear Examiner,</p>
                <p>The Project named as: ${title}</p>
                <p>And students with Registration Numbers:</p>
                ${project.students.map(student => `<p>${student.student_details.regNo}</p>`)}
                <p>is assigned to you for Internal Evaluation, venue and date is given below.</p>
                <br/>
                <p><b>Venue: </b>${venue}</p>
                <p><b>Date: </b> ${moment(selectedDate).format('MMM DD, YYYY')}</p>
                <p>Regard!</p>
            `,
            attachments:[{filename:originalname,path:`${process.env.CLIENT_URL}/static/pdf/${filename}`}]
        };
        const studentsEmailData = {
            from: "noreply@node-react.com",
            to: studentEmails,
            subject: "Internal Scheduled",
            text: `Dear Student,\n Name: ${examiner.name}\n email:${examiner.email}\n is assigned to your Project as an Internal Examiner`,
            html: `
                <p>Dear Student,</p>
                <p><b>Name: </b> ${examiner.name}</p>
                <p><b>Email: </b> ${examiner.email}</p>
                <p>is Assigned to your Project as an Internal Examiner. Venue and Date is given below.</p>
                <br/>
                <p><b>Venue: </b>${venue}</p>
                <p><b>Date: </b> ${moment(selectedDate).format('MMM DD, YYYY')}</p>
                <p>Regard!</p>
            `
        };
        await sendEmail(examinerEmailData);
        await sendEmail(studentsEmailData);
        await res.json({success:'Assigned',examiner:project.details.internal.examiner})
    }catch (e) {
        await res.json({error:e.message})
    }
};
exports.scheduleExternal = async (req,res)=>{
    try {
        const {venue,selectedDate,projectId,originalname,filename,title} = req.body;
        //Finding Supervisor with minimum Numbers of Projects
        const examiners =await Users.aggregate([
            {$match:{"ugpc_details.committeeType":'Evaluation'}},
            {
                $project:{
                    email:1,
                    name:1,
                    projectsCount:{
                        $cond: {
                            if: {
                                $isArray: "$ugpc_details.projects"
                            }, then: {
                                $size: "$ugpc_details.projects"
                            }, else: "0"
                        }}
                }
            },
            {$sort:{projectsCount: -1}},
            {
                $group:{
                    "_id":"$projectsCount",
                    details:{$push:"$$ROOT"},
                }
            },
        ]);

        //Choosing Supervisor Randomly from minimum Numbers
        if (examiners.length === 0){
            await res.json({error:'Seems like no Examiner has been registered Yet!'})
        }
        let examiner = {};
        let internal = {};
        do {
             examiner = await _.sample(examiners[0].details);
             internal = await Projects.findOne(projectId)
                 .select('details.internal.examiner')
        }while (examiner._id !== internal.details.internal.examiner)

        //Assigning ExternalExaminer-Updating Project
        const project =await Projects.findOneAndUpdate(projectId,
            {
                "details.internal.examiner":examiner._id,
                "details.internal.date":selectedDate
            },
            {new:true}
        ).populate('students','-_id email student_details.regNo')
            .populate({path:'details.internal.examiner',model:'Users',select:'name ugpc_details.position'})
            .select('students title details.supervisor');
        const studentEmails =await project.students.map(student => student.email);

        //Adding Project to Examiner Details
        const a = await Users.updateOne({_id:examiner._id},{
            $push:{
                "ugpc_details.projects":{
                    project:projectId,
                    title
                }
            }
        });

        //Sending Emails

        const examinerEmailData = {
            from: "noreply@node-react.com",
            to: examiner.email,
            subject: "Project Assigned | Internal Evaluation",
            text: `Dear Examiner,\nProject named as ${title} And students with Registration Numbers: ${project.students.map(student => student.student_details.regNo)}, is assign to You for Internal Evaluation`,
            html: `
                <p>Dear Examiner,</p>
                <p>The Project named as: ${title}</p>
                <p>And students with Registration Numbers:</p>
                ${project.students.map(student => `<p>${student.student_details.regNo}</p>`)}
                <p>is assigned to you for Internal Evaluation, venue and date is given below.</p>
                <br/>
                <p><b>Venue: </b>${venue}</p>
                <p><b>Date: </b> ${moment(selectedDate).format('MMM DD, YYYY')}</p>
                <p>Regard!</p>
            `,
            attachments:[{filename:originalname,path:`${process.env.CLIENT_URL}/static/pdf/${filename}`}]
        };
        const studentsEmailData = {
            from: "noreply@node-react.com",
            to: studentEmails,
            subject: "Supervisor Assigned",
            text: `Dear Student,\n Name: ${examiner.name}\n email:${examiner.email}\n is assigned to your Project as an Internal Examiner`,
            html: `
                <p>Dear Student,</p>
                <p><b>Name: </b> ${examiner.name}</p>
                <p><b>Email: </b> ${examiner.email}</p>
                <p>is Assigned to your Project as an Internal Examiner. Venue and Date is given below.</p>
                <br/>
                <p><b>Venue: </b>${venue}</p>
                <p><b>Date: </b> ${moment(selectedDate).format('MMM DD, YYYY')}</p>
            `
        };
        await sendEmail(examinerEmailData);
        await sendEmail(studentsEmailData);
        await res.json({success:'Assigned',examiner:project.details.external.examiner})
    }catch (e) {
        await res.json({error:e.message})
    }
};