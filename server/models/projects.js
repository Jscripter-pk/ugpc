const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const projectsSchema = new mongoose.Schema({
    groupName:{
      type:String,
      required:true
    },
    students:[{type:ObjectId, ref:"Users"}],
    phase:{
        type:String,
        required: true
    },
    department:String,
    documentation:{
        visionDocument:[
            {
            title:String,
            abstract:String,
            scope:String,
            majorModules:[],
            status:String,
            documents:[],
            comments:[
                {
                    text:String,
                    createdAt: Date,
                    author:{type:ObjectId, ref:"Users"}
                }
            ],
            uploadedAt:Date,
            updatedAt:Date,
            meetingDate:Date
        }],
        finalDocumentation:[{
            uploadedAt:Date,
            status:String,
            document:{}
        }]
    },
    details:{
        marks:{
          visionDocument: String,
            supervisor:String,
          internal: String,
          external: String
        },
        createdAt:{
            type:Date,
            default: Date.now()
        },
        supervisor:{type:ObjectId, ref:"Users"},
        internal:{
            examiner:{type:ObjectId, ref:"Users"},
            date:Date,
        },
        external:{
            examiner:{type:ObjectId, ref:"Users"},
            date:Date,
        },
        acceptanceLetter:{
            name:String,
            issueDate:Date
        },
        estimatedDeadline:Date,
        backlog:[{
            title: String,
            description:String,
            assignee:[{
                type:ObjectId,
                ref:"Users"
            }],
            subTasks:[{
                title:String,
                description: String,
                status:String
            }],
            priority:String,
            createdAt:Date,
            createdBy:{
                type:ObjectId,
                ref:"Users"
            },
            status:String,
            storyPoints: String,
            attachments:[{}],
            discussion:[{
                text:String,
                createdAt: Date,
                author:{type:ObjectId, ref:"Users"}
            }]
        }],
        sprint:[{
            name:String,
            startDate:Date,
            endDate:Date,
            status:String,
            completedOn:Date,
            tasks:[]
        }]
    }

});


module.exports = mongoose.model('Projects',  projectsSchema);