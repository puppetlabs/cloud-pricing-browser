import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Table } from '@puppet/react-components';
import { toJS } from 'mobx'

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
    let only_tag_keys = false;
    let title = "Tags";

    if (tag_key && tag_key.length > 0) {
      console.log(tag_key);
      tag_data = this.props.rootStore.dataStore.tagsThatMatchKeys(tag_key);
    } else if (this.props.match.path === "/tag_keys") {
      tag_data = this.props.rootStore.dataStore.tag_keys;
      only_tag_keys = true;
      title = "Tag Keys"
    } else {
      tag_data = this.props.rootStore.dataStore.tags;
    }

    let columns = [
      {
        label: 'Name',
        dataKey: 'name',
        cellDataGetter: ({ rowData }) => rowData,
        cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}`}>{rowData.key}</a>
      }
    ]
    if (only_tag_keys === false) {
      columns = columns.concat(
      [{
        label: 'Value',
        dataKey: 'value',
        cellDataGetter: ({ rowData }) => rowData,
        cellRenderer: ({ rowData }) => <a href={`/tags/${rowData.key}/${rowData.value}`}>{rowData.value}</a>
      },
      // { label: 'Hourly', dataKey: 'hourly' },
      // { label: 'Monthly', dataKey: 'monthly' },
      { 
        label: 'Count', 
        dataKey: 'count',
      },
      { 
        label: 'Cost (30-Day)', 
        dataKey: 'cost',
        cellRenderer: ({ rowData }) => <span>${rowData.count.toFixed(2)}</span>
      },
    ]);
    }

    console.log(columns);
    console.log(only_tag_keys);

    var table;
    if (this.state.loading) {
      table = `Loading ${this.state.loadingThing}...`
    } else {
      table = <Table data={toJS(tag_data)} columns={columns} />
    }


    return (
      <div>
        <br />
        <h1>{title}</h1>
        {table}
      </div>
    )
  }
}

export default Tags
