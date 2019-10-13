import React, {useContext, useState} from 'react';
import {
    Dialog, DialogActions,
    DialogContent,
    Grid,
    GridList,
    GridListTile,
    IconButton,
    Tooltip,
    Typography,
    Button, GridListTileBar, LinearProgress
} from "@material-ui/core";
import {AttachFile} from "@material-ui/icons";
import {serverUrl} from "../../../utils/config";
import RenderSubTasks from "../backlogs/RenderSubTasks";
import {getBacklogTaskPriorityColor} from "../../../src/material-styles/visionDocsListBorderColor";
import {makeStyles} from "@material-ui/styles";
import {getRandomColor} from "../../../src/material-styles/randomColors";
import UserAvatarComponent from "../../UserAvatarComponent";
import DialogTitleComponent from "../../DialogTitleComponent";
import {DropzoneArea} from "material-ui-dropzone";
import {addAttachmentsToTaskAPI} from "../../../utils/apiCalls/projects";
import ProjectContext from "../../../context/project/project-context";
import SuccessSnackBar from "../../snakbars/SuccessSnackBar";
const useStyles = makeStyles(theme =>({
    wrapText:{
        whiteSpace: 'normal',
        wordWrap: 'break-word'
    },
    avatar:{
        marginRight:theme.spacing(0.2),
        width:30,
        height:30,
        backgroundColor: getRandomColor(),
    },
    detailsContent:{
        marginBottom:theme.spacing(2)
    },
    priority:{
        paddingLeft:theme.spacing(1),
        borderRadius:'4px 0 0 4px',
    },
    gridList: {
        height: 300,
    },
    gridListItem:{
        cursor:'pointer'
    }
}));
const RenderTaskDetails = ({details,disableUpload,setDetails}) => {
    const projectContext = useContext(ProjectContext);
    const classes = useStyles();
    const [openAddAttachmentDialog,setOpenAddAttachmentDialog] = useState(false);
    const [files,setFiles]=useState([]);
    const [fileError,setFileError] = useState(false);
    const [loading,setLoading]= useState(false);
    const [success,setSuccess] = useState(false);
    const [image,setImage] = useState({
        show:false,
        image:{}
    });

    const handleDropZone = files=>{
        setFileError(false);
        setFiles(files)
    };
    const handleUploadAttachments = ()=>{
        if (files.length === 0){
            setFileError(true)
        }
        else {
            setLoading(true);
            const data = new FormData();
            files.map(file =>{
                data.append('files',file);
            });

            data.set('projectId',projectContext.project.project._id)
            data.set('taskId',details._id);
            projectContext.addAttachmentsToTask(data)
                .then(result =>{
                    console.log(result)
                    setOpenAddAttachmentDialog(false);
                    setSuccess(true);
                    setDetails({
                        ...details,
                        attachments:[
                            ...details.attachments,
                            ...result.files
                        ]
                    })
                })
                .catch(err =>{
                    console.log(err.message)
                })
        }

    };
    const getPriority = (priority) => {
        switch (priority) {
            case '1' : return 'Very High';
            case '2' : return 'High';
            case '3' : return 'Normal';
            case '4' : return 'Low';
            case '5' : return 'Very Low'
        }
    };

    return (
        <div>
            <SuccessSnackBar open={success} message='Uploded' handleClose={()=>setSuccess(false)}/>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                    <div className={classes.detailsContent}>
                        <Tooltip title='Add Attachments' placement='top' onClick={()=>setOpenAddAttachmentDialog(true)}>
                            <IconButton style={{borderRadius:0,backgroundColor:'#e0e0e0'}} disabled={details.attachments.length === 10 || disableUpload} size='small' ><AttachFile/></IconButton>
                        </Tooltip>
                    </div>

                    <div className={classes.detailsContent}>
                        <Tooltip title='Description' placement='top'>
                            <Typography variant='body1' className={classes.wrapText}>
                                {details.description}
                            </Typography>
                        </Tooltip>
                    </div>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <div className={classes.detailsContent}>
                        <Typography variant='subtitle2'>
                            Assignee
                        </Typography>
                        <div style={{display:'flex',paddingLeft:5}}>
                            {
                                details.assignee.map((student,index) => (
                                    <UserAvatarComponent user={student} key={index}/>
                                ))
                            }
                        </div>
                    </div>
                    <div className={classes.detailsContent}>
                        <Typography variant='subtitle2' noWrap>
                            Story Point Estimate
                        </Typography>
                        <Typography variant='body1' color='textSecondary'>
                            {details.storyPoints}
                        </Typography>
                    </div>
                    <div className={classes.detailsContent}>
                        <Typography variant='subtitle2' noWrap>
                            Priority
                        </Typography>
                        <Typography className={classes.priority} variant='body1' color='textSecondary' style={getBacklogTaskPriorityColor(details.priority)}>
                            {getPriority(details.priority)}
                        </Typography>
                    </div>

                </Grid>
                <Grid item xs={12}>
                    <div className={classes.detailsContent}>
                        <Typography variant='subtitle2'>
                            Sub Tasks
                        </Typography>
                        <RenderSubTasks subTasks={details.subTasks}/>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className={classes.detailsContent}>
                        <Typography variant='subtitle2'>
                            Attachments
                        </Typography>
                        {
                            details.attachments.length === 0 ? (
                                <Typography variant='body1' color='textSecondary' className={classes.wrapText}>
                                    No Attachments Found
                                </Typography>
                            ):(
                                <GridList cellHeight={160} className={classes.gridList} cols={3}>

                                    {
                                        details.attachments.map((attachment,index) =>
                                            <GridListTile
                                                key={attachment.filename}
                                                cols={index === 0||index === 6? 2 :1}
                                                onClick={()=>setImage({show:true,image:attachment})}
                                                className={classes.gridListItem}
                                            >
                                                <img src={`${serverUrl}/../static/images/${attachment.filename}`} alt={attachment.originalname}/>
                                                <GridListTileBar title={attachment.originalname}/>
                                            </GridListTile>
                                        )
                                    }
                                </GridList>

                            )
                        }
                    </div>
                </Grid>
            </Grid>
            <Dialog open={openAddAttachmentDialog} onClose={()=>setOpenAddAttachmentDialog(false)} fullWidth maxWidth='sm'>
                {loading && <LinearProgress/>}
                <DialogTitleComponent title='Add Attachments' handleClose={()=>setOpenAddAttachmentDialog(false)}/>
                <DialogContent dividers>
                    <DropzoneArea
                        onChange={handleDropZone}
                        acceptedFiles={['image/*']}
                        filesLimit={10-details.attachments.length}
                        showPreviews={true}
                        showPreviewsInDropzone={false}
                        dropzoneText={`Drag and drop Images here or click (Max ${10-details.attachments.length}) size-3mb max`}
                    />
                    {fileError && <Typography variant='caption' color='error'>Please Upload Images</Typography> }
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setOpenAddAttachmentDialog(false)}>Cancel</Button>
                    <Button color='primary' onClick={handleUploadAttachments}>Add</Button>
                </DialogActions>
            </Dialog>
            {
                image.show &&
                <Dialog open={image.show} onClose={()=>setImage({show:false,image:{}})} fullWidth maxWidth='lg'>
                    <DialogTitleComponent title={image.image.originalname} handleClose={()=>setImage({show:false,image:{}})}/>
                    <img
                        style={{ maxWidth: '100%', height: 'auto'}}
                        src={`${serverUrl}/../static/images/${image.image.filename}`}
                        alt={image.image.originalname}
                    />
                </Dialog>
            }
        </div>

    );
};

export default RenderTaskDetails;