import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Form, Select, Table } from '@puppet/react-components';

import { toJS } from 'mobx'

@inject('rootStore')
@observer
class Accounts extends Component {
  static isPrivate = true

  constructor(props) {
    super(props);
    this.state = {
      selectedAccount: ""
    }

    this.fetchAccounts = this.fetchAccounts.bind(this);
  }

  componentDidMount() {
    if (this.props.untagged) {
      this.fetchAccounts({
        untagged: true,
      })
    } else {
      this.fetchAccounts({
        untagged: false
      })
    }
  }

  fetchAccounts(options) {
    var params = {};
    if (this.state.selectedAccount) {
      params.vendorAccountId = this.state.selectedAccount
      params.untagged        = options.untagged
    }
    this.props.rootStore.dataStore.fetchAccounts(params, () => {

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

  changeTag(vendorKey, vendorValue, accountID) {
    this.props.rootStore.dataStore.setTag([accountID], vendorKey, vendorValue)
  }

  render () {
    let accountData = this.props.rootStore.dataStore.accounts;

    let title = "Accounts"
    let columns = [
        { label: 'Name', dataKey: 'name' },
        { label: 'Contact Name', dataKey: 'contactname' },
        { label: 'Contact Email', dataKey: 'contactemail' },
        { label: 'Reaper Channel', dataKey: 'reaperchannel' },
        { label: 'Account ID', dataKey: 'number' },
    ];  

    console.log(toJS(accountData));

    return (
      <div>
        <br />
        <h1>{title}</h1>
        <b>Count: </b>{toJS(accountData).length}

        <Table data={toJS(accountData)} columns={columns} />
      </div>
    )
  }
}

export default Accounts
