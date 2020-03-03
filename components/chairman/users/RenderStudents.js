import React, {useState} from 'react';
import {
  Avatar,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Chip, Typography,
} from "@material-ui/core";
import {useChairmanUsersStyles} from "../../../src/material-styles/chairmanUsersStyles";
import {Search} from "@material-ui/icons";
import moment from "moment";
import {useTableStyles} from "../../../src/material-styles/tableStyles";
import {serverUrl} from "../../../utils/config";
import {useDrawerStyles} from "../../../src/material-styles/drawerStyles";
import RemoveUserComponent from "./RemoveUserComponent";
import SuccessSnackBar from "../../snakbars/SuccessSnackBar";
import {useListItemStyles} from "../../../src/material-styles/listItemStyles";

const RenderStudents = ({students}) => {
  const userClasses = useChairmanUsersStyles();
  const avatarClasses = useDrawerStyles();
  const emptyStyles = useListItemStyles();
  const [filter, setFilter] = useState(students || []);
  const tableClasses = useTableStyles();
  const [success, setSuccess] = useState(false);
  const handleChangeSearch = e => {
    const data = students;
    setFilter(e.target.value !== '' ? data.filter(student => student.name.toLowerCase().includes(e.target.value.toLowerCase())) : students)
  };

  const handleSuccess = () => {
    setSuccess(false);
    setFilter(students);
  };
  return (
    <div>
      <SuccessSnackBar open={success} message='User Removed!' handleClose={handleSuccess}/>
      <div className={userClasses.header}>
        <TextField
          variant="outlined"
          label="Search"
          margin='dense'
          placeholder='Search'
          onChange={handleChangeSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search/>
              </InputAdornment>
            ),
          }}
        />
        <Typography className={userClasses.userNumbers} variant='body2'
                    color='textSecondary'>{filter.length} {filter.length === 1 ? 'User' : 'Users'} Found</Typography>
      </div>
      <div className={`${tableClasses.tableWrapper} ${userClasses.table}`}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left"></TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Batch</TableCell>
              <TableCell align="left">Department</TableCell>
              <TableCell align="left">Joined At</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              filter.length === 0 ?
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className={emptyStyles.emptyListContainer}>
                      <div className={emptyStyles.emptyList}>
                        No Students Found
                      </div>
                    </div>
                  </TableCell>
                </TableRow> :
                filter.map((student, index) => (

                  <TableRow key={index} className={tableClasses.tableRow}>
                    <TableCell align="left">
                      {
                        student.profileImage && student.profileImage.filename ?
                          <Avatar className={avatarClasses.imageAvatar}
                                  src={`${serverUrl}/../images/${student.profileImage.filename}`}/>
                          :
                          <Avatar className={avatarClasses.avatarColor}>
                            {student.name.charAt(0).toUpperCase()}
                          </Avatar>
                      }
                    </TableCell>
                    <TableCell align="left">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.student_details.isEligible}
                        className={student.student_details.isEligible === 'Eligible' ? userClasses.greenChip : userClasses.dangerChip}
                      />
                    </TableCell>
                    <TableCell>{student.student_details.batch}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell align="left">{moment(student.createdAt).format('MMM DD, YYYY')}</TableCell>
                    <TableCell align="left">
                      <RemoveUserComponent userId={student._id} setSuccess={setSuccess}/>
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

export default RenderStudents;