import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Control, Controller } from 'react-hook-form';
import { PLOT_AREA_OPTIONS } from '../../utils/constants';

type Props = {
    control: Control<any>;
};

function PlotAreaField({ control }: Props) {
    return (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
                name="area"
                control={control}
                rules={{
                    required: 'Area is required',
                    validate: (value) => PLOT_AREA_OPTIONS.includes(Number(value)) || 'Select a valid area',
                }}
                render={({ field, fieldState: { error } }) => (
                    <FormControl variant="standard" fullWidth error={!!error}>
                        <InputLabel id="plot-area-label">Area (Sq. yd.)</InputLabel>
                        <Select {...field} labelId="plot-area-label" label="Area (Sq. yd.)">
                            <MenuItem value=""><em>Select area</em></MenuItem>
                            {field.value && !PLOT_AREA_OPTIONS.includes(Number(field.value)) && (
                                <MenuItem value={field.value} disabled>{field.value}</MenuItem>
                            )}
                            {PLOT_AREA_OPTIONS.map((area) => (
                                <MenuItem key={area} value={String(area)}>{area}</MenuItem>
                            ))}
                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                )}
            />
        </Grid>
    );
}

export default PlotAreaField;
