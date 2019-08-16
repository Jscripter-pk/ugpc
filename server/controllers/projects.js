const Projects = require('../models/projects');

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
        .populate('students','_id name')
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

exports.fetchWaitingVisionDocuments = (req, res)=>{
    Projects.aggregate([
        {
            $unwind:"$documentation.visionDocument"
        },
        {
            $project:{"documentation.visionDocument":1}
        },
        {
            $match:{"documentation.visionDocument.status":"Waiting for Initial Approval"}
        },
        {
            $sort:{"documentation.visionDocument.uploadedAt":1}
        }
    ])
        .then(documents =>{
            res.json(documents)
        })
        .catch(err => res.status(400).json(err.message))
};