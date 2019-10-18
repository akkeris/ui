import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import { ClearIndicator } from 'react-select/lib/components/indicators';
import {
  NoSsr, Typography, TextField, MenuItem, Paper, Divider, CircularProgress,
  Chip,
} from '@material-ui/core';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import CancelIcon from '@material-ui/icons/Cancel';
import { withStyles } from '@material-ui/core/styles';

function isEmpty(obj) {
  let empty = true;
  Object.keys(obj).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) { empty = false; }
  });
  return empty;
}

const styles = theme => ({
  rootBase: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    marginRight: '32px',
    minWidth: '300px',
    maxWidth: '800px',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
  },
  container: {
    flexGrow: 1,
  },
  Input: {
    // color: 'black',
  },
  input: {
    display: 'flex',
    padding: 0,
    // color: 'black',
    height: 'unset',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    // color: 'black',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.5)}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
    // color: 'black',
  },
  placeholder: {
    position: 'absolute',
    // left: 40,
    fontSize: 16,
    color: '#DDDDDD',
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    width: '99%',
    margin: '6px auto 0px',
  },
  divider: {
    height: theme.spacing(2),
  },
  headingContainer: {
    marginLeft: '12px',
    marginRight: '12px',
  },
  groupHeading: {
    marginBottom: '6px',
  },
  searchIcon: {
    marginLeft: '6px',
  },
  loadingIndicator: {
    // color: 'white',
    marginRight: '12px',
  },
});

function trunc(str, count) {
  if (!str || str.length < count) { return str; }
  return `${str.substring(0, count)}...`;
}

const inputComponent = ({ inputRef, ...props }) => <div ref={inputRef} {...props} />;

const Control = props => (
  <TextField
    className="filter-select"
    fullWidth
    InputProps={{
      disableUnderline: true,
      inputComponent, 
      className: `${props.selectProps.classes.Input}`,
      inputProps: {
        className: `${props.selectProps.classes.input} filter-select-input`,
        inputRef: props.inputRef,
        children: props.children,
        ...props.innerProps,
      },
    }}
    {...props.selectProps.textFieldProps}
  />
);

const Menu = props => (
  <Paper square className={`${props.selectProps.classes.paper} filter-select-results`} {...props.innerProps}>
    {props.children}
  </Paper>
);

const NoOptionsMessage = props => (
  <Typography
    // color="textSecondary"
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
    className={props.children}
    style={{ fontWeight: props.isSelected ? 500 : 400 }}
    {...props.innerProps}
  >
    {props.children}
  </MenuItem>
);

const GroupHeading = props => (
  <div className={`${props.selectProps.classes.headingContainer} group-heading`}>
    <Typography
      // color="textSecondary"
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
    // color="textSecondary"
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
    {trunc(props.children, 25)}
  </Typography>
);

const MultiValue = props => ( // eslint-disable-line
  <Chip
    tabIndex={-1}
    label={props.children}
    className={`${props.selectProps.classes.chip} ${props.isFocused && props.selectProps.classes.chipFocused}`}
    onDelete={props.removeProps.onClick}
    deleteIcon={<CancelIcon {...props.removeProps} />}
  />
);

const ValueContainer = props => (
  <div className={props.selectProps.classes.valueContainer}>{props.children}</div>  // eslint-disable-line
);

const LoadingIndicator = props => <CircularProgress size={20} className={props.selectProps.classes.loadingIndicator} color="inherit" />; // eslint-disable-line

const CustomClearIndicator = props => <div className="filter-select-clear"><ClearIndicator {...props} /></div>;


const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  SingleValue,
  MultiValue,
  ValueContainer,
  Placeholder,
  GroupHeading,
  LoadingIndicator,
  ClearIndicator: CustomClearIndicator,
};

let timer = null;

class FilterSelect extends PureComponent {
  filter = input => option => option.label.toLowerCase().indexOf(input.toLowerCase()) > -1;

  // Search after 300ms so that we don't do unnecessary filtering while the user is typing
  // Return only the first 'maxOptions' results so the list doesn't get unnecessarily long
  search = (input, cb) => {
    clearTimeout(timer);
    const { options, maxResults } = this.props;
    if (!options || options.length === 0) {
      cb([]);
    } else {
      timer = setTimeout(() => cb(options.map(item => ({
        label: item.label,
        options: item.options.filter(this.filter(input)).slice(0, maxResults),
      }))), 300);
    }
  }

  render() {
    const { onSelect, classes, filters, placeholder } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: 'black',
        '& input': {
          font: 'inherit',
        },
      }),
      clearIndicator: base => ({
        ...base,
        color: '#DDDDDD',
        '&:hover': {
          color: 'black',
        },
      }),
      dropdownIndicator: base => ({
        ...base,
        color: '#DDDDDD',
        '&:hover': {
          color: 'black',
        },
      }),
      indicatorSeparator: base => ({
        ...base,
        color: '#DDDDDD',
      }),
    };

    return (
      <div className={classes.rootBase}>
        <NoSsr>
          <div className={classes.container}>
            <AsyncSelect
              loadOptions={this.search}
              defaultOptions
              classes={classes}
              styles={selectStyles}
              components={components}
              value={isEmpty(filters) ? '' : filters}
              onChange={(inputValues) => {
                onSelect(inputValues);
              }}
              placeholder={placeholder}
              Cle
              noOptionsMessage={({ inputValue }) => (inputValue.length > 0 ? 'No results' : 'Start typing...')}
              isMulti
            />
          </div>
        </NoSsr>
      </div>
    );
  }
}

/*
  User-supplied Props (* required):
    * onSelect - callback fn with value of selected option(s)
      maxResults - number of max results per category to show
    * options - Grouped array of options to select from
        e.g. [ { label: 'Group1', options: [ label: 'Option1', value: 'option1' ] } ]
    * filters - Array of user-typed filters
*/

/* eslint-disable */
FilterSelect.propTypes = {
  onSelect: PropTypes.func.isRequired,
  maxResults: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  placeholder: PropTypes.string,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
/* eslint-enable */

FilterSelect.defaultProps = {
  maxResults: 10,
  placeholder: 'Filter',
};

export default withStyles(styles, { withTheme: true })(FilterSelect);
