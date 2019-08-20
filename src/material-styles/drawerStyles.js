import {makeStyles} from "@material-ui/core";
import {blue} from "@material-ui/core/colors";

const drawerWidth = 280;
export const useDrawerStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(6) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(8) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
    },
    side:{
        display:'flex',
        flexDirection:'row',
        justifyContent: 'flex-start',
        height:'100%'
    },
    sidebar:{
        minWidth: theme.spacing(6) ,
        [theme.breakpoints.up('sm')]: {
            minWidth: theme.spacing(8),
        },
        backgroundColor:blue[900],
        height: '100%',
    },
    menuRightButton:{
        display:'flex',
        justifyContent:'center',
        marginTop:theme.spacing(1),
    },
    list:{
        width:'100%'
    },
    menuRightTopContent:{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        marginTop:theme.spacing(3),
    },
    blank:{
        marginTop:theme.spacing(6),
    },
    menus:{
        display:'flex',
        flexDirection:'column',
        height:'85%',
        [theme.breakpoints.up('sm')]: {
            height: '90%',
        },
    },
    avatarMargin:{
        marginBottom:theme.spacing(2)
    }
}));
