import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Form, Select, Table } from '@puppet/react-components';

import { toJS } from 'mobx'

@inject('rootStore')
@observer
class Index extends Component {
  static isPrivate = true

  constructor(props) {
    super(props);
    this.state = {
      selectedAccount: ""
    }

    this.fetchInstances = this.fetchInstances.bind(this);
  }

  componentDidMount() {
    if (this.props.untagged) {
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
      params.vendorAccountId = this.state.selectedAccount
      params.untagged        = options.untagged
    }
    console.log(params);
    this.props.rootStore.dataStore.fetchInstances(params, () => {

    });
  }

  accountData() {
    var retVal = [];
    this.props.rootStore.dataStore.accounts.forEach((account) => {
      retVal.push({
        label: account,
        value: account,
      });
    });

    return retVal;
  }

  changeTag(vendorKey, vendorValue, instanceID) {
    this.props.rootStore.dataStore.setTag([instanceID], vendorKey, vendorValue)
  }

  render () {
    let instanceData = this.props.rootStore.dataStore.instances;
    let title = "Instances"
    let columns = [
      { label: 'id', dataKey: 'id' },
      { label: 'effectiveHourly', dataKey: 'effectiveHourly' },
      { label: 'name', dataKey: 'name' },
      { label: 'nodeType', dataKey: 'nodeType' },
      { label: 'lastSeen', dataKey: 'lastSeen' },
      { label: 'provider', dataKey: 'provider' },
      { label: 'region', dataKey: 'region' },
      { label: 'resourceIdentifier', dataKey: 'resourceIdentifier' },
      { label: 'service', dataKey: 'service' },
      { label: 'totalSpend', dataKey: 'totalSpend' },
      { label: 'Account ID', dataKey: 'vendorAccountId' }
    ];

    let costCenterOptions = [
      {
        value: "200000",
        label: "200000"
      }
    ]

    let departmentOptions = [
      {
        value: "dev-services",
        label: "Dev Services"
      }
    ]

    if (this.props.match.path === "/untagged_instances") {
      title = "Untagged Instances"
      columns = [
        { label: 'resourceIdentifier', dataKey: 'resourceIdentifier' },
        { label: 'name', dataKey: 'name' },
        { label: 'nodeType', dataKey: 'nodeType' },
        { label: 'lastSeen', dataKey: 'lastSeen' },
        { label: 'totalSpend', dataKey: 'totalSpend' },
        { label: 'Account ID', dataKey: 'vendorAccountId' },
        { 
          label: 'CostCenter', 
          dataKey: 'costCenter',
          cellDataGetter: ({ rowData }) => rowData,
          cellRenderer: ({ rowData }) => <Form.Field
            type="select"
            name="costCenter"
            label="Cost Center"
            onChange={(tagValue) => this.changeTag("costCenter", tagValue, rowData.resourceIdentifier)}
            placeholder="Choose a cost center."
            options={costCenterOptions}
          />
        },
        { 
          label: 'Department', 
          dataKey: 'department',
          cellDataGetter: ({ rowData }) => rowData,
          cellRenderer: ({ rowData }) => <Form.Field
            type="select"
            name="department"
            label="Department"
            onChange={(tagValue) => this.changeTag("department", tagValue, rowData.resourceIdentifier)}
            placeholder="Choose a department."
            options={departmentOptions}
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
          console.log('New Value:', selectedAccount);
          component.setState({ 
            selectedAccount: selectedAccount,
          }, () => {
            component.fetchInstances()
          });
        }}
      />
      );
  
    }

    return (
      <div>
        <br />
        <h1>{title}</h1>
        <b>Count: </b>{toJS(instanceData).length}
        {selectAccount}

        <Table data={toJS(instanceData)} columns={columns} />
      </div>
    )
  }
}

export default Index
