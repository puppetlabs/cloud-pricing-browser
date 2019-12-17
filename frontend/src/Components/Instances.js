import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { withAlert } from "react-alert";

import { Form, Select, Table } from '@puppet/react-components';
import queryString from 'query-string'

import { toJS } from 'mobx'
import TimeAgo from 'timeago-react';

import Error from './Error';
import Loader from './Loader';

@inject('rootStore')
@observer
class Instances extends Component {
  static isPrivate = true

  constructor(props) {
    super(props);

    const values = queryString.parse(this.props.location.search)

    this.state = {
      error: false,
      loading: true,
      status: "",
      message: "",
      selectedAccount: values.account_id,
    }

    this.fetchInstances = this.fetchInstances.bind(this);
    this.doFetchInstances = this.doFetchInstances.bind(this);

    console.log(props);
  }

  componentDidMount() {
    this.doFetchInstances();
  }

  doFetchInstances() {
    if (this.props.match.path === "/untagged_instances") {
      this.fetchInstances({
        untagged: true,
      })
    } else {
      this.fetchInstances({
        untagged: false
      })
    }
  }

  fetchInstances(options) {
    var params = {};
    if (this.state.selectedAccount) {
      params.vendorAccountId = this.state.selectedAccount;
    }
    
    this.props.rootStore.dataStore.fetchAccounts(params, () => {
      params.untagged        = options.untagged
      this.props.rootStore.dataStore.fetchInstances(params, () => {
        this.setState({ loading: false });
      }).catch(() => this.setState({ error: true }));
    }).catch(() => this.setState({ error: true }))
  };

  accountData() {
    var retVal = [];
    this.props.rootStore.dataStore.accounts.forEach((account) => {
      retVal.push({
        label: `${account.name} (${account.number})`,
        value: account.number,
      });
    });

    return retVal;
  }

  changeTag(vendorKey, vendorValue, instanceID) {
    var component = this;

    this.props.rootStore.dataStore.setTag([instanceID], vendorKey, vendorValue, (status, message) => {
      console.log("Just Set Tag with: " + status + " and " + message)
      if (status === "info") {
        this.props.rootStore.dataStore.deleteInstance(instanceID);
      }

      if (status === "success") {
        this.props.rootStore.dataStore.addTagToInstance(instanceID, vendorKey, vendorValue);
      }
      if (message.length > 0) {
        this.props.alert.show(message);
      }

      component.setState({
        status: status,
        message: message
      });
    });
  }

  render () {

    let instanceData = this.props.rootStore.dataStore.instances;
    let title = "Instances"
    let columns = [
      { label: 'id',              dataKey: 'id' },
      { label: '$Hourly',        dataKey: 'effectiveHourly' },
      { label: 'name',            dataKey: 'name' },
      { label: 'Type',        dataKey: 'nodeType' },
      { 
        label: 'Last Seen', 
        dataKey: 'lastSeen',
        cellDataGetter: ({ rowData })=> rowData,
        cellRenderer: ({ rowData }) => <TimeAgo datetime={rowData.lastSeen} />,
      },
    { label: 'provider',        dataKey: 'provider' },
      { label: 'region',          dataKey: 'region' },
      { label: 'Resource ID',     dataKey: 'resourceIdentifier' },
      { label: 'Service',         dataKey: 'service' },
      { label: 'Cost',            dataKey: 'totalSpend' },
      { label: 'Account ID',      dataKey: 'vendorAccountId' }
    ];

    let portfolioOptions = Object.assign([], this.props.rootStore.dataStore.portfolioOptions);
    let organizationOptions = Object.assign([], this.props.rootStore.dataStore.organizationOptions);
      
    toJS(instanceData).forEach((instance) => {
      if (instance.organization) {
        console.log("Organization: " + instance.organization);
      }
      if (instance.portfolio) {
        console.log("Portfolio Item: " + instance.portfolio);
      }
    
      if (!(portfolioOptions.map((cc) => cc.value).includes(instance.portfolio))) {
        portfolioOptions.push({
          label: `Do Not Use: ${instance.portfolio}`,
          value: instance.portfolio,
        })
      }

      if (!(organizationOptions.map((cc) => cc.value).includes(instance.organization))) {
        organizationOptions.push({
          label: `Do Not Use: ${instance.organization}`,
          value: instance.organization,
        })
      }

    });

    if (this.props.match.path === "/untagged_instances") {
      title = "Untagged Instances"
      columns = [
        { label: 'Resource ID', dataKey: 'resourceIdentifier' },
        { label: 'Name', dataKey: 'name' },
        { label: 'Type', dataKey: 'nodeType' },
        { 
          label: 'Last Seen', 
          dataKey: 'lastSeen',
          cellDataGetter: ({ rowData })=> rowData,
          cellRenderer: ({ rowData }) => <TimeAgo datetime={rowData.lastSeen} />,
        },
        { label: 'Cost', dataKey: 'totalSpend' },
        { 
          label: 'Account ID', 
          dataKey: 'vendorAccountId',
          cellDataGetter: ({ rowData })=> rowData,
          cellRenderer: ({ rowData }) => this.props.rootStore.dataStore.accountsHash[rowData.vendorAccountId],
        },
        { 
          label: 'Portfolio', 
          dataKey: 'portfolio',
          cellDataGetter: ({ rowData }) => rowData,
          cellRenderer: ({ rowData }) => <Form.Field
            type="select"
            name="portfolio"
            label="Portfolio Item"
            value={rowData.portfolio}
            onChange={(tagValue) => this.changeTag("portfolio", tagValue, rowData.resourceIdentifier)}
            placeholder="Choose."
            options={toJS(portfolioOptions)}
          />
        },
        { 
          label: 'Organization', 
          dataKey: 'organization',
          cellDataGetter: ({ rowData }) => rowData,
          cellRenderer: ({ rowData }) => <Form.Field
            type="select"
            name="organization"
            label="Organization"
            value={rowData.organization}
            onChange={(tagValue) => this.changeTag("organization", tagValue, rowData.resourceIdentifier)}
            placeholder="Choose."
            options={toJS(organizationOptions)}
          />
        },  
      ];  
    }

    console.log(toJS(instanceData));


    const style = { margin: 10 };

    var component = this;

    let selectAccount

    if (component.accountData().length > 0) {
      selectAccount = (<Select
        id="button-select-one"
        name="select-example"
        options={component.accountData()}
        placeholder="Filter by account"
        style={style}
        value={component.state.selectedAccount}
        onChange={selectedAccount => {
          this.props.history.push(`?account_id=${selectedAccount}`)

          component.setState({ 
            selectedAccount: selectedAccount,
          }, () => {
            component.doFetchInstances()
          });
        }}
      />
    );
    }

    var statusMessage = <div></div>;
    if (this.state.message) {
      statusMessage = (<div className={`alert alert-${this.state.status}`}>
          {this.state.message}
      </div>);  
    }

    if (this.props.rootStore.dataStore.state === "error") return <Error />;
    if (this.state.error)                                 return <Error />;
    if (this.state.loading)                               return <Loader />;  

    return (
      <div>
        <br />
        <h1>{title}</h1>
        <b>Count: </b>{toJS(instanceData).length}
        {statusMessage}
        {selectAccount}

        <Table data={toJS(instanceData)} columns={columns} />
      </div>
    )
  }
}

export default withAlert()(Instances)
