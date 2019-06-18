import React, { Component } from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, Table, TableBody, TableRow, TableCell,
  Snackbar, Divider, Collapse, TableFooter, TablePagination, TableHead, TableSortLabel, Tooltip,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';

import { NewPipeline } from '../../components/Pipelines';
import api from '../../services/api';
import History from '../../config/History';

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
    padding: '12px 0px',
  },
  paper: {
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '12px',
    marginBottom: '12px',
    overflow: 'auto',
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
    padding: '6px',
    marginBottom: '-6px',
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
      sortedPipelines: [],
      new: false,
      open: false,
      message: '',
      page: 0,
      rowsPerPage: 15,
      sortBy: 'name',
      sortDirection: 'asc',
    };
  }

  componentDidMount() {
    this.getPipelines();
  }

  getPipelines = async () => {
    const { data: pipelines } = await api.getPipelines();
    this.setState({ pipelines, sortedPipelines: pipelines, loading: false });
  }

  handleRowSelection = (id) => {
    History.get().push(`/pipelines/${id}/review`);
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

  handleSortChange = column => () => {
    const sb = column;
    let sd = 'desc';
    if (this.state.sortBy === column && this.state.sortDirection === 'desc') {
      sd = 'asc';
    }
    this.setState({ sortBy: sb, sortDirection: sd });

    const { sortedPipelines } = this.state;

    const sp = sortedPipelines.sort((a, b) => {
      switch (`${sb}-${sd}`) {
        case 'name-asc':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'name-desc':
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case 'date-asc':
          return (a.updated_at < b.updated_at) ? -1 : ((a.updated_at > b.updated_at) ? 1 : 0); // eslint-disable-line
        case 'date-desc':
          return (b.updated_at < a.updated_at) ? -1 : ((b.updated_at > a.updated_at) ? 1 : 0); // eslint-disable-line
        default:
          return 0;
      }
    });

    this.setState({ sortedPipelines: sp, page: 0 });
  }

  renderPipelines() {
    const { page, rowsPerPage, sortedPipelines } = this.state;
    return sortedPipelines.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map((pipeline) => { // eslint-disable-line
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
    const { page, rowsPerPage, pipelines, sortBy, sortDirection } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Toolbar style={style.toolbar}>
          {!this.state.new && (
            <IconButton
              className="new-pipeline"
              style={style.icon}
              onClick={this.handleNewPipeline}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          )}
        </Toolbar>
        <Paper style={style.paper}>
          <Collapse in={this.state.new}>
            <div>
              <IconButton className="cancel" onClick={this.handleNewPipelineCancel} style={style.cancelIcon}>
                <RemoveIcon htmlColor="black" />
              </IconButton>
              <NewPipeline onComplete={this.reload} />
              <Divider style={{ marginTop: '15px' }} />
            </div>
          </Collapse>
          <Table className="pipeline-list">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('name')}
                    >
                      Pipeline
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'date'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('date')}
                    >
                      Updated
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
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
    );
  }
}

export default Pipelines;
