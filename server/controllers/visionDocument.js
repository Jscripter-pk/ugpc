const Projects = require('../models/projects');
const Users = require('../models/users');
const mongoose = require('mongoose')
const {sendEmail} = require("../helpers");
const moment = require('moment');
const _ = require('lodash');
exports.fetchVisionDocsByCommitteeCoordinator =async (req, res)=>{
    try {
        const {committees} = req.query;
        const dep = committees.split(',');
        const results= await Projects.aggregate([
            {$match:{department:{$in:dep}}},
            {$project:{students: 1,"documentation.visionDocument":1,title:1,"details.acceptanceLetter":1,"details.supervisor":1,"details.marks":1}},
            {$unwind:"$documentation.visionDocument"},
            {
                $group:{
                    "_id":{status:"$documentation.visionDocument.status"},
                    projects:{$push:"$$ROOT"}
                }
            },
            {$sort:{"documentation.visionDocument.updatedAt":1}}
        ]);
        const result = await Projects.populate(results,[
            {path:"projects.students",model:'Users',select:'_id name department student_details.regNo profileImage'},
            {path:"projects.documentation.visionDocument.comments.author",model:'Users',select:'_id name role department profileImage'},
            {path:"projects.details.supervisor",model:'Users',select:'_id name supervisor_details.position'}
        ])

        await res.json(result)
    }
    catch(err){
        res.status(400).json(err.message)
    }
};
exports.fetchBySupervisor = async (req,res)=>{
    try {
        const {supervisorId} = req.params;

        const results= await Projects.aggregate([
            {$match:{"details.supervisor":mongoose.Types.ObjectId(supervisorId)}},
            {$project:{students: 1,"documentation.visionDocument":1,title:1,"details.acceptanceLetter":1,"details.supervisor":1,"details.marks":1}},
            {$unwind:"$documentation.visionDocument"},
            {
                $match:{$or:[{"documentation.visionDocument.status":"Approved"},{"documentation.visionDocument.status":"Approved With Changes"}]}
            },
            {$sort:{"documentation.visionDocument.updatedAt":1}}
        ]);
        const result = await Projects.populate(results,[
            {path:"students",model:'Users',select:'_id name department student_details.regNo'},
            {path:"documentation.visionDocument.comments.author",model:'Users',select:'_id name role department profileImage'},
            {path:"details.supervisor",model:'Users',select:'_id name supervisor_details.position'}
        ]);

        await res.json(result)
    }
    catch(err){
        res.status(400).json(err.message)
    }
}
exports.commentOnVision = (req, res) =>{
    const {text, projectId,documentId,author} = req.body;
    Projects.update(
        {"_id":projectId, "documentation.visionDocument._id":documentId},
        {
            $push:{
                "documentation.visionDocument.$.comments":{
                    text:text,
                    createdAt:Date.now(),
                    author:author
                }
            }
        }
    ).then(result => {
        res.json(result)
    })
        .catch(err => res.json(err))
}

exports.changeStatus =async (req, res)=>{
    try {
        const {status, projectId,documentId} = req.body;
        const result = await Projects.findOneAndUpdate(
            {"_id":projectId, "documentation.visionDocument._id":documentId},
            {
                $set:{
                    "documentation.visionDocument.$.status":status,
                    "documentation.visionDocument.$.updatedAt":Date.now()
                }
            }
        )
            .select('students')
            .populate('students','email');
        const emails = await result.students.map(student => student.email);
        const studentEmailData = {
            from: "noreply@node-react.com",
            to: emails,
            subject: "Project Status Changed",
            text: `Dear Student,\nYour Project's status has changed to ${status},\nRegards`,
            html: `
                <p>Dear Student,</p>
                <p>Your Project's status has changed to <b>${status}</b></p>
                <br/>
                <p>Learn About Project's Statuses:</p>
                <p><b>Waiting for Initial Approval:</b> Your VisionDocument is submitted for initial approval to check its its scope and whether its being developed or not.</p>
                <p><b>Approved for Meeting:</b> Your VisionDocument is accepted for Meeting.</p>
                <p><b>Meeting Scheduled:</b> Your Project's defence meeting is scheduled.</p>
                <p><b>Approved:</b> Your Project is approved by Defence Committee.</p>
                <p><b>Approved With Changes:</b> Your Project is approved by Defence Committee but with changes.</p>
                <p><b>Rejected:</b> Your is Rejected by Defence Committee or Committee Coordinator.</p>
                <br/>
                <p>Regards!</p>
            `
        };
        await sendEmail(studentEmailData);
        await res.json(result)
    }catch (e) {
        await res.json({error:e.message})
    }

}

