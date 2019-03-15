import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SelectComponent from 'react-select';
import {
  NoSsr, Typography, TextField, MenuItem, Paper, Divider,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
  groupHeading: {
    marginBottom: '6px',
  },
});

const isEmpty = obj => (obj && obj.constructor === Object && Object.entries(obj).length === 0);

const inputComponent = ({ inputRef, ...props }) => <div ref={inputRef} {...props} />;

const Control = props => (
  <TextField
    fullWidth
    InputProps={{
      inputComponent,
      inputProps: {
        className: `${props.selectProps.classes.input} select-textfield`,
        inputRef: props.inputRef,
        children: props.children,
        ...props.innerProps,
      },
    }}
    {...props.selectProps.textFieldProps}
  />
);

const Menu = props => (
  <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
    {props.children}
  </Paper>
);

const NoOptionsMessage = props => (
  <Typography
    color="textSecondary"
    className={props.selectProps.classes.noOptionsMessage}
    {...props.innerProps}
  >
    {props.children}
  </Typography>
);

const Option = props => (
  <MenuItem
    buttonRef={props.innerRef}
    selected={props.isFocused}
    component="div"
    style={{ fontWeight: props.isSelected ? 500 : 400 }}
    {...props.innerProps}
  >
    {props.children}
  </MenuItem>
);

const GroupHeading = props => (
  <div style={{ marginLeft: '12px', marginRight: '12px' }}>
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.groupHeading}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
    <Divider />
  </div>
);

const Placeholder = props => (
  <Typography
    color="textSecondary"
    className={props.selectProps.classes.placeholder}
    {...props.innerProps}
  >
    {props.children}
  </Typography>
);

const SingleValue = props => (
  <Typography
    className={props.selectProps.classes.singleValue}
    {...props.innerProps}
  >
    {props.children}
  </Typography>
);

const ValueContainer = props => (
  <div className={props.selectProps.classes.valueContainer}>{props.children}</div>  // eslint-disable-line
);

const components = {
  Control, Menu, NoOptionsMessage, Option, SingleValue, ValueContainer, Placeholder, GroupHeading,
};

class Search extends PureComponent {
  render() {
    const { onChange, value, classes, theme, placeholder, options, error } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>
          <SelectComponent
            textFieldProps={{ error }}
            classes={classes}
            styles={selectStyles}
            options={options}
            components={components}
            value={isEmpty(value) ? '' : value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </NoSsr>
      </div>
    );
  }
}

/* eslint-disable */

//  Props:
//    onChange - Callback function executed when an option is selected
//    value - Currently selected option - should be changed by onChange
//    placeholder - Text to display when no option is selected
//    options - Array of objects { value: '', label: '' } to display as selectable options

Search.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  error: PropTypes.bool,
};

Search.defaultProps = {
  error: false,
}
/* eslint-enable */

export default withStyles(styles, { withTheme: true })(Search);
