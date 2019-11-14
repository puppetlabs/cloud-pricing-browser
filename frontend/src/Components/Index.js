import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { OverlayTrigger } from 'react-bootstrap';
import { Icon } from '@puppet/react-components';

@inject('rootStore')
@observer
class Index extends Component {
  static isPrivate = true

  render () {
    return (
      <div>
      </div>
    )
  }
}

export default Index
