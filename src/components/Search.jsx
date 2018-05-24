import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AutoComplete from 'material-ui/AutoComplete';
import PropTypes from 'prop-types';

const muiTheme = getMuiTheme();

/* eslint-disable react/default-props-match-prop-types, react/prop-types */

export default class Search extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchText: this.props.searchText,
    };
  }

  handleUpdateInput = (searchText) => {
    this.setState({ searchText });
  };

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <AutoComplete
          className={this.props.className}
          searchText={this.state.searchText}
          hintText={this.props.label}
          hintStyle={this.props.hintStyle}
          dataSource={this.props.data}
          onUpdateInput={this.handleUpdateInput}
          filter={AutoComplete.fuzzyFilter}
          maxSearchResults={5}
          onNewRequest={this.props.handleSearch}
          errorText={this.props.errorText}
          inputStyle={this.props.style}
        />
      </MuiThemeProvider>
    );
  }
}

Search.propTypes = {
  data: PropTypes.arrayOf(React.PropTypes.string).isRequired,
  handleSearch: PropTypes.func,
  errorText: PropTypes.string,
  searchText: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};

Search.defaultProps = {
  handleSearch: null,
  errorText: '',
  searchText: '',
  label: 'Search',
  hintStyle: null,
  style: null,
  className: 'autocomplete',
};
