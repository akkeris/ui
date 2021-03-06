import React from 'react';
import deepmerge from 'deepmerge';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { TextField, MenuItem, Paper, withStyles } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import PropTypes from 'prop-types';
import BaseComponent from '../BaseComponent';

const styles = theme => ({
  input: {
    width: '100%',
    minWidth: '300px',
  },
  container: {
    width: '100%',
    position: 'relative',
    minWidth: '300px',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing(2),
  },
});

/* eslint-disable react/default-props-match-prop-types, react/prop-types */

class AutoSuggest extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.popperNode = null;
    this.state = {
      single: props.initialValue,
      popper: '',
      suggestions: [],
    };

    const { color } = this.props;

    this.theme = parentTheme => deepmerge(parentTheme, {
      overrides: {
        MuiInput: {
          input: {
            '&::placeholder': {
              color,
            },
            color,
          },
          underline: {
            // Border color when input is not selected
            '&:before': {
              borderBottom: '1px solid rgb(200, 200, 200)',
            },
            // Border color when input is selected
            '&:after': {
              borderBottom: `1px solid ${color}`,
            },
            // Border color on hover
            '&:hover:not([class^=".MuiInput-disabled-"]):not([class^=".MuiInput-focused-"]):not([class^=".MuiInput-error-"]):before': {
              borderBottom: '1px solid rgb(200, 200, 200)',
            },
          },
        },
      },
    });
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let results = 0;
    const maxResults = 5;

    if (inputLength === 0) { return []; }

    return this.props.data.filter((suggestion) => {
      const keep = results < maxResults && suggestion.toLowerCase().includes(inputValue);
      if (keep) {
        results += 1;
      }
      return keep;
    });
  }

  getSuggestionValue = suggestion => suggestion;

  catchReturn = (event, value) => {
    if (event.key === 'Enter') {
      this.props.handleSearch(value);
      event.preventDefault();
    }
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) });
  }

  handleSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  }

  handleChange = name => (event, { newValue }) => {
    this.setState({ [name]: newValue });
  }

  handleSuggestionSelected = (event, { suggestion }) => {
    this.props.handleSearch(suggestion);
  }

  // https://github.com/moroshko/autosuggest-highlight/issues/5#issuecomment-392333344
  customMatch = (text, query) => {
    const results = [];
    const trimmedQuery = query.trim().toLowerCase();
    const textLower = text.toLowerCase();
    const queryLength = trimmedQuery.length;
    let indexOf = textLower.indexOf(trimmedQuery);
    while (indexOf > -1) {
      results.push([indexOf, indexOf + queryLength]);
      indexOf = textLower.indexOf(query, indexOf + queryLength);
    }
    return results;
  }

  // Render the individual suggestion, highlighting the query inside the text
  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = this.customMatch(suggestion, query);
    const parts = parse(suggestion, matches);
    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {parts.map((part, index) => (part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )))}
        </div>
      </MenuItem>
    );
  }

  renderInputComponent(inputProps) { // eslint-disable-line class-methods-use-this
    const { catchReturn, errorText, value, muiTheme, holdSelection, ...other } = inputProps;
    return (
      <MuiThemeProvider theme={muiTheme}>
        <TextField
          onKeyPress={event => catchReturn(event, value)}
          error={errorText ? true : undefined}
          value={holdSelection ? value : undefined}
          {...other}
        />
      </MuiThemeProvider>
    );
  }

  render() {
    const { classes, errorText, labelText, className, placeholder } = this.props;
    const autoSuggestProps = {
      renderInputComponent: this.renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: this.getSuggestionValue,
      renderSuggestion: this.renderSuggestion,
      onSuggestionSelected: this.handleSuggestionSelected,
    };
    return (
      <div className={className}>
        <Autosuggest
          {...autoSuggestProps}
          inputProps={{
            catchReturn: this.catchReturn,
            errorText,
            muiTheme: this.theme,
            placeholder,
            label: errorText || labelText || undefined,
            value: this.state.single,
            onChange: this.handleChange('single'),
            holdSelection: this.props.holdSelection,
          }}
          theme={{
            input: classes.input,
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}

AutoSuggest.propTypes = {
  color: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorText: PropTypes.string,
  labelText: PropTypes.string,
  handleSearch: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  holdSelection: PropTypes.bool,
  initialValue: PropTypes.string,
};

AutoSuggest.defaultProps = {
  errorText: '',
  handleSearch: () => {},
  className: '',
  placeholder: 'Search',
  color: 'white',
  holdSelction: false,
  initialValue: '',
};

export default withStyles(styles)(AutoSuggest);
