import {Box, TableCell, TableRow} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import Typography from "@mui/material/Typography";
import * as React from "react";

const NoRowsFound = ({loading, colSpan, rowCount}) => {
    return (
        <>
            { !loading && !rowCount ?
                <TableRow>
                    <TableCell colSpan={colSpan} align={'center'}>
                        <Box>
                            <SearchOffIcon color="disabled" sx={{ fontSize: 60 }} />
                            <Typography variant="subtitle2">No Results Found</Typography>
                        </Box>
                    </TableCell>
                </TableRow>
                : <></>}
        </>
    )
}

export default NoRowsFound