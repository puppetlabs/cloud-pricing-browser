import { observable } from 'mobx'

class Tag {
    @observable key
    @observable value
    @observable count
    @observable cost
    @observable hourly
    @observable monthly
  
    constructor(key, value, tag, instances) {
      this.key = key
      this.value = value
      this.hourly = tag.hourly
      this.count = tag.count
      this.monthly = tag.monthly
      this.cost = tag.cost
    }
}
  
  export default Tag