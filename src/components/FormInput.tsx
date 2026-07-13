import {FormControl, FormHelperText, TextField} from "@mui/material";

function FormInput(props) {
    return (
        <FormControl fullWidth={props.fullWidth} error={!!props.error} disabled={props.disabled} sx={props.sx}>
            <TextField {...props.field} InputProps={props.InputProps} disabled={props.disabled} readOnly={props.readOnly} error={!!props.error} variant={props.variant || 'standard'} type={props.type} label={props.label} placeholder={props.placeholder} fullWidth={props.fullWidth} {...props.params} value={props.value} slotProps={props.slotProps} onInput={props.onInput} size={props.size}/>
            {props.error && <FormHelperText sx={{ml:0}}>{props.error.message}</FormHelperText>}
        </FormControl>
    )
}

export default FormInput