import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Table } from '@puppet/react-components';
import { toJS } from 'mobx'

import axios from 'axios';

import IndexColumns from './IndexColumns';
import Error from './Error';
import Loader from './Loader';

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

  componentDidMount() {
    const component = this

    axios.get("/api/v1/interesting_tags").then(function(res) {
      component.setState({
        interesting_tags: res.data,
      });
    });
  }

  render () {
    let tag_data;
    if (this.state.interesting_tags) {
      tag_data = this.props.rootStore.dataStore.summarizedTags(this.state.interesting_tags.map((tag) => tag.value));
    }

    if (this.props.rootStore.dataStore.state === "error") return <Error />;
    if (this.state.error)                                 return <Error />;
    if (this.state.loading)                               return <Loader />;  

    return (
      <div>
        <br />
        <h1>Summary</h1>
        <Table data={toJS(tag_data)} columns={IndexColumns} />
      </div>
    );
  }
}

export default Index
