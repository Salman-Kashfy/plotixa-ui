import {CircularProgress, TableCell, TableRow, Box} from "@mui/material";


const TableSpinner = ({loading,colSpan,rowCount}) =>{
    return (
        <>
            { loading ?
                <TableRow>
                    <TableCell colSpan={colSpan} align={'center'}>
                        <Box sx={{ position: rowCount ? 'absolute' : 'inherit', top: '100px', zIndex: 2, right: 0, left: 0}}>
                            <CircularProgress/>
                        </Box>
                    </TableCell>
                </TableRow>
                : <></>}
        </>
    )
}

export default TableSpinner