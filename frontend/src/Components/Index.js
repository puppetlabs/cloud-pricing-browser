import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Table } from '@puppet/react-components';
import { toJS } from 'mobx'

import { OverlayTrigger } from 'react-bootstrap';
import { Icon } from '@puppet/react-components';

import axios from 'axios';

@inject('rootStore')
@observer
class Index extends Component {
  static isPrivate = true

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingThing: 'tags',
      interestingTags: [],
    };
    this.props.rootStore.dataStore.fetchTags(() => {
      this.setState({loading: false});
    });


  }

  onComponentMount() {
    axios.get("/api/v1/interesting_tags").then(function(res) {
      this.setState({
        interesting_tags: res.data,
      });
    });
  }

  render () {
    let tag_data;
    tag_data = this.props.rootStore.dataStore.summarizedTags(this.state.interesting_tags);

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
      { label: 'Count', dataKey: 'count' },
      {
        label: 'Hourly',
        dataKey: 'hourly',
        cellRenderer: ({ rowData }) => `$${rowData.hourly.toFixed(2)}`
      },
      {
        label: 'Cost',
        dataKey: 'cost',
        cellRenderer: ({ rowData }) => `$${rowData.cost.toFixed(2)}`
      },
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
        <h1>Summary</h1>
        {table}
      </div>
    )
  }
}

export default Index