exports.scheduleVisionDefence = async (req,res)=>{
    try {
        const {projectIds,visionDocsIds,date,venue} = req.body;
        const pIds = projectIds.map(id => mongoose.Types.ObjectId(id));
        const result = await Projects.updateMany(
            {"_id":{$in:projectIds},"documentation.visionDocument._id":{$in:visionDocsIds}},
            {
                $set:{
                    "documentation.visionDocument.$.status":'Meeting Scheduled',
                    "documentation.visionDocument.$.updatedAt":Date.now(),
                    "documentation.visionDocument.$.meetingDate":date,
                    "documentation.visionDocument.$.venue":venue,
                }
            }
        );
        const studentsResult = await Projects.aggregate([
            {$match:{"_id":{$in:pIds}}},
            {$project:{"_id":-1,students:1}},
        ]);
        const students = await Projects.populate(studentsResult,{path:"students",select:'-_id email'});
        let emails =[];
        await students.map(student => student.students.map(e=>{emails=[...emails,e.email]}));

        //Sending Email

        const emailData = {
            from: "noreply@node-react.com",
            to: emails,
            subject: "Proposal Defence Schedule",
            text: `Dear Student,\nYour Proposal Defence is scheduled on ${moment(date).format('LLL')}.\nYou need to upload Your presentation in ppt/pptx before ${moment(date).format('LLL')}.\nNote:Please be on time otherwise you will be placed at the end of the list`,
            html: `
                <p>Dear Student,</p>
                <p>Your Proposal Defence is Scheduled, please see details section for data and venue .</p>
                <p>You need to upload Your presentation in ppt/pptx before ${moment(date).format('LLL')}</p>
                <p><b>Details:</b></p>
                <p>Venue: ${venue}</p>
                <p>On: ${moment(date).format('LLL')}</p>
                <p><b>Note:</b>Please be on time otherwise you will be placed at the end of the list</p>
                </br>
                <p>Regards</p>
            `
        };

        sendEmail(emailData)
            .then(()=>{
                return  res.json({message:'Success'})
            });
    }
    catch (e) {
        await res.json({error:e.message})
    }


};

exports.fetchMeetings =async (req,res)=>{
    const {committees} = req.query;
    const dep = committees.split(',');
    const projectsResult = await Projects.aggregate([
        {
            $match:{"department":{$in:dep}}
        },
        {
            $unwind:"$documentation.visionDocument"
        },
        {$project:{students: 1,"documentation.visionDocument":1,title:1,"details.acceptanceLetter":1,"details.supervisor":1,"details.marks":1}},

        {
            $group:{
                "_id":"$documentation.visionDocument.meetingDate",
                projects:{$push:"$$ROOT"}
            }
        },
    ]);
    const projects =await Projects.populate(projectsResult,[
        {path:'projects.students',model:'Users',select:'-_id name department student_details.regNo profileImage'},
        {path:"projects.documentation.visionDocument.comments.author",model:'Users',select:'_id name role department profileImage'},
        {path:"projects.details.supervisor",model:'Users',select:'_id name supervisor_details.position'}
    ]);
    await res.json(projects)
};
exports.addMarks = async (req,res)=>{
    try {
        const {marks,projectId} = req.body;
        const result = await Projects.update({"_id":projectId},{
            $set:{
                "details.marks.visionDocument":marks
            }

        })

        if(result.ok){
            await res.json({message:"Marks Added"})
        }
    }
    catch (e) {
        res.status(400).json(e.message)
    }

};
exports.fetchVisionDocsPieData = async (req,res) =>{
    try {
        const {committees} = req.query;
        const dep = committees.split(',');
        const result = await Projects.aggregate([
            {
                $match: { "department":{$in:dep}}
            },
            {
                $unwind:"$documentation.visionDocument"
            },
            {
                $project:{"documentation.visionDocument.status":1}
            },
            {
                $group:{
                    "_id":"$documentation.visionDocument.status",
                    visionDocs:{$sum:1}
                }
            }
        ]);

        await res.json(result)


    }catch (e) {
        await res.json({error:e.message})
    }
}