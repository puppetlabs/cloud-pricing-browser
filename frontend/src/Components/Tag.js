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
    this.loadInstances  = this.loadInstances.bind(this);
  }

  componentDidMount(props, state) {
    // this.props.rootStore.dataStore.fetchInstances(() => {});
    this.loadInstances();
  }

  loadInstances() {
    const tag_key   = this.props.match.params.tag_key
    const tag_value = this.props.match.params.tag_value
    var component = this;

    this.props.rootStore.dataStore.instancesThatMatchTags(tag_key, tag_value, parseInt(this.state.pageSize), this.state.currentPage, function(iD, pC) {
      component.setState({
        instanceData: iD,
        pageCount: pC,
        tagKey: tag_key,
        tagValue: tag_value,
      });
    });
  }

  pageSelectFunc(page) {
    this.setState({
      currentPage: page
    }, this.loadInstances());
  }

  changePageSize(pageSize) {
    this.setState({
      pageSize: pageSize
    }, this.loadInstances());
  }

  render () {
    const tag_key   = this.props.match.params.tag_key
    const tag_value = this.props.match.params.tag_value

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
          pageCount={this.state.pageCount}
          delta="1"
          onClickHandler={this.pageSelectFunc}
        />

        <Table data={toJS(this.state.instanceData)} columns={columns} />
      </div>
    )
  }
}

export default Tag
