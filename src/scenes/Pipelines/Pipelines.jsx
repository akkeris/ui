import React from 'react';
import {
  Toolbar, IconButton, CircularProgress, Paper, Table, TableBody, TableRow, TableCell,
  Snackbar, TableFooter, TablePagination, TableHead, TableSortLabel, Tooltip,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';

import History from '../../config/History';
import FilterSelect from '../../components/FilterSelect';
import BaseComponent from '../../BaseComponent';

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
  title: {
    flex: '0 0 auto',
    marginLeft: '-12px',
  },
};

class Pipelines extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      pipelines: [],
      sortedPipelines: [],
      open: false,
      message: '',
      page: 0,
      rowsPerPage: 15,
      sortBy: 'name',
      sortDirection: 'asc',
      options: [],
      filters: [],
      isFilter: false,
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getData();
  }

  getData = async () => {
    try {
      const { data: pipelines } = await this.api.getPipelines();
      const options = [
        {
          label: 'Pipeline',
          options: pipelines.map(pipeline => ({ label: pipeline.name, value: pipeline.name, type: 'pipeline' })),
        },
      ];
      this.setState({
        pipelines, sortedPipelines: pipelines, loading: false, options,
      }, () => {
        let values;
        try {
          values = JSON.parse(localStorage.getItem('akkeris_pipeline_filters'));
        } catch (e) {
          values = [];
        }
        this.handleFilterChange(values);
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
  }

  handleFilterChange = (values) => {
    if (!values || values.length === 0) {
      this.setState({ sortedPipelines: this.state.pipelines, filters: [], page: 0 });
      localStorage.setItem('akkeris_pipeline_filters', JSON.stringify(values));
      return;
    }

    const pipelineFilters = values.filter(({ type }) => type === 'pipeline');
    const partialFilters = values.filter(({ type }) => type === 'partial');

    const filterPartial = pipeline => ({ label }) => pipeline.name.search(new RegExp(`.*${label}.*`, 'i')) !== -1;

    const filterLabel = pipeline => ({ label }) => (
      pipeline.name.toLowerCase().includes(label.toLowerCase())
    );

    const sortedPipelines = this.state.pipelines.filter((pipeline) => {
      if (pipelineFilters.length > 0 && !pipelineFilters.some(filterLabel(pipeline, 'pipeline'))) {
        return false;
      } else if (partialFilters.length > 0 && !partialFilters.some(filterPartial(pipeline))) {
        return false;
      }
      return true;
    });

    this.setState({ sortedPipelines, filters: values, page: 0 });

    localStorage.setItem('akkeris_pipeline_filters', JSON.stringify(values));
  }

  handleFilter = () => {
    if (this.state.filters.length > 0) {
      this.setState({ isFilter: true });
    } else {
      this.setState({ isFilter: !this.state.isFilter });
    }
  }

  handleRowSelection = (name) => {
    History.get().push(`/pipelines/${name}/review`);
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  reload = async (message) => {
    try {
      this.setState({ loading: true });
      const { data: pipelines } = await this.api.getPipelines();
      this.setState({
        pipelines,
        sortedPipelines: pipelines,
        message,
        loading: false,
        open: true,
        page: 0,
        rowsPerPage: 15,
      });
    } catch (err) {
      if (!this.isCancel(err)) {
        console.error(err); // eslint-disable-line no-console
      }
    }
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
          onClick={() => this.handleRowSelection(pipeline.name)}
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
    const {
      page, rowsPerPage, sortedPipelines, sortBy, sortDirection,
    } = this.state;
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
          <IconButton
            className="new-pipeline"
            style={style.icon}
            onClick={() => History.get().push('/pipelines/new-pipeline')}
          >
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <Toolbar style={{ paddingTop: '6px' }}>
            <div style={style.title}>
              <Tooltip title="Filter">
                <IconButton aria-label="filter" onClick={this.handleFilter} className="addFilter">
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </div>
            {(this.state.isFilter || this.state.filters.length > 0) && (
              <FilterSelect
                options={this.state.options}
                onSelect={this.handleFilterChange}
                filters={this.state.filters}
                placeholder="Type to filter..."
                textFieldProps={{ variant: 'outlined' }}
              />
            )}
          </Toolbar>
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
            {sortedPipelines.length !== 0 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 25, 50]}
                    colSpan={4}
                    count={sortedPipelines.length}
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
