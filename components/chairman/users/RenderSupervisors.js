import React, {useState} from 'react';
import {
    Avatar, Chip,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from "@material-ui/core";
import {useChairmanUsersStyles} from "../../../src/material-styles/chairmanUsersStyles";
import {useDrawerStyles} from "../../../src/material-styles/drawerStyles";
import {useTableStyles} from "../../../src/material-styles/tableStyles";
import SuccessSnackBar from "../../snakbars/SuccessSnackBar";
import {Search} from "@material-ui/icons";
import {serverUrl} from "../../../utils/config";
import moment from "moment";
import RemoveUserComponent from "./RemoveUserComponent";

const RenderSupervisors = ({supervisors}) => {
    const userClasses = useChairmanUsersStyles();
    const avatarClasses = useDrawerStyles();
    const [filter,setFilter] = useState(supervisors ? supervisors.users: []);
    const tableClasses = useTableStyles();
    const [success,setSuccess] = useState(false);
    const handleChangeSearch = e =>{
        const data = supervisors.users;
        setFilter(e.target.value !==''? data.filter(student => student.name.toLowerCase().includes(e.target.value.toLowerCase())) : supervisors.users)
    };

    const handleSuccess = ()=>{
        setSuccess(false);
        setFilter(supervisors.users);
    };
    return (
        <div >
            <SuccessSnackBar open={success} message='User Removed!' handleClose={handleSuccess}/>
            <div className={userClasses.search}>
                <TextField
                    variant="outlined"
                    label="Search"
                    name='searchSupervisor'
                    margin='dense'
                    placeholder='Search'
                    onChange={handleChangeSearch}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
            <div className={`${tableClasses.tableWrapper} ${userClasses.table}`}>
                <Table >
                    <TableHead>
                        <TableRow>
                            <TableCell align="left"></TableCell>
                            <TableCell align="left">Name</TableCell>
                            <TableCell align="left">Email</TableCell>
                            <TableCell align="left">Position</TableCell>
                            <TableCell align="left">Projects</TableCell>
                            <TableCell align="left">Joined At</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody >
                        {

                            filter.map((supervisor,index) => (

                                <TableRow key={index} className={tableClasses.tableRow} >
                                    <TableCell align="left">
                                        {
                                            supervisor.profileImage && supervisor.profileImage.filename ?
                                                <Avatar  className={avatarClasses.imageAvatar}  src={`${serverUrl}/../static/images/${supervisor.profileImage.filename }`}  />
                                                :
                                                <Avatar className={avatarClasses.avatarColor}>
                                                    { supervisor.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                        }
                                    </TableCell>
                                    <TableCell align="left">{supervisor.name}</TableCell>
                                    <TableCell >{supervisor.email}</TableCell>
                                    <TableCell >{supervisor.supervisor_details.position}</TableCell>
                                    <TableCell ><Chip color='primary' label= {supervisor.supervisor_details.projects.length}/></TableCell>
                                    <TableCell align="left">{moment(supervisor.createdAt).format('MMM DD, YYYY')}</TableCell>
                                    <TableCell align="left">
                                        <RemoveUserComponent userId={supervisor._id} type={supervisor._id} setSuccess={setSuccess}/>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default RenderSupervisors;