import React, { useState} from 'react';
import {
    Chip,
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, LinearProgress, ListItemIcon, Menu, MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip, Typography,
    Zoom
} from "@material-ui/core";
import moment from "moment";
import {makeStyles} from "@material-ui/styles";
import {getRandomColor} from "../../src/material-styles/randomColors";
import {
    Close,
    MoreVertOutlined,
    AccessTimeOutlined,
} from "@material-ui/icons";
import {useListItemStyles} from "../../src/material-styles/listItemStyles";
import Button from "@material-ui/core/Button";
import SchedulingDialogContent from "../coordinator/presentations/SchedulingDialogContent";
import { scheduleInternalAPI} from "../../utils/apiCalls/projects";
import {changeFinalDocumentationStatusAPI} from "../../utils/apiCalls/users";
import ErrorSnackBar from "../snakbars/ErrorSnackBar";
import {getGrade} from "../../utils";
import {getEvaluationListBorderColor, getGradeChipColor} from "../../src/material-styles/visionDocsListBorderColor";
const useStyles = makeStyles(theme =>({
    tableRow:{
        "&:hover":{

            boxShadow:theme.shadows[6]
        }
    },
    avatar:{
        width:30,
        height:30,
        backgroundColor:getRandomColor(),
        fontSize:18
    },
    tableWrapper:{
        padding:theme.spacing(0.5),
        overflow:'auto',
        maxHeight:450
    }
}));
const ListEvaluationProjects = ({filter,fetchData}) => {
    const projectsClasses = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [venue,setVenue] = useState('Seminar Room');
    const [selectedDate, handleDateChange] = useState(new Date());
    const [documentId,setDocumentId] = useState('');
    const [openError,setOpenError] = useState(false);
    const emptyStyles = useListItemStyles();
    const [data,setData] = useState({
        status:'',
        projectId:'',
        filename:'',
        originalname:'',
        title:'',
        supervisorId:''
    });
    const [openDialog,setOpenDialog] = useState(false);
    const [loading,setLoading] = useState(false);

    const handleOpenDialog = () =>{
        setOpenDialog(true)
    };
    const handleInternalSchedule = ()=>{
        setLoading(true);
        const sData = {
            venue,
            selectedDate,
            ...data
        };
        scheduleInternalAPI(sData)
            .then(result =>{
                if (result.error){
                    setLoading(false);

                    setOpenDialog(false);
                    setOpenError(true);
                    return
                }else {
                    const statusData = {
                        projectId:data.projectId,
                        status:'Internal Scheduled',
                        documentId
                    };
                    changeFinalDocumentationStatusAPI(statusData)
                        .then(res =>{
                            setLoading(false);

                            setOpenDialog(false);
                            fetchData();
                        })
                }

            })
    };
    const handleClickActionMenu = (status,projectId,supervisorId,filename,originalname,title,docId,event) =>{
        setLoading(false);
        setData({
            status,
            projectId,
            filename,
            originalname,
            title,
            supervisorId
        });
        setDocumentId(docId);
        setAnchorEl(event.currentTarget);
    }
    return (
        <div>
            <ErrorSnackBar open={openError} handleSnackBar={()=>setOpenError(false)} message={'Examiner Not Found!'}/>
            {
                <div className={projectsClasses.tableWrapper}>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Title</TableCell>
                                <TableCell align="left">Department</TableCell>
                                <TableCell align="left">Supervisor</TableCell>
                                <TableCell align="left">Status</TableCell>
                                <TableCell align="left">Internal</TableCell>
                                <TableCell align="left">OnDate</TableCell>
                                <TableCell align="left">External</TableCell>
                                <TableCell align="left">OnDate</TableCell>
                                <TableCell align="left">Grade</TableCell>
                                <TableCell align="left">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                filter.length === 0  ?
                                    <TableRow>
                                        <TableCell colSpan={10}>
                                            <div className={emptyStyles.emptyListContainer}>
                                                <div className={emptyStyles.emptyList}>
                                                    No Projects Found
                                                </div>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                :
                                filter.map((project,index) => (
                                    <TableRow key={index} className={projectsClasses.tableRow} style={getEvaluationListBorderColor(project.documentation.finalDocumentation.status)}>
                                        <TableCell align="left" >{project.documentation.visionDocument.title}</TableCell>
                                        <TableCell >{project.department}</TableCell>
                                        <Tooltip  title={project.details.supervisor.supervisor_details.position} placement="top" TransitionComponent={Zoom}>
                                            <TableCell align="left" style={{textTransform:'capitalize'}}>{project.details.supervisor.name}</TableCell>
                                        </Tooltip>
                                        <TableCell align="left">{project.documentation.finalDocumentation.status}</TableCell>
                                        <Tooltip  title={project.details.internal && project.details.internal.examiner ? project.details.internal.examiner.ugpc_details.designation ? project.details.internal.examiner.ugpc_details.designation :'Not Provided' : 'Not Assigned'} placement="top" TransitionComponent={Zoom}>
                                            <TableCell align="left">{project.details.internal && project.details.internal.examiner ? project.details.internal.examiner.name : 'Not Assigned'}</TableCell>
                                        </Tooltip>
                                        <TableCell align="left">{project.details.internal && project.details.internal.date ? moment(project.details.internal.date).format('MMM DD, YYYY')  : 'Not Assigned'}</TableCell>
                                        <Tooltip  title={project.details.external && project.details.external.examiner ? project.details.external.examiner.ugpc_details.designation ? project.details.external.examiner.ugpc_details.designation : 'Not Provided' : 'Not Assigned'} placement="top" TransitionComponent={Zoom}>
                                            <TableCell align="left">{project.details.external && project.details.external.examiner ? project.details.external.examiner.name : 'Not Assigned'}</TableCell>
                                        </Tooltip>
                                        <TableCell align="left">{project.details.external && project.details.external.date ? moment(project.details.external.date).format('MMM DD, YYYY') : 'Not Assigned'}</TableCell>
                                        <TableCell align="left">{project.documentation.finalDocumentation.status === 'Completed' ?  <Chip  label={getGrade(project.details.marks)} style={getGradeChipColor(getGrade(project.details.marks))}  size="small"/>  : 'Not Specified'}</TableCell>
                                        <TableCell align="left">
                                            <Tooltip title='Click for Actions' placement='top'>
                                                <IconButton size='small' onClick={(event)=>handleClickActionMenu(project.documentation.finalDocumentation.status,project._id,project.details.supervisor._id,project.documentation.finalDocumentation.document.filename,project.documentation.finalDocumentation.document.originalname,project.documentation.visionDocument.title,project.documentation.finalDocumentation._id,event)}>
                                                    <MoreVertOutlined/>
                                                </IconButton>
                                            </Tooltip>
                                            {
                                                data &&
                                                <Menu
                                                    id="simple-menu"
                                                    anchorEl={anchorEl}
                                                    keepMounted
                                                    open={Boolean(anchorEl)}
                                                    onClose={()=>setAnchorEl(null)}
                                                >
                                                    {
                                                        data.status === 'Available for Internal' &&
                                                        <MenuItem onClick={handleOpenDialog}>
                                                            <ListItemIcon>
                                                                <AccessTimeOutlined />
                                                            </ListItemIcon>
                                                            <Typography variant="inherit" noWrap>
                                                                Schedule Internal
                                                            </Typography>
                                                        </MenuItem>
                                                    }

                                                    <MenuItem onClick={()=>setAnchorEl(null)}>
                                                        <ListItemIcon>
                                                            <Close />
                                                        </ListItemIcon>
                                                        <Typography variant="inherit" noWrap>
                                                            Cancel
                                                        </Typography>
                                                    </MenuItem>

                                                </Menu>
                                            }

                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            }

            {/*Internal Dialog*/}
            <Dialog fullWidth maxWidth='sm' open={openDialog} onClose={()=>setOpenDialog(false)}>
                {loading && <LinearProgress/>}
                <DialogTitle style={{display:'flex', flexDirection:'row'}} disableTypography>
                    <Typography variant='h6' noWrap style={{flexGrow:1}}>Schedule Internal</Typography>
                    <Tooltip  title='Close' placement="top" TransitionComponent={Zoom}>
                        <IconButton size='small' onClick={()=>setOpenDialog(false)}>
                            <Close/>
                        </IconButton>
                    </Tooltip>
                </DialogTitle>
                <DialogContent dividers>
                    <SchedulingDialogContent
                        venue={venue}
                        handleDateChange={handleDateChange}
                        selectedDate={selectedDate}
                        setVenue={setVenue}
                    />
                    <Typography variant='subtitle2' display='inline'>Note: </Typography>
                    <Typography
                        variant='subtitle1'
                        color='textSecondary'
                        display='inline'
                    >
                        Examiner Will be assigned Automatically based on his load
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <DialogActions>
                        <Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
                        <Button variant='outlined' color='secondary' onClick={handleInternalSchedule}>Confirm</Button>
                    </DialogActions>
                </DialogActions>
            </Dialog>
            
        </div>
    );
};

export default ListEvaluationProjects;