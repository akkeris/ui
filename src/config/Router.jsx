import React from 'react';
import { Router as BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Loadable from 'react-loadable';
import Loading from '../components/Loading';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

import History from './History';
import globalTheme from './GlobalTheme';
import GA from './GoogleAnalytics';

const PageNotFound = Loadable({
  loader: () => import('../components/PageNotFound'),
  loading: Loading,
});
const Apps = Loadable({
  loader: () => import('../scenes/Apps/Apps'),
  loading: Loading,
});

const NewApp = Loadable({
  loader: () => import('../scenes/Apps/NewApp'),
  loading: Loading,
});
const AppInfo = Loadable({
  loader: () => import('../scenes/Apps/AppInfo'),
  loading: Loading,
  render(loaded, props) {
    const Component = loaded.default;
    return <Component {...props} key={props.match.params.app} />;
  },
});

const AppRoutes = () => (
  <Switch>
    <Route exact path="/apps" component={Apps} />
    <Route exact path="/apps/new" component={NewApp} />
    <Route path="/apps/:app/:tab?" component={AppInfo} />
  </Switch>
);

const Dashboard = Loadable({
  loader: () => import('../scenes/Dashboard/Dashboard'),
  loading: Loading,
});
const DashboardRoutes = () => (
  <Switch>
    <Route path="/dashboard/:tab?" component={Dashboard} />
  </Switch>
);

const Pipelines = Loadable({
  loader: () => import('../scenes/Pipelines/Pipelines'),
  loading: Loading,
});
const NewPipeline = Loadable({
  loader: () => import('../scenes/Pipelines/NewPipeline'),
  loading: Loading,
});
const PipelineInfo = Loadable({
  loader: () => import('../scenes/Pipelines/PipelineInfo'),
  loading: Loading,
  render(loaded, props) {
    const Component = loaded.default;
    return <Component {...props} key={props.match.params.pipeline} />;
  },
});

const PipelineRoutes = () => (
  <Switch>
    <Route exact path="/pipelines" component={Pipelines} />
    <Route exact path="/pipelines/new-pipeline" component={NewPipeline} />
    <Route path="/pipelines/:pipeline/:tab?" component={PipelineInfo} />
  </Switch>
);

const Spaces = Loadable({
  loader: () => import('../scenes/Collections/SpacesList'),
  loading: Loading,
});
const NewSpace = Loadable({
  loader: () => import('../scenes/Collections/NewSpace'),
  loading: Loading,
});
const SpacesRoutes = () => (
  <Switch>
    <Route exact path="/spaces/new-space" component={NewSpace} />
    <Route exact path="/spaces" component={Spaces} />
  </Switch>
);

const Orgs = Loadable({
  loader: () => import('../scenes/Collections/OrgsList'),
  loading: Loading,
});
const NewOrg = Loadable({
  loader: () => import('../scenes/Collections/NewOrg'),
  loading: Loading,
});
const OrgsRoutes = () => (
  <Switch>
    <Route exact path="/orgs/new-org" component={NewOrg} />
    <Route exact path="/orgs" component={Orgs} />
  </Switch>
);

const Invoices = Loadable({
  loader: () => import('../scenes/Invoices/Invoices'),
  loading: Loading,
});
const InvoiceInfo = Loadable({
  loader: () => import('../scenes/Invoices/InvoiceInfo'),
  loading: Loading,
});
const WasteReport = Loadable({
  loader: () => import('../scenes/Invoices/WasteReport'),
  loading: Loading,
});

const InvoiceRoutes = () => (
  <Switch>
    <Route exact path="/invoices" component={Invoices} />
    <Route exact path="/invoices/:invoice" component={InvoiceInfo} />
    <Route exact path="/invoices/:invoice/:org" component={WasteReport} />
  </Switch>
);

const AppSetups = Loadable({
  loader: () => import('../scenes/AppSetups/AppSetups'),
  loading: Loading,
});

const AppSetupsRoutes = () => (
  <Switch>
    <Route path="/app-setups" component={AppSetups} />
  </Switch>
);

const Sites = Loadable({
  loader: () => import('../scenes/Sites/Sites'),
  loading: Loading,
});
const NewSite = Loadable({
  loader: () => import('../scenes/Sites/NewSite'),
  loading: Loading,
});
const SiteInfo = Loadable({
  loader: () => import('../scenes/Sites/SiteInfo'),
  loading: Loading,
  render(loaded, props) {
    const Component = loaded.default;
    return <Component {...props} key={props.match.params.site} />;
  },
});

const SitesRoutes = () => (
  <Switch>
    <Route exact path="/sites" component={Sites} />
    <Route exact path="/sites/new" component={NewSite} />
    <Route path="/sites/:site/:tab?" component={SiteInfo} />
  </Switch>
);

const Router = () => (
  <BrowserRouter history={History.get()}>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      { GA.init({ token: sessionStorage.getItem('ga_token') }) && <GA.RouteTracker /> }
      <MuiThemeProvider theme={globalTheme}>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
          <Nav />
          <div style={{ flex: 1, marginTop: '64px' }}>
            <div style={{ width: 'calc(100% - 64px)' }}>
              <Switch>
                <Route exact path="/" render={() => <Redirect to="/apps" />} />
                <Route path="/dashboard" component={DashboardRoutes} />
                <Route path="/app-setups" component={AppSetupsRoutes} />
                <Route path="/apps" component={AppRoutes} />
                <Route path="/pipelines" component={PipelineRoutes} />
                <Route path="/invoices" component={InvoiceRoutes} />
                <Route path="/sites" component={SitesRoutes} />
                <Route path="/spaces" component={SpacesRoutes} />
                <Route path="/orgs" component={OrgsRoutes} />
                <Route component={PageNotFound} />
              </Switch>
            </div>
          </div>
        </div>
        <Footer />
      </MuiThemeProvider>
    </div>
  </BrowserRouter>
);

export default Router;
