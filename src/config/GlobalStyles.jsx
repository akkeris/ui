

const textColor = 'rgb(36, 41, 46)';
const softTextColor = 'rgb(88, 96, 105)';
const fairlySoftTextColor = 'rgb(132, 151, 157)';
const verySoftTextColor = 'rgb(176, 192, 210)';
const linkColor = 'rgb(3, 102, 214)';
const softBackground = '#F7F8FB';
const errorColor = 'rgb(203, 36, 49)';
const successColor = '#2cbe4e';

const GlobalStyles = {
  NoWrappingText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'block',
    textOverflow: 'ellipsis',
  },
  LargePadding: {
    padding: '1rem',
  },
  StandardPadding: {
    padding: '0.25rem 0.5rem',
  },
  StandardLabelMargin: {
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  CenteredCircularProgress: {
    marginLeft: 'auto',
    marginRight: 'auto',
    verticalAlign: 'middle',
    width: '2rem',
    height: '2rem',
    justifySelf: 'center',
    alignSelf: 'center',
  },
  SmallCircularProgress: {
    width: '1rem',
    height: '1rem',
  },
  InnerPanel: {
    display: 'flex',
    height: '100%',
  },
  PaddedInnerPanel: {
    padding: '1rem',
  },
  MainPanel: {
    maxWidth: '1024px',
    margin: '2rem auto',
    minHeight: '400px',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  Subtle: {
    color: softTextColor,
  },
  FairlySubtle: {
    color: fairlySoftTextColor,
  },
  VerySubtle: {
    color: verySoftTextColor,
  },
  Header: {
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '0.25rem',
    marginBottom: '0.25rem',
  },
  HeaderSmall: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  VerticalAlign: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  SubHeader: {
    fontSize: '0.85rem',
    fontWeight: '400',
    display: 'block',
  },
  TopOfPaperHeaderLarge: {
    color: softTextColor,
    fontSize: '1.25rem',
    lineHeight: '1em',
    fontWeight: '400',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: '5px 5px 0 0',
    boxShadow: 'rgba(0, 0, 0, 0.0980392) 0px 0px 0px 1px inset',
  },
  PaperSubtleContainerStyle: {
    backgroundColor: softBackground,
  },
  SubtleContainerStyle: {
    backgroundColor: softBackground,
    boxShadow: '0 0 4px -3px black',
    padding: '0.25rem 0.75rem',
    borderRadius: '3px',
  },
  CommitLink: {
    display:'inline',
    color: '#475366',
    backgroundColor: softBackground,
    padding: '2.5px 5px 3px 5px',
    borderRadius: '2.5px',
    boxShadow: 'rgba(0, 0, 0, 0.0980392) 0px 0px 0px 1px inset',
  },
  CommitLinkPre: {
    display: 'inline',
  },
  Link: {
    color: linkColor,
  },
  ErrorText: {
    color: errorColor,
  },
  SuccessText: {
    color: successColor,
  },
  DangerButton: {
    borderColor: errorColor,
    backgroundColor: errorColor,
    color: 'white',
  },
  Text: {
    fontSize: '0.85rem',
    lineHieght: '1rem',
  },
};

/* Composite Styles */

GlobalStyles.FormSubHeaderStyle = {
  ...GlobalStyles.StandardLabelMargin,
  ...GlobalStyles.HeaderSmall,
  ...GlobalStyles.Subtle,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
};

GlobalStyles.ConfigVarStyle = {
  ...GlobalStyles.CommitLink, 
  ...GlobalStyles.CommitLinkPre,
  fontFamily:'courier',
  padding:'7.5px 10px', 
  boxSizing:'border-box',
  width:'100%',
  /*overflow:'hidden', 
  textOverflow:'ellipsis',
  whiteSpace:'nowrap',*/
  whiteSpace:'pre',
  overflow:'scroll',
  display:'inline-block',
  height:'2.25rem',
};

export default GlobalStyles;