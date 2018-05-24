import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Apps, NewApp, AppInfo } from '../scenes/Apps';
import { Orgs, NewOrg } from '../scenes/Orgs';
import { Pipelines, PipelineInfo } from '../scenes/Pipelines';
import { Spaces, NewSpace } from '../scenes/Spaces';
import { Invoices, InvoiceInfo, WasteReport } from '../scenes/Invoices';
import { AppSetups } from '../scenes/AppSetups';
import { Sites, NewSite, SiteInfo } from '../scenes/Sites';

const NotFound = () => (
  <h1>404.. This page is not found!</h1>
);

const AppRoutes = () => (
  <Switch>
    <Route exact path="/apps" component={Apps} />
    <Route exact path="/apps/new" component={NewApp} />
    <Route path="/apps/:app" component={AppInfo} />
  </Switch>
);

const PipelineRoutes = () => (
  <Switch>
    <Route exact path="/pipelines" component={Pipelines} />
    <Route path="/pipelines/:pipeline" component={PipelineInfo} />
  </Switch>
);

const OrgRoutes = () => (
  <Switch>
    <Route exact path="/orgs" component={Orgs} />
    <Route exact path="/orgs/new" component={NewOrg} />
  </Switch>
);

const SpaceRoutes = () => (
  <Switch>
    <Route exact path="/spaces" component={Spaces} />
    <Route exact path="/spaces/new" component={NewSpace} />
  </Switch>
);

const InvoiceRoutes = () => (
  <Switch>
    <Route exact path="/invoices" component={Invoices} />
    <Route exact path="/invoices/:invoice" component={InvoiceInfo} />
    <Route exact path="/invoices/:invoice/:org" component={WasteReport} />
  </Switch>
);

const AppSetupsRoutes = () => (
  <Switch>
    <Route path="/app-setups" component={AppSetups} />
  </Switch>
);

const SitesRoutes = () => (
  <Switch>
    <Route exact path="/sites" component={Sites} />
    <Route exact path="/sites/new" component={NewSite} />
    <Route path="/sites/:site" component={SiteInfo} />
  </Switch>
);

const Router = () => (
  <div>
    <HashRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Nav />
        <Switch style={{ flex: 1 }}>
          <Route exact path="/" render={() => <Redirect to="/apps" />} />
          <Route path="/app-setups" component={AppSetupsRoutes} />
          <Route path="/apps" component={AppRoutes} />
          <Route path="/orgs" component={OrgRoutes} />
          <Route path="/pipelines" component={PipelineRoutes} />
          <Route path="/spaces" component={SpaceRoutes} />
          <Route path="/invoices" component={InvoiceRoutes} />
          <Route path="/sites" component={SitesRoutes} />
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </div>
    </HashRouter>
  </div>
);

export default Router;
