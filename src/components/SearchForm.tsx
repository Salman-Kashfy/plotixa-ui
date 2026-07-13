import {Input, InputLabel, TextField} from "@mui/material";

const SearchForm = ({callback, label, fullWidth = true, variant = 'standard'}) => {
    let timer = false
    const searchForm = async (e) => {
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            callback(e.target.value)
        },800)
    }

    return (
        <>
            <TextField type="search" variant={variant} label={label} fullWidth={fullWidth} maxLength={"100"} onChange={searchForm}>
                <InputLabel>{label}</InputLabel>
                <Input fullWidth={fullWidth}/>
            </TextField>
        </>
    )
}

export default SearchForm