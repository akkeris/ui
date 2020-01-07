import React from 'react';
import {
  Table, TableBody, TableHead, TableRow, TableCell, CircularProgress, Paper,
  TableFooter, TablePagination, TableSortLabel, Tooltip, Toolbar, IconButton,
} from '@material-ui/core';
/* eslint-disable jsx-a11y/anchor-is-valid */
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
      paddingTop: '50px',
      paddingBottom: '50px',
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
    marginTop: '12px',
  },
  link: {
    textDecoration: 'none',
    marginLeft: 'auto',
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
  },
  tableCell: {
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
  title: {
    flex: '0 0 auto',
    marginLeft: '-12px',
  },
};

export default class SpacesList extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      spaces: [],
      page: 0,
      rowsPerPage: 15,
      sortBy: 'space',
      sortDirection: 'asc',
      sortedSpaces: [],
      options: [],
      filters: [],
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.getData();
  }

  getData = async () => {
    try {
      const { data: spaces } = await this.api.getSpaces();

      const options = [
        {
          label: 'Spaces',
          options: spaces.map(space => ({ label: space.name, value: space.name, type: 'space' })),
        },
      ];

      this.setState({
        spaces,
        sortedSpaces: spaces,
        loading: false,
        options,
      }, () => {
        let values;
        try {
          values = JSON.parse(localStorage.getItem('akkeris_space_filters'));
        } catch (e) {
          values = [];
        }
        this.handleFilterChange(values);
      });
    } catch (error) {
      if (!this.isCancel(error)) {
        console.error(error); // eslint-disable-line no-console
      }
    }
  }

  handleNew = () => {
    History.get().push('/spaces/new-space');
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleFilterChange = (values) => {
    if (!values || values.length === 0) {
      this.setState({ sortedSpaces: this.state.spaces, filters: [] }, this.handleSort);
      localStorage.setItem('akkeris_space_filters', JSON.stringify(values));
      return;
    }

    const spaceFilters = values.filter(({ type }) => type === 'space');
    const partialFilters = values.filter(({ type }) => type === 'partial');

    const filterLabel = space => ({ label }) => (
      space.name.toLowerCase().includes(label.toLowerCase())
    );

    const filterPartial = space => ({ label }) => space.name.search(new RegExp(`.*${label}.*`, 'i')) !== -1;

    const sortedSpaces = this.state.spaces.filter((space) => {
      if (spaceFilters.length > 0 && !spaceFilters.some(filterLabel(space, 'space'))) {
        return false;
      } else if (partialFilters.length > 0 && !partialFilters.some(filterPartial(space))) {
        return false;
      }
      return true;
    });

    this.setState({ sortedSpaces, filters: values }, this.handleSort);

    localStorage.setItem('akkeris_space_filters', JSON.stringify(values));
  }

  handleFilter = () => {
    if (this.state.filters.length > 0) {
      this.setState({ isFilter: true });
    } else {
      this.setState({ isFilter: !this.state.isFilter });
    }
  }

  handleSortChange = column => () => {
    const sb = column;
    let sd = 'desc';
    if (this.state.sortBy === column && this.state.sortDirection === 'desc') {
      sd = 'asc';
    }
    this.setState({ sortBy: sb, sortDirection: sd });

    const { sortedSpaces } = this.state;

    const ss = sortedSpaces.sort((a, b) => {
      switch (`${sb}-${sd}`) {
        case 'space-asc':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'space-desc':
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case 'app-asc':
          return a.apps - b.apps;
        case 'app-desc':
          return b.apps - a.apps;
        case 'compliance-asc':
          return a.compliance.sort().join('').toLowerCase().localeCompare(b.compliance.sort().join('').toLowerCase());
        case 'compliance-desc':
          return b.compliance.sort().join('').toLowerCase().localeCompare(a.compliance.sort().join('').toLowerCase());
        case 'stack-asc':
          return a.stack.name.toLowerCase().localeCompare(b.stack.name.toLowerCase());
        case 'stack-desc':
          return b.stack.name.toLowerCase().localeCompare(a.stack.name.toLowerCase());
        default:
          return 0;
      }
    });

    this.setState({ sortedSpaces: ss, page: 0 });
  }

  renderSpaces(page, rowsPerPage) {
    return this.state.sortedSpaces
      .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
      .map(space => (
        <TableRow hover className={space.name} key={space.id} style={style.tableRow}>
          <TableCell>
            <div style={style.tableCell.title}>{space.name}</div>
            <div style={style.tableCell.sub}>{space.id}</div>
          </TableCell>
          <TableCell style={style.tableCell.icon}>
            <div style={style.tableCell.title}>{space.apps}</div>
          </TableCell>
          <TableCell>
            <div style={style.tableCell.title}>{space.compliance.toString()}</div>
          </TableCell>
          <TableCell>
            <div style={style.tableCell.title}>{space.stack.name}</div>
          </TableCell>
        </TableRow>
      ));
  }

  render() {
    const { spaces, page, rowsPerPage, sortBy, sortDirection } = this.state;
    if (this.state.loading) {
      return (
        <div style={style.refresh.div}>
          <CircularProgress top={0} size={40} left={0} style={style.refresh.indicator} color="primary" status="loading" />
        </div>
      );
    }
    return (
      <div>
        <Toolbar style={style.toolbar} disableGutters>
          <IconButton
            onClick={this.handleNew}
            className="new-space"
            style={{ marginLeft: 'auto', padding: '6px', marginBottom: '-6px' }}
          >
            <AddIcon style={{ color: 'white' }} className={'new-space'} />
          </IconButton>
        </Toolbar>
        <Paper style={style.paper}>
          <Toolbar style={{ paddingTop: '6px' }}>
            <div style={style.title}>
              <Tooltip title="Filter">
                <IconButton aria-label="filter" onClick={this.handleFilter} className="addFilter" >
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
          <Table className="space-list" >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={sortBy === 'space'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('space')}
                    >
                      Space
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
                      active={sortBy === 'app'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('app')}
                    >
                      Apps
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
                      active={sortBy === 'compliance'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('compliance')}
                    >
                      Compliance
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
                      active={sortBy === 'stack'}
                      direction={sortDirection}
                      onClick={this.handleSortChange('stack')}
                    >
                      Stack
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderSpaces(page, rowsPerPage)}
            </TableBody>
            {spaces.length !== 0 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[15, 25, 50]}
                    colSpan={4}
                    count={spaces.length}
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
      </div>
    );
  }
}
