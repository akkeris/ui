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

const GlobalTheme = () => createMuiTheme({
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
        padding: '24px 0px',
      },
    },
  },
});

export default GlobalTheme;
