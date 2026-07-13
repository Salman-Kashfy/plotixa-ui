import {Box, LinearProgress} from "@mui/material";

const ProgressBar = ({formLoader,children}) =>{
    return (
        <Box sx={{height: '4px'}}>
            { formLoader ? <LinearProgress/> : <></> }
        </Box>
    )
}

export default ProgressBar