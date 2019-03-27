import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AsyncSearch from 'react-select/lib/Async';
import {
  NoSsr, Typography, TextField, MenuItem, Paper, Divider, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles';
import api from '../services/api';

const styles = theme => ({
  rootBase: {
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    marginRight: '48px',
    borderRadius: '18px',
    transition: 'all 0.2s ease',
  },
  rootSm: { width: '250px' },
  rootLg: { width: '350px' },
  container: {
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
    left: 40,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    width: '98%',
    zIndex: 1,
    left: 0,
    right: 0,
    margin: '0 auto',
  },
  divider: {
    height: theme.spacing.unit * 2,
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
});

const isEmpty = obj => (obj && obj.constructor === Object && Object.entries(obj).length === 0);

const inputComponent = ({ inputRef, ...props }) => <div ref={inputRef} {...props} />;

const Control = props => (
  <TextField
    fullWidth
    InputProps={{
      disableUnderline: true,
      inputComponent,
      inputProps: {
        className: `${props.selectProps.classes.input} select-textfield`,
        inputRef: props.inputRef,
        children: props.children,
        ...props.innerProps,
      },
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon className={props.selectProps.classes.searchIcon} nativeColor="#3c4146" />
        </InputAdornment>
      ),
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
  <div className={props.selectProps.classes.headingContainer}>
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

let timer = null;

class GlobalSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { options: [], value: {}, focused: false };
  }

  componentDidMount() {
    this.getOptions();
    api.notify.add({ name: 'globalSearch', cb: () => setTimeout(() => this.getOptions(), 2000) });
  }

  componentWillUnmount() {
    api.notify.remove('globalSearch');
  }

  getOptions = async () => {
    const { data: apps } = await api.getApps();
    const { data: pipelines } = await api.getPipelines();
    const { data: sites } = await api.getSites();

    this.setState({
      options: [
        {
          label: 'Apps',
          options: apps.map(app => ({ value: app.name, label: app.name, uri: `/apps/${app.name}/info` })),
        },
        {
          label: 'Pipelines',
          options: pipelines.map(pipe => ({ value: pipe.id, label: pipe.name, uri: `/pipelines/${pipe.id}/review` })),
        },
        {
          label: 'Sites',
          options: sites.map(site => ({ value: site.id, label: site.domain, uri: `/sites/${site.id}/info` })),
        },
      ],
    });
  }

  focusChanged = () => this.setState({ focused: !this.state.focused });

  filter = input => option => option.label.toLowerCase().indexOf(input.toLowerCase()) > -1;

  // Search after 300ms so that we don't do unnecessary filtering while the user is typing
  // Return only the first 'maxOptions' results so the list doesn't get unnecessarily long
  search = (input, cb) => {
    clearTimeout(timer);
    const { options } = this.state;
    const maxOptions = 10;
    if (!options || options.length !== 3) { cb([]); } else {
      timer = setTimeout(() => {
        const results = [
          {
            label: 'Apps',
            options: options[0].options.filter(this.filter(input)).slice(0, maxOptions),
          },
          {
            label: 'Pipelines',
            options: options[1].options.filter(this.filter(input)).slice(0, maxOptions),
          },
          {
            label: 'Sites',
            options: options[2].options.filter(this.filter(input)).slice(0, maxOptions),
          },
        ];
        cb(results);
      }, 300);
    }
  }

  render() {
    const { onSearch, classes, theme } = this.props;
    const { value } = this.state;

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
      <div
        className={`${classes.rootBase} ${(!this.state.focused && isEmpty(value)) ? classes.rootSm : classes.rootLg}`}
        onBlur={this.focusChanged}
        onFocus={this.focusChanged}
      >
        <NoSsr>
          <div className={classes.container}>
            <AsyncSearch
              loadOptions={this.search}
              defaultOptions
              classes={classes}
              styles={selectStyles}
              components={components}
              value={isEmpty(value) ? '' : value}
              onChange={(inputValue) => {
                this.setState({ value: inputValue });
                onSearch(inputValue);
              }}
              placeholder="Search"
              noOptionsMessage={({ inputValue }) => (inputValue.length > 0 ? 'No results' : 'Start typing...')}
            />
          </div>
        </NoSsr>
      </div>
    );
  }
}

/* eslint-disable */
GlobalSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
/* eslint-enable */

export default withStyles(styles, { withTheme: true })(GlobalSearch);
