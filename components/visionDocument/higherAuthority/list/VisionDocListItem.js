import React, {useContext, useState} from 'react';
import { Typography, } from "@material-ui/core";
import VisionDocDetailsDialog from "./VisionDocDetailsDialog";
import Divider from "@material-ui/core/Divider";
import {useListItemStyles} from "../../../../src/material-styles/listItemStyles";

import {RenderListItemContent} from "../../common/RenderListItemContent";
import VisionDocsContext from "../../../../context/visionDocs/visionDocs-context";

const VisionDocListItem = ({filter,fetchData,userType}) => {
    const visionDocsContext = useContext(VisionDocsContext);
    const classes = useListItemStyles();
    const [currentDocument,setCurrentDocument] = useState({});
    const [open,setOpen] = useState(false);
    const handleClose = ()=>{
        if (fetchData){
            setOpen(false);
            setCurrentDocument({});
            fetchData();
        }else if (userType) {
            setOpen(false);
            setCurrentDocument({});
            visionDocsContext.fetchBySupervisor();
        }else {
            setOpen(false);
            setCurrentDocument({});
            visionDocsContext.fetchByCommittee()
        }

    };
    const openDetails = details =>{
        setCurrentDocument(details);
        setOpen(true);
    };
    return (
        <div className={classes.listItemContainer}>
            {
                filter.length === 0?
                    <div className={classes.emptyListContainer}>
                        <div className={classes.emptyList}>
                            <Typography variant='subtitle2' color='textSecondary'>
                                No Projects Found
                            </Typography>
                        </div>
                    </div>
                    :filter.map((doc,index)=>(
                        <div key={index}  onClick={()=>openDetails(doc)}>
                            <RenderListItemContent
                                project={doc}
                                doc={doc.documentation.visionDocument}
                                />
                            <Divider/>
                        </div>
                    ))}
            {
                open &&(
                <VisionDocDetailsDialog
                    open={open}
                    handleClose={handleClose}
                    currentDocument={currentDocument}
                    setCurrentDocument={setCurrentDocument}
                />)
            }

        </div>
    );
};

export default VisionDocListItem;