import { createMuiTheme } from '@material-ui/core/styles';

/*
  Global Theme

  Styles in the global theme should apply to ALL Material-UI components.

  To override styles for individual components, use one of the following techniques:

  // 1. Use deepmerge function to override global theme
  const theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiStepper: {
        root: {
          padding: '24px 0px',
        },
      },
    },
  });

  // 2. Use createMuiTheme and ES6 spread operator to override global theme
  const theme = globalTheme => createMuiTheme({
    ...globalTheme,
    overrides: {
      ...globalTheme.overrides,
      MuiStepper: {
        ...globalTheme.overrides.MuiStepper,
        root: {
          ...globalTheme.overrides.MuiStepper.root,
          padding: '24px 0px',
        },
      },
    },
  });

  Then, use the theme object with <MuiThemeProvider> like normal.

  Note - some styles may require using technique 2 (such as typography and palette)

*/

const GlobalTheme = createMuiTheme({
  palette: {
    primary: { main: '#0097a7' },
    // type: 'dark',
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  },
  overrides: {
    MuiStepper: {
      root: {
        padding: '12px 0px',
      },
    },
    MuiToolbar: { // Used in the main Scenes for their toolbar above the table (apps, orgs, etc)
      root: {
        minHeight: '48px !important',
        // maxHeight: '48px !important',
      },
    },
    /* Used for Info pages - i.e. AppInfo, PipelineInfo, and so on */
    MuiTabs: {
      root: {
        backgroundColor: '#424242', // old value is '#3c4146'
        color: 'white',
        maxWidth: '1024px',
      },
    },
    MuiTab: {
      root: {
        minWidth: '120px !important',
      },
    },
    MuiCard: {
      root: {
        maxWidth: '1024px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '12px',
      },
    },
    MuiCardHeader: {
      action: {
        flex: 0.22,
        margin: '0 !important',
      },
      title: {
        fontSize: '15px',
        fontWeight: '500',
      },
      subheader: {
        fontSize: '14px',
        fontWeight: '500',
      },
    },
    MuiTableCell: {
      root: {
        '&:first-child': {
          paddingLeft: '24px',
        },
        '&:last-child': {
          paddingRight: '24px',
        },
      },
    },
  },
});

export default GlobalTheme;
