import React, { Component } from 'react';
import deepmerge from 'deepmerge';
import {
  Toolbar, IconButton, CircularProgress, Paper, Table, TableBody, TableRow, TableCell,
  Snackbar, Divider, Collapse, TableFooter, TablePagination,
} from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';

import { NewPipeline } from '../../components/Pipelines';
import api from '../../services/api';
import util from '../../services/util';
import Search from '../../components/Search';
import History from '../../config/History';

const theme = parentTheme => deepmerge(parentTheme, {
  overrides: {
    MuiToolbar: {
      root: {
        minHeight: '48px !important',
        maxHeight: '48px !important',
      },
    },
    MuiIconButton: {
      root: { color: 'white', padding: '6px', marginBottom: '-6px' },
    },
  },
});

const style = {
  refresh: {
    div: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '40px',
      height: '40px',
      marginTop: '15%',
      marginBottom: '5%',
    },
    indicator: {
      display: 'inline-block',
      position: 'relative',
      color: 'white',
    },
  },
  toolbar: {
    backgroundColor: 'rgba(0,0,0,0)',
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
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
    marginLeft: 'auto',
    color: 'white',
  },
  cancelIcon: {
    margin: '5px',
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
      page: 0,
      rowsPerPage: 15,
    };
  }

  componentDidMount() {
    this.getPipelines();
  }

  getPipelines = async () => {
    const { data: pipelines } = await api.getPipelines();
    this.setState({ pipelines, loading: false });
  }

  handleRowSelection = (id) => {
    History.get().push(`/pipelines/${id}/review`);
  }

  handleSearch = (searchText) => {
    History.get().push(`/pipelines/${searchText}/review`);
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

  reload = async (message) => {
    this.setState({ loading: true });
    const { data: pipelines } = await api.getPipelines();
    this.setState({
      pipelines, message, loading: false, new: false, open: true, page: 0, rowsPerPage: 15,
    });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  renderPipelines() {
    const { page, rowsPerPage, pipelines } = this.state;
    return pipelines.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map((pipeline) => {
      const date = new Date(pipeline.updated_at);
      return (
        <TableRow
          className={pipeline.name}
          key={pipeline.id}
          style={style.tableRow}
          hover
          onClick={() => this.handleRowSelection(pipeline.id)}
        >
          <TableCell>
            <div style={style.tableRowColumn.title}>{pipeline.name}</div>
            <div style={style.tableRowColumn.sub}>{pipeline.id}</div>
          </TableCell>
          <TableCell>
            <div style={style.tableRowColumn.title}>{date.toLocaleString()}</div>
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    const { page, rowsPerPage, pipelines } = this.state;
    if (this.state.loading) {
      return (
        <MuiThemeProvider theme={theme}>
          <div style={style.refresh.div}>
            <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
          </div>
        </MuiThemeProvider>);
    }
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Toolbar style={style.toolbar}>
            <Search
              className="search"
              data={util.filterName(this.state.pipelines)}
              handleSearch={this.handleSearch}
            />
            {!this.state.new && (
              <IconButton
                className="new-pipeline"
                style={style.icon}
                onClick={this.handleNewPipeline}
              >
                <AddIcon />
              </IconButton>
            )}
          </Toolbar>
          <Paper style={style.paper}>
            <Collapse in={this.state.new}>
              <div>
                <IconButton className="cancel" onClick={this.handleNewPipelineCancel} style={style.cancelIcon}>
                  <RemoveIcon nativeColor="black" />
                </IconButton>
                <NewPipeline onComplete={this.reload} />
                <Divider style={{ marginTop: '15px' }} />
              </div>
            </Collapse>

            <Table className="pipeline-list">
              <TableBody >
                {this.renderPipelines()}
              </TableBody>
              {pipelines.length !== 0 && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[15, 25, 50]}
                      colSpan={4}
                      count={pipelines.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Paper>
          <Snackbar
            className="pipelines-snack"
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={3000}
            onClose={this.handleRequestClose}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Pipelines;
