import {createTheme} from "@mui/material/styles";

const components = {
    MuiTypography: {
        styleOverrides: {
            root: {
                textTransform: 'none',
            }
        },
    },
    MuiTable: {
        styleOverrides: {
            root: {
                position: 'relative',
            }
        }
    }
}

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0C66E4',
            light: 'rgb(92,149,231)',
        },
        success: {
            main: '#00586c'
        },
        triadic: {
            main: '#e40c66',
            dark: '#b9045d',
        },
    },
    components: {
        ...components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#f7f7f7',
                },
            },
        },
        // MuiDrawer: {
        //     styleOverrides: {
        //         paper: {
        //             backgroundColor: '#f7f7f7',
        //         },
        //     },
        // },
        MuiCssBaseline: {
            styleOverrides: {
                '& .fc-col-header-cell': {
                    fontWeight: 400,
                },
                '& .fc-timegrid-slot-label': {
                    fontWeight: 400,
                },
                '& .fc .fc-col-header-cell, .fc .fc-timegrid-slot, .fc .fc-scrollgrid': {
                    borderColor: 'rgba(134,134,134,0.7)'
                }
            }
        }
    }
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#407b95',
        },
        secondary: {
            main: '#535353',
        },
        success: {
            main: '#407b95',
        },
        triadic: {
            main: '#e40c66',
            dark: '#b9045d',
        },
    },
    components: {
        ...components,
        MuiTableCell: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: '#1e1e1e',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                subtitle2: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                h6: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                '& .fc-col-header-cell': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 400,
                },
                '& .fc-timegrid-slot-label': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 400,
                },
                '& .fc-toolbar-title': {
                    color: '#407b95'
                },
                '& .fc .fc-col-header-cell, .fc .fc-timegrid-slot, .fc .fc-scrollgrid': {
                    borderColor: 'rgba(134,134,134,0.7)'
                }
            }
        }
    }
});
