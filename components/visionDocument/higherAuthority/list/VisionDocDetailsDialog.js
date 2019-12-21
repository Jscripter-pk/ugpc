import React, {useContext, useEffect, useState} from 'react';
import {
    Button,
    Chip, Tooltip, Container, Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, IconButton, InputAdornment,
    InputLabel, LinearProgress, MenuItem,
    OutlinedInput,
    Select, TextField,
    Typography,
    AppBar,
    Toolbar, Hidden, CircularProgress
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import {isAuthenticated} from "../../../../auth";

import {GetAppOutlined, Send} from "@material-ui/icons";
import VisionDocsContext from "../../../../context/visionDocs/visionDocs-context";

import {getVisionDocsStatusChipColor} from "../../../../src/material-styles/visionDocsListBorderColor";
import SuccessSnackBar from "../../../snakbars/SuccessSnackBar";
import ApprovalLetter from "../../../approvalLetter/ApprovalLetter";
import CloseIcon from '@material-ui/icons/Close';
import {getChairmanName} from "../../../../utils/apiCalls/users";
import {RenderComments} from "../../common/RenderComments";
import {useDocDetailsDialogStyles} from "../../../../src/material-styles/docDetailsDialogStyles";
import {RenderDocBasicDetails} from "../../common/RenderDocBasicDetails";
import {RenderDocumentAttachments} from "../../common/RenderDocumentAttachments";
import ErrorSnackBar from "../../../snakbars/ErrorSnackBar";
import DialogTitleComponent from "../../../DialogTitleComponent";
import UserContext from "../../../../context/user/user-context";
import {fetchMarksDistributionAPI} from "../../../../utils/apiCalls/projects";
import { PDFDownloadLink,PDFViewer } from '@react-pdf/renderer';
import CircularLoading from "../../../loading/CircularLoading";


const VisionDocDetailsDialog = ({currentDocument,open,handleClose,setCurrentDocument}) => {
    const classes = useDocDetailsDialogStyles();
    const visionDocsContext = useContext(VisionDocsContext);
    const [changeStatus,setChangeStatus] = useState('No Change');
    const [commentText,setCommentText] = useState('');
    const [confirmDialog,setConfirmDialog] = useState(false);
    const [confirmDialogLoading,setConfirmDialogLoading] = useState({
        show:false,
        status:''
    });
    const [successSnackbar,setSuccessSnackbar] = useState(false);
    const [letterViewer,setLetterViewer] = useState(false);
    const [chairmanName,setChairmanName]= useState('Not Available Yet');
    const [marks,setMarks] = useState('');
    const [saveButton,setSaveButton]= useState(true);
    const userContext = useContext(UserContext);
    const [marksDistribution,setMarksDistribution] = useState( 10);
    const [marksConfirm,setMarksConfirm] = useState(false);
    const [resError,setResError] = useState({
        show:false,
        message:''
    });
    useEffect(()=>{
        if (!currentDocument.details.marks || !currentDocument.details.marks.visionDocument){
            fetchMarksDistributionAPI()
                .then(result =>{
                    setMarksDistribution(result.proposal)
                })
                .catch(error => console.error(error.message))
        }

    },[]);
    const handleMarksChange = event =>{
        console.log()
        if (event.target.value.trim() === '' || !event.target.value.match(/^[0-9]*$/)){
            setSaveButton(true)
        }else{
            setSaveButton(false)
        }

        setMarks(event.target.value.trim());
    };
    const openLetterViewer = ()=>{
        getChairmanName()
            .then(result=>{
                if (result.name){
                    setChairmanName(result.name);
                }
                setLetterViewer(true);
            })
            .catch(error => {
                setResError({
                    show:true,
                    message:'Could not fetch Chairman Info'
                });
                setLetterViewer(true);
            })


    };
    const handleChangeStatus = e =>{
        setChangeStatus(e.target.value)
    };
    const handleCommentChange = e =>{
        setCommentText(e.target.value)
    };
    const handleCloseConfirmDialog = ()=>{
        setConfirmDialog(false);
    };

    const handleMarksSave = ()=>{
        if (marks < 0 || marks > marksDistribution){
            setMarksConfirm(false);
            setResError({show:true,message:`Should be between 0-${marksDistribution}`});
            return;
        }
        visionDocsContext.addMarks(marks,currentDocument._id)
            .then(res => {
                setMarksConfirm(false);
                setSuccessSnackbar(true);
                setCurrentDocument({
                    ...currentDocument,
                    details: {
                        ...currentDocument.details,
                        marks:{
                            ...currentDocument.details.marks,
                            visionDocument: marks
                        }
                    }
                })
            })
            .catch(err =>{
                setResError({
                    show:true,
                    message:'Something went wrong please try again'
                })
            })
    };


    const handleComment = ()=>{
        if (commentText.trim() !== ''){
            const commentDetails = {
                text:commentText,
                projectId:currentDocument._id,
                documentId:currentDocument.documentation.visionDocument._id,
                author:userContext.user.user._id
            };
            visionDocsContext.comment(commentDetails)
                .then(res =>{
                    const a = currentDocument.documentation.visionDocument.comments.push({
                        text:commentText,
                        createdAt:Date.now(),
                        author:{
                            name:userContext.user.user.name,
                            role:userContext.user.user.role,
                            profileImage:userContext.user.user.profileImage
                        }
                    });
                    setCommentText('');
                    setCurrentDocument({
                        ...currentDocument,
                        a
                    })
                })
                .catch(err =>{
                    setResError({
                        show:true,
                        message:'Something went wrong please try again'
                    })
                })
        }

    };
    const handleConfirm = ()=>{
        setConfirmDialogLoading({
            show:true,
            status:'Please wait...'
        });
        const statusDetails = {
            status:changeStatus,
            projectId:currentDocument._id,
            documentId:currentDocument.documentation.visionDocument._id,
        };
        if (changeStatus === 'Approved' || changeStatus === 'Approved With Changes') {
            setConfirmDialogLoading({
                show:true,
                status:'Assigning Supervisor...'
            });
            visionDocsContext.assignSupervisorAuto(currentDocument._id,currentDocument.documentation.visionDocument.title,currentDocument.students[0].student_details.regNo)
                .then(result => {
                    if (result.error){
                        setResError({
                            show:true,
                            message:result.error
                        });
                        setConfirmDialog(false);
                        setConfirmDialogLoading({
                            show:false,
                            status:''
                        });
                        return;
                    }
                    setConfirmDialogLoading({
                        show:true,
                        status:'Changing Status...'
                    });
                    visionDocsContext.changeStatus(statusDetails)
                        .then(res =>{

                            setCurrentDocument({...currentDocument,
                                details:{
                                    ...currentDocument.details,
                                    supervisor:result.supervisor,
                                    acceptanceLetter: result.acceptanceLetter
                                },
                                documentation:{
                                    ...currentDocument.documentation,
                                    visionDocument: {
                                        ...currentDocument.documentation.visionDocument,
                                        status:changeStatus
                                    }
                                }});
                            setChangeStatus('No Change');
                            setSuccessSnackbar(true);
                            setConfirmDialog(false);
                            setConfirmDialogLoading({
                                show:false,
                                status:''
                            });
                        })
                        .catch(err =>{
                            setResError({
                                show:true,
                                message:'Something went wrong please try again'
                            })
                        })
                })
                .catch(err =>{
                    setResError({
                        show:true,
                        message:'Something went wrong please try again'
                    });
                    setConfirmDialogLoading({
                        show:false,
                        status:''
                    });
                })
        }
        else {
            setConfirmDialogLoading({
                show:true,
                status:'Changing Status...'
            });
            visionDocsContext.changeStatus(statusDetails)
                .then(res =>{
                    setCurrentDocument({...currentDocument,documentation:{
                            ...currentDocument.documentation,
                            visionDocument: {
                                ...currentDocument.documentation.visionDocument,
                                status:changeStatus
                            }
                        }});
                    setChangeStatus('No Change');
                    setSuccessSnackbar(true);
                    setConfirmDialog(false);
                    setConfirmDialogLoading({
                        show:false,
                        status:''
                    });
                })
                .catch(err =>{
                    setResError({
                        show:true,
                        message:'Something went wrong please try again'
                    });
                    setConfirmDialogLoading({
                        show:false,
                        status:''
                    });
                })
        }

    };
    const closeSnackbar = ()=>{
        setSuccessSnackbar(false);
    };

    const closeLetterViewer = ()=>{
        setLetterViewer(false)
    };
    return (
        <div>
            <SuccessSnackBar open={successSnackbar} message={'Success'} handleClose={closeSnackbar}/>
            <ErrorSnackBar open={resError.show} message={resError.message} handleSnackBar={()=>setResError({show:false,message:''})}/>
            <Dialog
                fullWidth
                maxWidth='lg'
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-title"
            >

                <DialogTitleComponent title={currentDocument.documentation.visionDocument.title} handleClose={handleClose}/>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>

                            <div className={classes.detailsContent}>
                                <Typography color='textSecondary'>
                                    STATUS
                                </Typography>
                                <Chip style={getVisionDocsStatusChipColor(currentDocument.documentation.visionDocument.status)} label={currentDocument.documentation.visionDocument.status}  size="small"/>
                            </div>
                            {
                                userContext.user.isLoading ? <CircularLoading/> :
                                    userContext.user.user.additionalRole === 'UGPC_Member' &&
                                    <div className={classes.detailsContent}>

                                        <Typography color='textSecondary'>
                                            Change Status
                                        </Typography>
                                        <FormControl variant="outlined" margin='dense' className={classes.formControl}>
                                            <InputLabel  htmlFor="changeStatus">
                                                Status
                                            </InputLabel>
                                            <Select
                                                value={changeStatus}
                                                onChange={handleChangeStatus}
                                                input={<OutlinedInput labelWidth={47} name="changeStatus" id="changeStatus" />}
                                            >
                                                <MenuItem value='No Change'>No Change</MenuItem>
                                                {
                                                    userContext.user.user.ugpc_details.position === 'Coordinator' &&
                                                    currentDocument.documentation.visionDocument.status === 'Waiting for Initial Approval' &&
                                                    <MenuItem value='Approved for Meeting'>Approve for Meeting</MenuItem>
                                                }
                                                {
                                                    userContext.user.user.ugpc_details.position === 'Chairman_Committee' &&
                                                    currentDocument.documentation.visionDocument.status === 'Meeting Scheduled' &&
                                                    <MenuItem value='Approved With Changes'>Approve With Changes</MenuItem>
                                                }
                                                {
                                                    userContext.user.user.ugpc_details.position === 'Chairman_Committee' &&
                                                    currentDocument.documentation.visionDocument.status === 'Meeting Scheduled' &&
                                                    <MenuItem value='Approved'>Approve</MenuItem>
                                                }
                                                {
                                                    currentDocument.documentation.visionDocument.status === 'Meeting Scheduled' &&
                                                    <MenuItem value='Approved for Meeting'>Re Schedule</MenuItem>
                                                }
                                                {
                                                    currentDocument.documentation.visionDocument.status !== 'Approved' && currentDocument.documentation.visionDocument.status !== 'Approved With Changes' &&
                                                    <MenuItem value='Rejected'>Reject</MenuItem>
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                            }
                            <RenderDocBasicDetails
                                project={currentDocument}
                                currentDocument={currentDocument.documentation.visionDocument}
                                />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <RenderDocumentAttachments documents={currentDocument.documentation.visionDocument.documents} />
                            {
                                userContext.user.isLoading ? <CircularLoading/> :
                                (currentDocument.documentation.visionDocument.status === 'Approved' || currentDocument.documentation.visionDocument.status === 'Approved With Changes') &&
                                <div className={classes.detailsContent}>
                                    <Typography variant='subtitle2'>
                                        Marks
                                    </Typography>
                                    {
                                        currentDocument.details.marks && currentDocument.details.marks.visionDocument ?
                                            <Container>
                                                <Typography variant='h6' color='textSecondary'>{`(${currentDocument.details.marks.visionDocument}/${marksDistribution})`}</Typography>
                                            </Container>
                                             :
                                            userContext.user.user.ugpc_details.position === 'Chairman_Committee' ?
                                            <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                                                <TextField
                                                    label="Add Marks"
                                                    margin="dense"
                                                    variant="outlined"
                                                    value={marks}
                                                    onChange={handleMarksChange}
                                                    placeholder={`0-${marksDistribution}`}
                                                />
                                                <Button onClick={()=>setMarksConfirm(true)} disabled={saveButton} style={{marginLeft:2}} variant='outlined' color='primary'>Save</Button>
                                            </div>
                                                :
                                                <Container>
                                                    <Typography variant='h6' color='textSecondary'>Not Provided</Typography>
                                                </Container>
                                    }

                                </div>
                            }
                            <div className={classes.detailsContent}>
                                <TextField
                                    label="Add Comment"
                                    margin="dense"
                                    variant="outlined"
                                    multiline
                                    fullWidth
                                    value={commentText}
                                    onChange={handleCommentChange}
                                    rowsMax="4"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title='Add' placement='top'>
                                                    <IconButton size='small' onClick={handleComment}>
                                                        <Send />
                                                    </IconButton>
                                                </Tooltip>

                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>
                            <div className={classes.detailsContent}>
                                <RenderComments comments={currentDocument.documentation.visionDocument.comments}/>
                            </div>
                        </Grid>
                    </Grid>


                </DialogContent>
                <DialogActions>

                        {
                            currentDocument.details && currentDocument.details.acceptanceLetter && currentDocument.details.acceptanceLetter.name && (
                                <div>
                                    <Hidden smUp>
                                        <PDFDownloadLink
                                            document={
                                                <ApprovalLetter
                                                    title={currentDocument.documentation.visionDocument.title}
                                                    students={currentDocument.students}
                                                    supervisor={currentDocument.details.supervisor}
                                                    date={currentDocument.details.acceptanceLetter.issueDate}
                                                    chairmanName={chairmanName}
                                                />
                                            }
                                            fileName={currentDocument.details.acceptanceLetter.name}
                                            style={{textDecoration:'none'}}
                                        >
                                            {
                                                ({loading}) =>
                                                    (loading ? <CircularProgress/> :  <Button size='small' startIcon={<GetAppOutlined/>}>Acceptance Letter</Button>)
                                            }
                                        </PDFDownloadLink>
                                    </Hidden>
                                    <Hidden xsDown>
                                        <Button onClick={openLetterViewer} >Acceptance Letter</Button>
                                    </Hidden>
                                </div>

                            )
                        }


                    {
                        changeStatus !== 'No Change' &&
                        <Button onClick={()=>setConfirmDialog(true)} variant='contained' className={classes.buttonSuccess}>
                            Save
                        </Button>
                    }
                    <Button onClick={handleClose} color="primary" variant='contained'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth='xs'
                open={confirmDialog}
                onClose={handleCloseConfirmDialog}
            >
                {confirmDialogLoading.show && <LinearProgress color='secondary'/>}
                <Typography variant='caption' component='div' style={{textAlign:"center"}}>{confirmDialogLoading.status}</Typography>
                <DialogTitle>Confirm Changes?</DialogTitle>
                <DialogActions>

                    <Button onClick={handleCloseConfirmDialog}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={confirmDialogLoading.show} color='primary'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={letterViewer} onClose={closeLetterViewer} fullScreen>
                <ErrorSnackBar open={resError.show} message={resError.message} handleSnackBar={()=>setResError({show:false,message:''})}/>
                <AppBar className={classes.appBar}>
                    <Toolbar>

                        <Typography variant="h6" className={classes.title} noWrap>
                            Auto Generated Acceptance Letter
                        </Typography>
                        <IconButton edge="start" color="inherit" onClick={closeLetterViewer} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent style={{height:500}}>
                    {
                        currentDocument.details && currentDocument.details.acceptanceLetter &&(
                            <PDFViewer style={{width:'100%',height:'100%'}}>
                                <ApprovalLetter
                                    title={currentDocument.documentation.visionDocument.title}
                                    students={currentDocument.students}
                                    supervisor={currentDocument.details.supervisor}
                                    date={currentDocument.details.acceptanceLetter.issueDate}
                                    chairmanName={chairmanName}
                                />
                            </PDFViewer>
                        )
                    }

                </DialogContent>
            </Dialog>
            <Dialog maxWidth='xs' fullWidth open={marksConfirm} onClose={()=>setMarksConfirm(false)}>
                <DialogTitleComponent title='Confirm' handleClose={()=>setMarksConfirm(false)}/>
                <DialogContent dividers>
                    <Typography variant='caption' component='span'>Note: </Typography>
                    <Typography variant='body2' component='span'> You cannot change marks after adding!</Typography>
                    <Typography variant='subtitle1' component='div'>Are you sure you want to continue?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setMarksConfirm(false)} >
                        Cancel
                    </Button>
                    <Button onClick={handleMarksSave} color='primary'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    );
};

export default VisionDocDetailsDialog;