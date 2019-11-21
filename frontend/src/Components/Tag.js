import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Form, Table } from '@puppet/react-components';
import { toJS } from 'mobx'

import { TablePageSelector } from '@puppet/data-grid';

@inject('rootStore')
@observer
class Tag extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageSize: "10",
      currentPage: 1,
      tagKey: "",
      tagValue: "",
      instanceData: [],
      pageCount: 0
    };

    this.changePageSize = this.changePageSize.bind(this);
    this.pageSelectFunc = this.pageSelectFunc.bind(this);
  }

  componentDidMount(props, state) {
    this.props.rootStore.dataStore.fetchInstances(() => {});
  }

  pageSelectFunc(page) {
    this.setState({
      currentPage: page
    });
  }

  changePageSize(pageSize) {
    console.log(`Setting Pagesize to ${pageSize}`);
    this.setState({
      pageSize: pageSize
    });
  }

  render () {
    const tag_key   = this.props.match.params.tag_key
    const tag_value = this.props.match.params.tag_value

    var ret = this.props.rootStore.dataStore.instancesThatMatchTags(tag_key, tag_value, parseInt(this.state.pageSize), this.state.currentPage);
    var instanceData = ret[0];
    var pageCount = ret[1]

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

    const pageSizeOptions = [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
      { value: "100", label: "100" },
    ];

    console.log(this.pageSelectFunc);

    return (
      <div>
        <br />
        <h1>Tag</h1>
        <div>
          <b>{this.state.tagKey}</b> {this.state.tagValue}
        </div>
        <br />

        <Form.Field
          type="select"
          name="pageSize"
          label="pagesize"
          value={this.state.pageSize}
          onChange={this.changePageSize}
          options={pageSizeOptions}
        />

        <TablePageSelector
          currentPage={this.state.currentPage}
          pageCount={pageCount}
          delta="1"
          onClickHandler={this.pageSelectFunc}
        />

        <Table data={toJS(instanceData)} columns={columns} />
      </div>
    )
  }
}

export default Tag
