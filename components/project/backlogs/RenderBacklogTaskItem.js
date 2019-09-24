import React from 'react';
import {getBacklogTaskPriorityColor} from "../../../src/material-styles/visionDocsListBorderColor";
import {makeStyles, Typography, Grid, Tooltip, Zoom, Chip, Divider} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import {getRandomColor} from "../../../src/material-styles/randomColors";

const useStyles = makeStyles(theme=>({
    listItem:{
        backgroundColor:'rgba(255,255,255,0.5)',
        padding:theme.spacing(1.2),
        '&:hover':{
            boxShadow:theme.shadows[8]
        },
        display:'flex',
        borderRadius:'4px 0 0 4px',
        alignItems:'center'
    },
    title:{
        flexGrow:1
    },
    avatar:{
        marginRight:theme.spacing(0.2),
        width:30,
        height:30,
        backgroundColor: getRandomColor(),
    },
}))
const RenderBacklogTaskItem = ({task}) => {
    const classes = useStyles();
    return (
        <div className={classes.listItem} style={getBacklogTaskPriorityColor(task.priority)} >
            <Grid container spacing={1} alignItems='center'>
                <Grid item xs={2} sm={2}>
                    <Typography variant='body1' color='textSecondary' className={classes.title} noWrap>{task.title}</Typography>
                </Grid>
                <Grid item xs={4} sm={4}>
                    <Typography variant='body1' color='textSecondary' className={classes.title} noWrap>{task.description}</Typography>
                </Grid>
                <Grid item xs={3} sm={3}>
                    {
                        task.createdBy && (
                            <Tooltip  title='Created By' placement="top" TransitionComponent={Zoom}>
                                <Chip
                                    color='primary'
                                    size='small'
                                    label={task.createdBy.name}
                                />
                            </Tooltip>
                        )
                    }
                </Grid>
                <Grid item xs={2} sm={2} style={{display:'flex'}}>
                    {
                        task.assignee.map((student,index) =>(
                            <Tooltip key={index} title={student.student_details.regNo} placement="top" TransitionComponent={Zoom}>
                                <Avatar className={classes.avatar} >{student.name.charAt(0).toUpperCase()}</Avatar>
                            </Tooltip>
                        ))
                    }
                </Grid>
                <Grid item xs={1} sm={1}>
                    <Tooltip  title='Sub Tasks' placement="top" TransitionComponent={Zoom}>
                        <Chip
                            color='primary'
                            size='small'
                            label={task.subTasks.length}
                        />
                    </Tooltip>
                </Grid>

            </Grid>

        </div>

    );
};

export default RenderBacklogTaskItem;