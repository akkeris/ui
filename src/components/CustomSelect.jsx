import React, { PureComponent } from 'react';
import deepmerge from 'deepmerge';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Select, InputLabel, FormControl, MenuItem } from '@material-ui/core';

class CustomSelect extends PureComponent {
  theme = parentTheme => deepmerge(parentTheme, {
    overrides: {
      MuiInputLabel: {
        root: { color: `${this.props.color} !important` },
        shrink: { color: `${this.props.color} !important` },
        animated: { color: `${this.props.color} !important` },
      },
      MuiSelect: {
        root: { color: `${this.props.color}` },
        icon: { color: `${this.props.color}` },
        select: { color: `${this.props.color} !important` },
      },
      MuiInput: {
        input: {
          '&::placeholder': {
            color: `${this.props.color}`,
          },
          color: `${this.props.color}`,
        },
        underline: {
          // Border color when input is not selected
          '&:before': {
            borderBottom: '1px solid rgb(200, 200, 200)',
          },
          // Border color when input is selected
          '&:after': {
            borderBottom: `2px solid ${this.props.color}`,
          },
          // Border color on hover
          '&:hover:not([class^=".MuiInput-disabled-"]):not([class^=".MuiInput-focused-"]):not([class^=".MuiInput-error-"]):before': {
            borderBottom: '1px solid rgb(200, 200, 200)',
          },
        },
      },
    },
  });


  render() {
    const { children, value, onChange, name, label, style, multiple, options, fullWidth } = this.props;
    return (
      <MuiThemeProvider theme={this.theme}>
        <FormControl style={style}>
          <InputLabel htmlFor={`${name}-select`}>{label}</InputLabel>
          <Select
            className={`${name}-dropdown`}
            value={value}
            onChange={onChange}
            multiple={multiple}
            fullWidth={fullWidth}
            inputProps={{
              name,
              id: `${name}-select`,
            }}
          >
            {multiple ? (
              options.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))
            ) : children}
          </Select>
        </FormControl>
      </MuiThemeProvider>
    );
  }
}

CustomSelect.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired, // eslint-disable-line
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  label: PropTypes.string,
  multiple: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.string),
  fullWidth: PropTypes.bool,
};

CustomSelect.defaultProps = {
  children: null,
  color: 'white',
  label: 'Select',
  style: {},
  multiple: false,
  options: [],
  fullWidth: false,
};

export default CustomSelect;
