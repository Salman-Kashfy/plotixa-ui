import {Box, Typography, useTheme} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { NavLink } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Grid from '@mui/material/Grid2';

interface ButtonInterface {
    to?: string;
    label: string;
    show: boolean;
    onClick?: any
    loading?: boolean
    disabled?: boolean
}

interface PageTitleProps {
    title: string;
    btn?: ButtonInterface;
    backTo?: string;
    input?: any
}

const PageTitle = ({ title, btn, backTo = '', input = ''}: PageTitleProps) => {
    const theme = useTheme()
    return (
        <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 4 } }}>
            <Grid size={{ xs: 8, lg: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? 'primary.main' : '' }}>
                    {backTo ? (
                        <IconButton component={NavLink} to={backTo} sx={{ mr: 1 }}>
                            <KeyboardBackspaceIcon />
                        </IconButton>
                    ) : null}
                    {title}
                </Typography>
            </Grid>
            <Grid
                size={{ xs: 12, lg: 8 }}
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    gap: { xs: 1.5, lg: 0 },
                }}
            >
                {input ? (
                    <Box sx={{ width: { xs: '100%', lg: 'auto' } }}>
                        {input}
                    </Box>
                ) : null}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                    {(Array.isArray(btn) ? btn : btn ? [btn] : [])
                        .filter(button => button.show)
                        .map((button, index) => (
                            button.icon ? (
                                <IconButton
                                    key={index}
                                    component={button.to ? NavLink : undefined}
                                    to={button.to}
                                    onClick={button.onClick}
                                    disabled={button.disabled}
                                    sx={{
                                        ml: { xs: 0, lg: 1 },
                                        mr: { xs: 1, lg: 0 },
                                        backgroundColor: button.backgroundColor ? button.backgroundColor+'.main' : 'warning.main',
                                        boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
                                        color: button.color || (theme.palette.mode === 'light' ? 'white' : 'black'),
                                        "&:hover": {
                                            backgroundColor: button.backgroundColor ? button.backgroundColor+'.dark' : 'warning.dark',
                                        },
                                    }}
                                >
                                    {button.icon}
                                </IconButton>
                            ) : (
                                <LoadingButton
                                    key={index}
                                    variant="contained"
                                    loading={button.loading}
                                    disabled={button.disabled}
                                    component={button.to ? NavLink : undefined}
                                    to={button.to}
                                    startIcon={button.startIcon}
                                    onClick={button.onClick}
                                    sx={{ ml: { xs: 0, lg: 1 }, mr: { xs: 1, lg: 0 }, width: 'auto', alignSelf: 'flex-start' }}
                                >
                                    {button.label}
                                </LoadingButton>
                            )
                        ))}
                </Box>
            </Grid>
        </Grid>
    );
};

export default PageTitle;
