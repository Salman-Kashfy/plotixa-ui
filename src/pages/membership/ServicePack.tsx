import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {Controller} from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import {GetInstructors} from "../../services/instructor.service";
import {useEffect, useState} from "react";

function ServicePackForm({servicePacks, gymId, setValue, control}) {

    const [instructors, setInstructors] = useState([]);

    const handleInstructorChange = (value, index) => {
        setValue(`servicePacks.${index}.instructorId`, value?.value || '', {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const fetchInstructors = (gymId) => {
        GetInstructors({limit:0},{gymId}).then(({list}:any) => {
            setInstructors(list.map((e:any) => {
                return { value: e.id, label: e.fullName }
            }))
        }).catch((e) => {
            console.log(e.message)
        })
    }

    useEffect(() => {
        fetchInstructors(gymId)
    },[])

    return (
        <>
            {
                servicePacks?.length ?
                    <Box sx={{mb:2}}>
                        <Typography variant="subtitle2" gutterBottom>Choose instructor for each service. </Typography>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: { xs: 280, sm: 'auto' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{color: 'primary.main'}}>Service</TableCell>
                                        <TableCell sx={{color: 'primary.main', minWidth: { xs: 160, sm: 250 }}}>Instructor</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    { servicePacks.map((sp,index) => {
                                        return (
                                            <TableRow key={`row-`+index}>
                                                <TableCell sx={{ verticalAlign: 'middle' }}>{sp.serviceName}</TableCell>
                                                <TableCell>
                                                    <Controller name={`servicePacks.${index}.instructorId`} control={control}
                                                        rules={{
                                                            required: {
                                                                value: "required",
                                                                message: "Instructor is required"
                                                            }
                                                        }}
                                                        render={({ field, fieldState: { error } }) => (
                                                            <Autocomplete
                                                                id={`servicePacks.${index}.instructorId`}
                                                                key={`servicePacks.${index}.instructorId`}
                                                                options={instructors}
                                                                getOptionLabel={(option) => option.label || ''}
                                                                value={instructors.find(option => option.value === field.value) || null}
                                                                onChange={(e, newValue) => {
                                                                    field.onChange(newValue?.value || '');
                                                                    handleInstructorChange(newValue, index);
                                                                }}
                                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!instructors.length} error={error} label={''} params={params}/>}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }) }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                : <></>
            }
        </>
    )
}
export default ServicePackForm