import React from 'react';
import PropTypes from 'prop-types';
import AsyncSearch from 'react-select/lib/Async';
import {
  NoSsr, Typography, TextField, MenuItem, Paper, Divider, InputAdornment, CircularProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles';
import api from '../services/api';
import { isEmpty, truncstr } from '../services/util';
import BaseComponent from '../BaseComponent';

const styles = theme => ({
  rootBase: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    marginRight: '32px',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
  },
  rootSm: { width: '250px' },
  rootLg: { width: '350px' },
  container: {
    flexGrow: 1,
  },
  Input: {
    color: 'white',
  },
  input: {
    display: 'flex',
    padding: 0,
    color: 'white',
    height: 'unset',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    color: 'white',
    overflow: 'hidden',
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
    color: 'white',
  },
  placeholder: {
    position: 'absolute',
    left: 40,
    fontSize: 16,
    color: '#AAAAAA',
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
    color: 'white',
    marginRight: '12px',
  },
});

const inputComponent = ({ inputRef, ...props }) => <div ref={inputRef} {...props} />;

const Control = props => (
  <TextField
    className="global-search"
    fullWidth
    InputProps={{
      disableUnderline: true,
      inputComponent,
      className: props.selectProps.classes.Input,
      inputProps: {
        className: `${props.selectProps.classes.input}`,
        inputRef: props.inputRef,
        children: props.children,
        ...props.innerProps,
      },
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon className={props.selectProps.classes.searchIcon} htmlColor="white" />
        </InputAdornment>
      ),
    }}
    {...props.selectProps.textFieldProps}
  />
);

const Menu = props => (
  <Paper square className={`${props.selectProps.classes.paper} global-search-results`} {...props.innerProps}>
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
  <div className={`${props.selectProps.classes.headingContainer} group-heading`}>
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
    {truncstr(props.children, 25)}
  </Typography>
);

const ValueContainer = props => (
  <div className={props.selectProps.classes.valueContainer}>{props.children}</div>  // eslint-disable-line
);

const LoadingIndicator = props => <CircularProgress size={20} className={props.selectProps.classes.loadingIndicator} color="inherit" />; // eslint-disable-line

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  SingleValue,
  ValueContainer,
  Placeholder,
  GroupHeading,
  LoadingIndicator,
};

let timer = null;

class GlobalSearch extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = { options: [], value: {}, focused: false };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getOptions();
    api.notify.add({ name: 'globalSearch', cb: () => setTimeout(() => this.getOptions(), 2000) });
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    if (!value) {
      return;
    }
    const path = window.location.pathname;
    if (!path.includes(value.label) && !path.includes(value.value) && prevState.value === value) {
      this.setState({ value: {} }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    api.notify.remove('globalSearch');
  }

  getOptions = async () => {
    try {
      const { data: apps } = await this.api.getApps('?simple=true');
      const { data: pipelines } = await this.api.getPipelines();
      const { data: sites } = await this.api.getSites();

      apps.sort((a, b) => a.name.replace(/[-]/g, '').toLowerCase().localeCompare(b.name.replace(/[-]/g, '').toLowerCase()));
      pipelines.sort((a, b) => a.name.replace(/[-]/g, '').toLowerCase().localeCompare(b.name.replace(/[-]/g, '').toLowerCase()));
      sites.sort((a, b) => a.domain.replace(/[-._]/g, '').toLowerCase().localeCompare(b.domain.replace(/[-._]/g, '').toLowerCase()));

      this.setState({
        options: [
          {
            label: 'Apps',
            options: apps.map(app => ({ value: app.name, label: app.name, uri: `/apps/${app.name}/info` })),
          },
          {
            label: 'Pipelines',
            options: pipelines.map(pipe => ({ value: pipe.id, label: pipe.name, uri: `/pipelines/${pipe.name}/review` })),
          },
          {
            label: 'Sites',
            options: sites.map(site => ({ value: site.id, label: site.domain, uri: `/sites/${site.id}/info` })),
          },
        ],
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  focusChanged = () => this.setState({ focused: !this.state.focused });

  filter = input => option => option.label.toLowerCase().indexOf(input.toLowerCase()) > -1;

  /* eslint-disable no-param-reassign */
  orderResults = (options) => {
    const path = window.location.pathname;
    if (path.includes('/pipelines')) {
      [options[0], options[1]] = [options[1], options[0]];
    } else if (path.includes('/sites')) {
      options.reverse();
    }
    return options;
  }
  /* eslint-enable no-param-reassign */

  // Search after 300ms so that we don't do unnecessary filtering while the user is typing
  // Return only the first 'maxOptions' results so the list doesn't get unnecessarily long
  search = (input, cb) => {
    clearTimeout(timer);
    const { options } = this.state;
    const { maxResults } = this.props;
    if (!options || options.length !== 3) { cb([]); } else {
      timer = setTimeout(() => {
        const results = [
          {
            label: 'Apps',
            options: options[0].options.filter(this.filter(input)).slice(0, maxResults),
          },
          {
            label: 'Pipelines',
            options: options[1].options.filter(this.filter(input)).slice(0, maxResults),
          },
          {
            label: 'Sites',
            options: options[2].options.filter(this.filter(input)).slice(0, maxResults),
          },
        ];
        cb(this.orderResults(results));
      }, 300);
    }
  }

  render() {
    const { onSearch, classes } = this.props;
    const { value } = this.state;

    const selectStyles = {
      input: base => ({
        ...base,
        color: 'white',
        '& input': {
          font: 'inherit',
        },
      }),
      dropdownIndicator: base => ({
        ...base,
        color: '#AAAAAA',
        '&:hover': {
          color: '#DDDDDD',
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
              ref={(c) => { this.asyncSearch = c; }}
              loadOptions={this.search}
              defaultOptions
              classes={classes}
              styles={selectStyles}
              components={components}
              value={isEmpty(value) ? '' : value}
              onChange={(inputValue) => {
                onSearch(inputValue);
                this.asyncSearch.blur();
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
  maxResults: PropTypes.number, // Number of max results per category to show
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
/* eslint-enable */

GlobalSearch.defaultProps = {
  maxResults: 10,
};

export default withStyles(styles, { withTheme: true })(GlobalSearch);
