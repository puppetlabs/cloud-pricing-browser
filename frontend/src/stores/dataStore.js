import { observable, toJS } from 'mobx'

const axios = require('axios');
const moment = require('moment');


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
    this.tags = instance.tags.map((tag) => {
      return new SimpleTag(tag.vendorKey, tag.vendorValue);
    });
    this.totalSpend = instance.totalSpend;
    this.vendorAccountId = instance.vendorAccountId;
  }
}

class Tag {
  @observable key
  @observable value
  @observable count
  @observable cost
  @observable hourly
  @observable monthly

  constructor(key, value, tag, instances) {
    console.log(key);
    console.log(value);
    this.key = key
    this.value = value
    this.hourly = tag.hourly
    this.count = tag.count
    this.monthy = tag.monthly
    this.cost = tag.cost
  }
}

class DataStore {
  @observable data = 'supercalifragilisticexpialidocious'
  @observable instances = []
  @observable tags = []
  @observable title = ""
  @observable state = ""

  instancesThatMatchTags(key, val, size, page) {
    let retVal = [];
    let noneRetVal = [];
    let noneRetValAssigned = false;

    for (let instance of this.instances) {
      var seen = false;
      instance.tags.forEach((tag) => {
        if (val == 'none') {
          if (key === tag.key) {
            seen = true
          }
        } else {
          if ((key === tag.key) && (val === tag.value)) {
            retVal.push(instance);
          }
        }
      });
      if (val == 'none' && seen == false) {
        noneRetVal.push(instance);
      }

      var pageMax = size + (size * (page - 1));
      if (noneRetVal.length > pageMax && noneRetValAssigned === false) {
        retVal = noneRetVal;
        noneRetValAssigned = true
      }
    }
    let pages = 1;
    if (val == 'none') {
      if (retVal.length == 0) {
        retVal = noneRetVal;
      }
      pages = Math.ceil(noneRetVal.length / size);
    } else {
      pages = Math.ceil(retVal.length / size);
    }
    console.log("Returning");
    console.log(pages);
    console.log(retVal);
    console.log(noneRetVal);
    var fromPage = size * (page - 1) + 1
    var toPage = (size * (page - 1)) + size
    console.log(`From: ${fromPage}`)
    console.log(`To: ${toPage}`)
    return [retVal.slice(fromPage, toPage), pages];
  }

  tagsThatMatchKey(key) {
    let retVal = [];
    this.tags.map((tag) => {
      if (tag.key === key) {
        retVal.push(tag) ;
      }
    });

    return retVal;
  }

  instancesThatMatchTagKeys(key, val) {
    var retVal = [];
    var matchesTag;
    var instanceCount = 0;

    this.instances.map((instance) => {
      matchesTag = 0;

      instance.tags.forEach((tag) => {
        if (key === tag.key) {
          retVal.push(instance);
        }
      });

      if (matchesTag === 0) {
        instanceCount++;
      }
    });
    return retVal;
  }


  fetchInstances(cb) {
    var store = this;
    console.log("Getting from /api/v1/instances");
    axios.get('/api/v1/instances')
      .then((res: any) => res.data)
      .then(function(res: any) {
        store.instances   = res.map((instance)     => new Instance(instance))
        store.state    = "done"
        cb(store.instances);
      })
      .catch((err: any) => {
        console.log("in axios ", err)
        store.state = "error"
      })
  }

  load(store, storeName) {
    var storeData = window.localStorage.getItem(`${storeName}-lastSaved`)
    var lastSaved = window.localStorage.getItem(`${storeName}-lastSaved`)
    if (lastSaved && (Date.now - lastSaved > 300)) {
      this[storeName] = storeData;
      return true;
    }
    return false;
  }

  save(store, storeName) {
    const json = JSON.stringify(toJS(store));
    window.localStorage.setItem(`${storeName}-store`, json)
    window.localStorage.setItem(`${storeName}-lastSaved`, Date.now())
  }

  fetchTags(cb) {
    if (this.load(store, 'tags')) {
      cb(store.tags);
    }
    var store = this;
    axios.get('/api/v1/tags')
      .then((res: any) => res.data)
      .then(function(res: any) {
        var newTags = []
        res.forEach((uniqueTag) => {
          console.log(uniqueTag);
          let tag = new Tag(uniqueTag.key, uniqueTag.value, uniqueTag)
          if (tag.hourly > 0 || tag.count > 0 || tag.cost > 0) {
            newTags.push(tag);
          }
        });
        store.tags  = newTags;
        store.state = "done"
        cb(store.tags);
      })
      .catch((err: any) => {
        console.log("in axios ", err)
        store.state = "error"
      })

  }

}

export default DataStore
