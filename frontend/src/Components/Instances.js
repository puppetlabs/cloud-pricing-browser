import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { OverlayTrigger } from 'react-bootstrap';
import { Table } from '@puppet/react-components';

import { toJS } from 'mobx'

@inject('rootStore')
@observer
class Index extends Component {
  static isPrivate = true

  componentDidMount() {
    this.props.rootStore.dataStore.fetchInstances(() => {

    });
  }

  render () {
    var instanceData = this.props.rootStore.dataStore.instances;

    const columns = [
      { label: 'id', dataKey: 'id' },
      { label: 'effectiveHourly', dataKey: 'effectiveHourly' },
      { label: 'name', dataKey: 'name' },
      { label: 'nodeType', dataKey: 'nodeType' },
      { label: 'os', dataKey: 'os' },
      { label: 'provider', dataKey: 'provider' },
      { label: 'region', dataKey: 'region' },
      { label: 'resourceIdentifier', dataKey: 'resourceIdentifier' },
      { label: 'service', dataKey: 'service' },
      { label: 'totalSpend', dataKey: 'totalSpend' },
      { label: 'Account ID', dataKey: 'vendorAccountId' }
    ];

    console.log(toJS(instanceData));

    return (
      <div>
        <br />
        <h1>Instances</h1>
        <b>Count: </b>{toJS(instanceData).length}
        <Table data={toJS(instanceData)} columns={columns} />;
      </div>
    )
  }
}

export default Index
