import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import Index     from './Components/Index';
import Tag       from './Components/Tag';
import Tags      from './Components/Tags';
import Instances from './Components/Instances';

import { Sidebar, Content } from '@puppet/react-components';

class AppRouter extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      redirect_to: ""
    }
  }

  render() {
    if (this.state.redirect === true) {
      this.setState({
        redirect: false
      })
      return (<Router>
        <Redirect to={this.state.redirect_to} />
      </Router>);
    }

    return (
      <Router>
      <div style={{ float: 'left', position: 'relative', height: '100vh' }}>
        <Sidebar>
          <Sidebar.Header
            logo="Cloud Pricing"
            onClick={() => console.log('logo clicked')}
            aria-label="Return to the home page"
          />
          <br />
          <Sidebar.Section>
            <Sidebar.Item onClick={() => { this.setState({ redirect: true, redirect_to: "/" })}} title="Home" icon="home" active />
          </Sidebar.Section>
          <Sidebar.Section label="reports">
            <Sidebar.Item onClick={() => { this.setState({ redirect: true, redirect_to: "/tags" })}} title="Tags" icon="tag" active />
            <Sidebar.Item onClick={() => { this.setState({ redirect: true, redirect_to: "/instances" })}} title="Instances" icon="structure" active />
          </Sidebar.Section>
          <br />
          <br />
        </div>
        <div style={{ position: 'relative', height: '100vh' }} className="app-main-content">
        <Content>
          <Route path="/" exact component={Index} />
          <Route path="/tags/:tag_key/:tag_value" exact component={Tag} />
          <Route path="/tags/:tag_key" exact component={Tags} />
          <Route path="/tags" exact component={Tags} />
          <Route path="/instances" exact component={Instances} />
        </Content>
        </div>
      </Router>
    );
  }
}

export default AppRouter;
