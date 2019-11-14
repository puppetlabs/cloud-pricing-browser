import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Table } from '@puppet/react-components';
import { toJS } from 'mobx'

import { OverlayTrigger } from 'react-bootstrap';
import { Icon } from '@puppet/react-components';

@inject('rootStore')
@observer
class Tags extends Component {
  static isPrivate = true

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingThing: 'tags',
    };
    this.props.rootStore.dataStore.fetchTags(() => {
      this.setState({loading: false});
    });
  }

  render () {
    const tag_key = this.props.match.params.tag_key
    let tag_data;

    if (tag_key && tag_key.length > 0) {
      console.log(tag_key);
      tag_data = this.props.rootStore.dataStore.tagsThatMatchKey(tag_key);
    } else {
      tag_data = this.props.rootStore.dataStore.tags;
    }

    const columns = [
      {
        label: 'Name',
        dataKey: 'name',
        cellDataGetter: ({ rowData }) => rowData,
        cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}`}>{rowData.key}</a>
      },
      {
        label: 'Value',
        dataKey: 'value',
        cellDataGetter: ({ rowData }) => rowData,
        cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}/${rowData.value}`}>{rowData.value}</a>
      },
      { label: 'Hourly', dataKey: 'hourly' },
      { label: 'Monthly', dataKey: 'monthly' },
      { label: 'Count', dataKey: 'count' },
      { label: 'Cost', dataKey: 'cost' },
    ];

    var table;
    if (this.state.loading) {
      table = `Loading ${this.state.loadingThing}...`
    } else {
      table = <Table data={toJS(tag_data)} columns={columns} />
    }


    return (
      <div>
        <br />
        <h1>Tags</h1>
        {table}
      </div>
    )
  }
}

export default Tags
