import React, {Fragment, useContext, useEffect, useState} from 'react';
import clsx from 'clsx';

import {
    Drawer,
    List,
    CssBaseline,
    Divider,
    IconButton,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tooltip,
    Menu,
    MenuItem,
    Avatar,
    Typography, Hidden, AppBar, Toolbar
} from '@material-ui/core';

import Link from "next/link";
import {
    DashboardOutlined,
    Laptop,
    SupervisorAccountOutlined,
    VisibilityOutlined,
    ChevronLeft,
    ChevronRight,
    Add,
    Face,
    PermIdentity,
    ExitToAppOutlined,
    ScheduleOutlined, AssignmentOutlined, ViewColumnOutlined
} from "@material-ui/icons";
import {isAuthenticated, signout} from "../../auth";
import {useDrawerStyles} from "../../src/material-styles/drawerStyles";
import UserContext from '../../context/user/user-context';
import MenuIcon from '@material-ui/icons/Menu';
const CoordinatorLayout = ({children})=> {
    const userContext = useContext(UserContext);
    useEffect(()=>{userContext.fetchUserById()},[])
    const classes = useDrawerStyles();
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerOpen = ()=> {
        setOpen(true);
    };

    const handleDrawerClose =()=> {
        setOpen(false);
    };
    const handleAddMenuClose = ()=>{
        setAnchorEl(null);
    };
    const handleAddMenuClick = event =>{
        setAnchorEl(event.currentTarget)
    };


    const handleProfileMenuClose = ()=>{
        setAnchorEl2(null);
    };
    const handleProfileMenuClick = event =>{
        setAnchorEl2(event.currentTarget)
    };
    const handleDrawerToggle = ()=>event=>{
        setMobileOpen(!mobileOpen);
    };
    const drawer = (
        <List>
            <Link href='/coordinator/overview'>
                <ListItem button >
                    <ListItemIcon>
                        <DashboardOutlined />
                    </ListItemIcon>
                    <ListItemText primary={"Overview"} />
                </ListItem>

            </Link>

            <Link href='/coordinator/vision-documents'>
                <ListItem button >
                    <ListItemIcon>
                        <Laptop />
                    </ListItemIcon>
                    <ListItemText primary={"Vision Docs"} />
                </ListItem>
            </Link>

            <Link href='/coordinator/projects'>
                <ListItem button >
                    <ListItemIcon>
                        <Laptop />
                    </ListItemIcon>
                    <ListItemText primary={"Projects"} />
                </ListItem>
            </Link>

            <Link href='/coordinator/presentations'>
                <ListItem button >
                    <ListItemIcon>
                        <ScheduleOutlined />
                    </ListItemIcon>
                    <ListItemText primary={"Schedule Presentations"} style={{whiteSpace:'normal'}} />
                </ListItem>
            </Link>

            <Link href='/coordinator/meetings'>
                <ListItem button >
                    <ListItemIcon>
                        <VisibilityOutlined />
                    </ListItemIcon>
                    <ListItemText primary={"Meetings"} />
                </ListItem>
            </Link>

            <Link href='/coordinator/supervisors'>
                <ListItem button >
                    <ListItemIcon>
                        <SupervisorAccountOutlined />
                    </ListItemIcon>
                    <ListItemText primary={"Supervisors"} />
                </ListItem>
            </Link>

        </List>

    );
    const addMenu = (
        <Link href='/coordinator/presentation'>
            <MenuItem>
                <ListItemIcon>
                    <SupervisorAccountOutlined />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                    Presentation
                </Typography>
            </MenuItem>
        </Link>
    );
    const profileMenu = (
        <div>
            <Link href='/user/profile'>
                <MenuItem>
                    <ListItemIcon>
                        <PermIdentity />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                        Profile
                    </Typography>
                </MenuItem>
            </Link>
            <MenuItem onClick={()=>signout()}>
                <ListItemIcon>
                    <ExitToAppOutlined />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                    Sign Out
                </Typography>
            </MenuItem>
        </div>
)
    return (
        <div >
            <CssBaseline />
            <div style={{flexGrow:1}}>
                <Hidden smUp>
                    <AppBar position="static" color="default">
                        <Toolbar>
                            <Hidden smUp>
                                <IconButton edge="start" className={classes.menuButton} color="primary" aria-label="menu" onClick={handleDrawerToggle()}>
                                    <MenuIcon />
                                </IconButton>
                            </Hidden>
                            <div style={{flexGrow:1}}>
                                <Tooltip title='UGPC-Software' placement='right'>
                                    <Avatar alt="IIUI-LOGO" src="/static/images/avatar/iiui-logo.jpg" />
                                </Tooltip>
                            </div>
                            <Tooltip title='Add' placement='right'>
                                <IconButton onClick={handleAddMenuClick}  size='small'>
                                    <Add/>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleAddMenuClose}
                            >
                                {addMenu}
                            </Menu>
                            <Tooltip title='Your Profile & Settings' placement='right'>
                                <IconButton onClick={handleProfileMenuClick} size='small'>
                                    <Face fontSize='large'/>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl2}
                                keepMounted
                                open={Boolean(anchorEl2)}
                                onClose={handleProfileMenuClose}
                            >
                                {profileMenu}
                            </Menu>
                        </Toolbar>
                    </AppBar>
                    <nav  aria-label="mailbox folders">
                        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                        <Hidden smUp >
                            <Drawer
                                variant="temporary"
                                open={mobileOpen}
                                onClose={handleDrawerToggle()}
                                ModalProps={{
                                    keepMounted: true, // Better open performance on mobile.
                                }}
                            >
                                <div style={{width:240}}>
                                    <div className={classes.avatarDrawer}>
                                        <Avatar  className={classes.avatarSize}>{!userContext.user.isLoading ? userContext.user.user.name.charAt(0).toUpperCase() : 'U' }</Avatar>
                                    </div>
                                    <Divider/>
                                    {drawer}
                                </div>

                            </Drawer>
                        </Hidden>
                    </nav>
                    <div>
                        {children}
                    </div>
                </Hidden>

            </div>

            <div className={classes.root}>
                <Hidden xsDown>
                    <Drawer
                        variant="permanent"
                        className={clsx(classes.drawer, {
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                        })}
                        classes={{
                            paper: clsx({
                                [classes.drawerOpen]: open,
                                [classes.drawerClose]: !open,
                            }),
                        }}
                        open={open}
                    >
                        <div className={classes.side}>
                            <div className={classes.sidebar}>
                                <div className={classes.menuRightButton}>
                                    {
                                        !open ?
                                            <Tooltip title='Expand' placement='right'>
                                                <IconButton onClick={handleDrawerOpen} style={{color:'#fff'}}>
                                                    <ChevronRight color='inherit'/>
                                                </IconButton>
                                            </Tooltip>
                                            :
                                            <div className={classes.blank}/>

                                    }
                                </div>

                                <div className={classes.menus}>
                                    <div className={classes.menuRightTopContent} style={{flexGrow:1}}>
                                        <div >
                                            <Tooltip title='UGPC-Software' placement='right'>
                                                <Avatar alt="IIUI-LOGO" src="/static/images/avatar/iiui-logo.jpg" className={classes.avatarMargin}/>
                                            </Tooltip>
                                        </div>
                                        <div>
                                            <Tooltip title='Add' placement='right'>
                                                <IconButton onClick={handleAddMenuClick} style={{color:'#fff'}} size='small' >
                                                    <Add/>
                                                </IconButton>
                                            </Tooltip>
                                            <Menu
                                                id="add-menu"
                                                anchorEl={anchorEl}
                                                keepMounted
                                                open={Boolean(anchorEl)}
                                                onClose={handleAddMenuClose}
                                            >
                                                {addMenu}
                                            </Menu>
                                        </div>
                                    </div>

                                    <div className={classes.menuRightTopContent}>
                                        <Tooltip title='Your Profile & Settings' placement='right'>
                                            <IconButton onClick={handleProfileMenuClick} size='small'>
                                                <Face fontSize='large' color='action'/>
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            id="simple-menu"
                                            anchorEl={anchorEl2}
                                            keepMounted
                                            open={Boolean(anchorEl2)}
                                            onClose={handleProfileMenuClose}
                                        >
                                            {profileMenu}

                                        </Menu>
                                    </div>
                                </div>




                            </div>
                            <div className={classes.list}>
                                <div className={classes.toolbar}>
                                    {
                                        open &&
                                        <Tooltip title='Collapse' placement='right'>
                                            <IconButton onClick={handleDrawerClose}>
                                                <ChevronLeft />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </div>
                                <Divider />

                                {drawer}
                            </div>
                        </div>
                    </Drawer>
                    <main className={classes.content}>
                        {children}
                    </main>
                </Hidden>
            </div>
        </div>
    );
};
export default CoordinatorLayout;