import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Table } from '@puppet/react-components';
import { Select } from '@puppet/react-components';

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
    this.fetchInstances()
  }

  fetchInstances() {
    var params = {};
    if (this.state.selectedAccount) {
      params.vendorAccountId = this.state.selectedAccount
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

  render () {
    var instanceData = this.props.rootStore.dataStore.instances;
  
    const columns = [
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

    console.log(toJS(instanceData));

    const style = { margin: 10 };

    var component = this;

    let selectAccount
    console.log(component.accountData());
    console.log(component.state.selectedAccount);
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
        <h1>Instances</h1>
        <b>Count: </b>{toJS(instanceData).length}
        {selectAccount}

        <Table data={toJS(instanceData)} columns={columns} />
      </div>
    )
  }
}

export default Index
