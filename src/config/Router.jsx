import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import Loading from '../components/Loading';

import Nav from '../components/Nav';
import Footer from '../components/Footer';

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
    <Route path="/dashboard" component={Dashboard} />
  </Switch>
);

const Pipelines = Loadable({
  loader: () => import('../scenes/Pipelines/Pipelines'),
  loading: Loading,
});
const PipelineInfo = Loadable({
  loader: () => import('../scenes/Pipelines/PipelineInfo'),
  loading: Loading,
});

const PipelineRoutes = () => (
  <Switch>
    <Route exact path="/pipelines" component={Pipelines} />
    <Route path="/pipelines/:pipeline/:tab?" component={PipelineInfo} />
  </Switch>
);

const Orgs = Loadable({
  loader: () => import('../scenes/Orgs/Orgs'),
  loading: Loading,
});
const NewOrg = Loadable({
  loader: () => import('../scenes/Orgs/NewOrg'),
  loading: Loading,
});

const OrgRoutes = () => (
  <Switch>
    <Route exact path="/orgs" component={Orgs} />
    <Route exact path="/orgs/new" component={NewOrg} />
  </Switch>
);

const Spaces = Loadable({
  loader: () => import('../scenes/Spaces/Spaces'),
  loading: Loading,
});
const NewSpace = Loadable({
  loader: () => import('../scenes/Spaces/NewSpace'),
  loading: Loading,
});

const SpaceRoutes = () => (
  <Switch>
    <Route exact path="/spaces" component={Spaces} />
    <Route exact path="/spaces/new" component={NewSpace} />
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
});

const SitesRoutes = () => (
  <Switch>
    <Route exact path="/sites" component={Sites} />
    <Route exact path="/sites/new" component={NewSite} />
    <Route path="/sites/:site/:tab?" component={SiteInfo} />
  </Switch>
);

const Router = () => (
  <div>
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
        <Nav />
        <Switch style={{ flex: 1 }}>
          <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
          <Route path="/dashboard" component={DashboardRoutes} />
          <Route path="/app-setups" component={AppSetupsRoutes} />
          <Route path="/apps" component={AppRoutes} />
          <Route path="/orgs" component={OrgRoutes} />
          <Route path="/pipelines" component={PipelineRoutes} />
          <Route path="/spaces" component={SpaceRoutes} />
          <Route path="/invoices" component={InvoiceRoutes} />
          <Route path="/sites" component={SitesRoutes} />
          <Route component={PageNotFound} />
        </Switch>
        <canvas id="canv" style={{ position: 'fixed', top: '0', left: '0', zIndex: '-1' }} />
        <Footer />
      </div>
    </BrowserRouter>
  </div>
);

export default Router;
