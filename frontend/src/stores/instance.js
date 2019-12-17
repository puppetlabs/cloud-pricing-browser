import { observable } from 'mobx'

class SimpleTag {
    @observable key
    @observable value

    constructor(key, value) {
      this.key = key
      this.value = value
    }
}

class Instance {
    @observable id
    @observable effectiveHourly
    @observable name
    @observable nodeType
    @observable os
    @observable provider
    @observable region
    @observable resourceIdentifier
    @observable service
    @observable tags = []
    @observable totalSpend
    @observable vendorAccountId
    @observable lastSeen
    @observable hoursRunning
    @observable portfolio
    @observable organization
  
    getTag(instance, tag_key) {
      var retVal;
      instance.tags.forEach((tag) => {
        if (tag.vendorKey === tag_key) {
          retVal = tag.vendorValue;
        }
      });
  
      return retVal;
    }
  
    constructor(instance) {
      this.id = instance.id;
      this.effectiveHourly = instance.effectiveHourly;
      this.name = instance.name;
      this.nodeType = instance.nodeType;
      this.os = instance.os;
      this.provider = instance.provider;
      this.region = instance.region;
      this.resourceIdentifier = instance.resourceIdentifier;
      this.service = instance.service;
      this.lastSeen = instance.lastSeen;
      this.hoursRunning = instance.hoursRunning;
      if (instance.tags) {
        this.tags = instance.tags.map((tag) => {
          return new SimpleTag(tag.vendorKey, tag.vendorValue);
        });  
      }
      this.totalSpend = instance.totalSpend;
      this.vendorAccountId = instance.vendorAccountId;
      this.portfolio = this.getTag(instance, "tag_user_portfolio")
      this.organization = this.getTag(instance, "tag_user_organization")
    }
  }
  
  export default Instance