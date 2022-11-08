import { createMuiTheme } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: process.env.NEXT_PUBLIC_THEME_PRIMARY_COLOR || '#f99f40',
    },
    secondary: {
      main: '#121E34'
    },
    success: {
      main: '#f99f40',
    },
    background: {
      default: '#EFF3F9',
    },
  }
});

export default theme;
