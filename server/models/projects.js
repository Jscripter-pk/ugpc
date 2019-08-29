const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const projectsSchema = new mongoose.Schema({
    title:{
      type:String,
      required:true
    },
    description:{
        type:String
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
            marks:String,
            uploadedAt:Date,
            updatedAt:Date,
            meetingDate:Date
        }]
    },
    details:{
        createdAt:{
            type:Date,
            default: Date.now()
        },
        supervisor:{type:ObjectId, ref:"Users"},
        internal:{
            examiners:[{type:ObjectId, ref:"Users"}],
            date:{
                type:Date
            },
            marks:String
        },
        external:{
            examiners:[{type:ObjectId, ref:"Users"}],
            date:Date,
            marks:String
        },
        acceptanceLetter:{
            file:String,
            issueDate:Date
        },
        epic:[{
            _id:{
                type:ObjectId,
                default: new mongoose.Types.ObjectId()
            },
            name:String,
            associatedBacklogs:[{
                type:ObjectId
            }]

        }]
        ,
        backlogs:[{
            _id:{
                type:ObjectId,
                default: new mongoose.Types.ObjectId()
            },
            title: String,
            description:String,
            assignee:[{
                type:ObjectId,
                ref:"Users"
            }],
            subTasks:[{
                title:String,
                description: String
            }],
            priority:String,
            createdAt:Date,
            deadLine: Date,
            attachments:[{
                data:String
            }]

        }],
        sprints:[{
            name:String,
            startDate:Date,
            endDate:Date,
            todos:[{}],
            inProgress:[{}],
            inReview:[{}],
            done:[{}]
        }]
    }

});


module.exports = mongoose.model('Projects',  projectsSchema);