import React, {Fragment, useEffect, useState, useContext} from 'react';
import {ScheduleOutlined} from "@material-ui/icons";
import {
    Divider,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, LinearProgress,
    Grid
} from "@material-ui/core";
import {useListContainerStyles} from "../../../src/material-styles/listContainerStyles";
import {makeStyles} from "@material-ui/styles";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {formatData} from "./formatData";
import VisionDocDetailsDialog from "../../visionDocument/higherAuthority/list/VisionDocDetailsDialog";
import {DateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import VisionDocsContext from '../../../context/visionDocs/visionDocs-context';
import SuccessSnackBar from "../../snakbars/SuccessSnackBar";

const useStyles = makeStyles(theme =>({
    scheduleContainer:{
        border:'1.7px dashed grey',
        marginTop:theme.spacing(2),
        borderRadius:5
    },
    emptySchedule:{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:theme.spacing(5),
        textAlign:'center'
    },
    scheduleActions:{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'stretch',
        padding: theme.spacing(1),
        marginTop: theme.spacing(2),

        [theme.breakpoints.up('sm')]: {
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            padding: theme.spacing(1),
            marginTop: theme.spacing(2),

        }
    },
    presentationTitle:{
        flexGrow:1
    },
    listContainer:{
        display:'flex',
        flexDirection: 'column',
        padding:theme.spacing(2),
        border:'1px solid lightgrey',
        borderRadius: 5,
        minHeight:150,
        flexGrow:1,
        marginTop:theme.spacing(2)
    },
    list:{

    },
    listItem:{
        backgroundColor:'rgba(255,255,255,0.5)',
        borderLeft:'4px solid #F57F17',
        padding:theme.spacing(1.2),
        '&:hover':{
            boxShadow:theme.shadows[6]
        },
        display:'flex',
        borderRadius:2,
        alignItems:'center'
    },
}));


const ListVisionDocsForPresentation = ({docs}) => {
    const classes = useListContainerStyles();
    const visionDocsContext = useContext(VisionDocsContext);
    const presentationClasses = useStyles();
    const [state,setState] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentDocument,setCurrentDocument] = useState({});
    const [open,setOpen] = useState(false);
    const [selectedDate, handleDateChange] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoading,setDialogLoading]=useState(false);
    const [finalIds,setFinalIds] = useState([]);
    const [openSnackBar,setOpenSnackbar] = useState(false);
    const handleCloseDialog = ()=>{
        setDialogOpen(false)
    }
    const handleClose = ()=>{
        setOpen(false)
        setCurrentDocument({})
    };
    const openDetails = details =>{
        setCurrentDocument(details);

        setOpen(true);
    };
    useEffect(()=>{
        setState(formatData(docs));
        setLoading(false)
    },[]);
    const onDragEnd= result=>{
        const { destination, source, draggableId } = result;
        if (!destination){
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index){
            return;
        }

        const start = state.columns[source.droppableId];
        const finish = state.columns[destination.droppableId];
        if (start === finish){
            return;
        }
        const startTaskIds = Array.from(start.projectsIds);
        startTaskIds.splice(source.index,1);
        const newStart = {
            ...start,
            projectsIds: startTaskIds
        };
        const finishTaskIds = Array.from(finish.projectsIds);
        finishTaskIds.splice(destination.index,0,draggableId);
        setFinalIds(finishTaskIds);
        const newFinish = {
            ...finish,
            projectsIds:finishTaskIds,
        };
        const newState = {
            ...state,
            columns:{
                ...state.columns,
                [newStart.id]:newStart,
                [newFinish.id]:newFinish
            }

        }
        setState(newState);
    };
    const getListStyle = isDraggingOver=>({
        backgroundColor: isDraggingOver ? '#C5E1A5' :'#fff'
    });
    const handleCancel = ()=>{
        setState(formatData(docs));
    };
    const handleSchedule = ()=>{
        setDialogLoading(true);
        const visionIds = finalIds.map(projectId => state.projects[projectId].documentation.visionDocument._id );
        console.log(visionIds);
        const data = {
            projectIds:finalIds,
            visionDocsIds:visionIds,
            date:selectedDate
        }
        console.log(visionDocsContext)
        visionDocsContext.scheduleVisionDefence(data)
            .then(res => {
                setOpenSnackbar(true);
                setTimeout(()=>{
                    visionDocsContext.fetchByCommittee();
                    visionDocsContext.fetchMeetings();
                },2000);

                setDialogOpen(false);
                setDialogLoading(false);


            })
    }
    const handleSnackbarClose = ()=>{
        setOpenSnackbar(false);
    }
    return (
        <Fragment>
        <SuccessSnackBar open={openSnackBar} handleClose={handleSnackbarClose} message={'Meeting Scheduled'}/>
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={classes.listContainer}>
                <div className={classes.top}>
                    <div className={classes.topIconBox}>
                        <ScheduleOutlined className={classes.headerIcon}/>
                    </div>
                    <div className={classes.topTitle}>
                        <Typography variant='h5' >Presentations</Typography>
                    </div>
                </div>
                <Divider/>

                {
                    !loading &&
                    state.columnOrder.map(columnId => {
                        const column = state.columns[columnId];
                        const projects = column.projectsIds.map(projectId => state.projects[projectId]);
                        const disabledButton = column.projectsIds.length <= 0;
                        return (
                            <div key={column.id}>
                                <div className={presentationClasses.scheduleActions}>
                                    <Typography variant='subtitle1' className={presentationClasses.presentationTitle}>{column.title}</Typography>
                                    {
                                        column.title==='Schedule Presentations' &&
                                            <>
                                                <Button
                                                    variant='outlined'
                                                    style={{borderRadius:0}}
                                                    disabled={disabledButton}
                                                    onClick={handleCancel}
                                                    size='small'
                                                >
                                                    Cancel
                                                </Button>


                                                <Button
                                                    variant='contained'
                                                    style={{marginLeft:5,borderRadius:0}}
                                                    color='secondary' size='small'
                                                    disabled={disabledButton}
                                                    onClick={()=>setDialogOpen(true)}
                                                >
                                                    Schedule Now
                                                </Button>
                                            </>
                                    }
                                </div>
                                <Divider/>
                                <Droppable droppableId={column.id}>
                                    {
                                        (provided, snapShot) =>{
                                            if (column.title === 'Schedule Presentations' && column.projectsIds.length === 0){

                                                return(
                                                <div
                                                    className={presentationClasses.scheduleContainer}
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    style={getListStyle(snapShot.isDraggingOver)}
                                                >
                                                    <div className={presentationClasses.emptySchedule}>
                                                        <Typography variant='subtitle2' color='textSecondary'>
                                                            Drag and drop Projects from list given below
                                                        </Typography>
                                                    </div>
                                                    {provided.placeholder}
                                                </div>
                                                )
                                            }else{
                                                if (column.projectsIds.length === 0){
                                                    return(
                                                        <div
                                                            className={presentationClasses.scheduleContainer}
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                        >
                                                            <div className={presentationClasses.emptySchedule}>
                                                                <Typography variant='subtitle2' color='textSecondary'>
                                                                    No Documents Yet to Schedule Presentation
                                                                </Typography>
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )
                                                }else{
                                                    return (
                                                        <div
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                            className={presentationClasses.listContainer}
                                                        >
                                                            {projects.map((project,index )=>
                                                                <div key={project._id} className={presentationClasses.list}>
                                                                    <Draggable draggableId={project._id} index={index}>
                                                                        {
                                                                            (provided, snapShot) =>(
                                                                                <>
                                                                                    <div
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        ref={provided.innerRef}
                                                                                        className={presentationClasses.listItem}
                                                                                    >
                                                                                        <Typography noWrap style={{flexGrow:1}}>{project.title}</Typography>
                                                                                        <Typography noWrap key={index} color='textSecondary'>{project.students[0].student_details.regNo}</Typography>
                                                                                        <Button onClick={()=>openDetails(project)} size='small' color='primary'>See Details</Button>

                                                                                    </div>

                                                                                    <Divider/>
                                                                                </>
                                                                            )
                                                                        }

                                                                    </Draggable>
                                                                </div>
                                                            )}
                                                            {provided.placeholder}
                                                        </div>
                                                    )
                                                }

                                            }
                                        }
                                    }
                                </Droppable>
                            </div>
                        )
                    })
                }
                {
                    open &&
                    <VisionDocDetailsDialog
                        open={open}
                        handleClose={handleClose}
                        currentDocument={currentDocument}
                        setCurrentDocument={setCurrentDocument}
                        labelWidth={50}
                    />
                }
            </div>

        </DragDropContext>
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="title"
                aria-describedby="description">
                {
                    dialogLoading && <LinearProgress color='secondary'/>
                }
                <DialogTitle id="title">Details</DialogTitle>
                <DialogContent>
                    <DialogContentText id='description'>Please Select Date&Time</DialogContentText>
                    <MuiPickersUtilsProvider  utils={DateFnsUtils}>
                        <DateTimePicker
                            label="DateTimePicker"
                            inputVariant="outlined"
                            value={selectedDate}
                            onChange={handleDateChange}
                            disablePast
                        />
                    </MuiPickersUtilsProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button  color="primary" autoFocus onClick={handleSchedule}>
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
};

export default ListVisionDocsForPresentation;