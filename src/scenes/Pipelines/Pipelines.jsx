import React, { Component } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/clear';

import { NewPipeline } from '../../components/Pipelines';
import api from '../../services/api';
import util from '../../services/util';
import Search from '../../components/Search';

const muiTheme = getMuiTheme({
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '20%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
    },
  },
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '16px 0',
  },
  link: {
    textDecoration: 'none',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
  },
  tableRow: {
    height: '58px',
    cursor: 'pointer',
  },
  tableRowColumn: {
    title: {
      fontSize: '16px',
    },
    sub: {
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    end: {
      float: 'right',
    },
    icon: {
      width: '58px',
    },
  },
  icon: {
    color: 'white',
  },
  search: {
    color: 'white',
    WebkitTextFillColor: 'white',
  },
  searchHint: {
    color: 'rgba(255,255,255,0.3)',
  },
};

class Pipelines extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      pipelines: [],
      new: false,
      open: false,
      message: '',
    };
  }

  componentDidMount() {
    api.getPipelines().then((response) => {
      this.setState({
        loading: false,
        pipelines: response.data,
      });
    });
  }

  getPipelines() {
    return this.state.pipelines.map((pipeline) => {
      const date = new Date(pipeline.updated_at);
      return (
        <TableRow className={pipeline.name} key={pipeline.id} style={style.tableRow}>
          <TableRowColumn>
            <div style={style.tableRowColumn.title}>{pipeline.name}</div>
            <div style={style.tableRowColumn.sub}>{pipeline.id}</div>
          </TableRowColumn>
          <TableRowColumn>
            <div style={style.tableRowColumn.title}>{date.toLocaleString()}</div>
          </TableRowColumn>
        </TableRow>
      );
    });
  }

  handleRowSelection = (selectedRows) => {
    window.location = `#/pipelines/${this.state.pipelines[selectedRows].name}/review`;
  }

  handleSearch = (searchText) => {
    window.location = `#/pipelines/${searchText}/review`;
  }

  handleNewPipeline = () => {
    this.setState({ new: true });
  }

  handleNewPipelineCancel = () => {
    this.setState({ new: false });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  reload = (message) => {
    this.setState({ loading: true });
    api.getPipelines().then((response) => {
      this.setState({
        loading: false,
        pipelines: response.data,
        new: false,
        open: true,
        message,
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={style.refresh.div}>
            <RefreshIndicator top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Toolbar style={style.toolbar}>
            <ToolbarGroup>
              <Search
                style={style.search}
                hintStyle={style.searchHint}
                className="search"
                data={util.filterName(this.state.pipelines)}
                handleSearch={this.handleSearch}
              />
            </ToolbarGroup>
            <ToolbarGroup>
              {!this.state.new && (
                <IconButton
                  className="new-pipeline"
                  iconStyle={style.icon}
                  onClick={this.handleNewPipeline}
                >
                  <AddIcon />
                </IconButton>
              )}
            </ToolbarGroup>
          </Toolbar>
          <Paper style={style.paper}>
            {this.state.new && (
              <div>
                <IconButton className="cancel" onClick={this.handleNewPipelineCancel}><RemoveIcon /></IconButton>
                <NewPipeline onComplete={this.reload} />
                <Divider />
              </div>
            )}
            <Table className="pipeline-list" onRowSelection={this.handleRowSelection} wrapperStyle={{ overflow: 'visible' }} bodyStyle={{ overflow: 'visible' }}>
              <TableBody displayRowCheckbox={false} showRowHover selectable={false}>
                {this.getPipelines()}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            className="pipelines-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Pipelines;
