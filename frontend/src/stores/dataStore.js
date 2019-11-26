import { observable, toJS } from 'mobx'

const axios = require('axios');

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
    if (instance.tags) {
      this.tags = instance.tags.map((tag) => {
        return new SimpleTag(tag.vendorKey, tag.vendorValue);
      });  
    }
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
    this.monthly = tag.monthly
    this.cost = tag.cost
  }
}

class DataStore {
  @observable data = 'supercalifragilisticexpialidocious'
  @observable instances = []
  @observable tags = []
  @observable tag_keys = []
  @observable title = ""
  @observable state = ""

  // instancesThatMatchTags(key, val, size, page) {
  //   let retVal = [];
  //   let noneRetVal = [];
  //   let noneRetValAssigned = false;

  //   /* eslint-disable no-unused-vars */
  //   for (let instance of this.instances) {
  //     var seen = false;
  //     /* eslint-disable no-loop-func */
  //     instance.tags.forEach((tag) => {
  //       if (val === 'none') {
  //         if (key === tag.key) {
  //           seen = true
  //         }
  //       } else {
  //         if ((key === tag.key) && (val === tag.value)) {
  //           retVal.push(instance);
  //         }
  //       }
  //     });
  //     /* eslint-disable no-loop-func */


  //     if (val === 'none' && seen === false) {
  //       noneRetVal.push(instance);
  //     }

  //     var pageMax = size + (size * (page - 1));
  //     if (noneRetVal.length > pageMax && noneRetValAssigned === false) {
  //       retVal = noneRetVal;
  //       noneRetValAssigned = true
  //     }
  //   }
  //   /* eslint-disable no-unused-vars */
  //   let pages = 1;
  //   if (val === 'none') {
  //     if (retVal.length === 0) {
  //       retVal = noneRetVal;
  //     }
  //     pages = Math.ceil(noneRetVal.length / size);
  //   } else {
  //     pages = Math.ceil(retVal.length / size);
  //   }
  //   var fromPage = size * (page - 1) + 1
  //   var toPage = (size * (page - 1)) + size
  //   return [retVal.slice(fromPage, toPage), pages];
  // }

  instancesThatMatchTags(key, val, size, page, cb) {
      var store = this;
      console.log("Getting from /api/v1/instances");
      axios.get('/api/v1/instances', {
        params: {
          tag_key: key,
          tag_val: val,
          size: size,
          page: page,
        }
      })
        .then((res: any) => res.data)
        .then(function(res: any) {
          console.log(res.instances);
          console.log(res.page_count);
          cb(res.instances.map((instance) => new Instance(instance)), res.page_count);
          store.state    = "done"
        })
        .catch((err: any) => {
          console.log("in axios ", err)
          store.state = "error"
        })
  
  }


  summarizedTags(keys) {
    let retVal = {};
    const tmpArray = this.tagsThatMatchKeys(keys);

    tmpArray.forEach(function(tmpTag) {
      if (!(tmpTag.key in retVal)) {
        retVal[tmpTag.key] = {};
      }

      if (tmpTag.value === 'none') {
        retVal[tmpTag.key]['none'] = tmpTag;
      } else {
        if ('not-none' in retVal[tmpTag.key]) {
          var notNone = retVal[tmpTag.key]['not-none']


          let newCost = notNone.cost + tmpTag.cost
          let newCount = notNone.count + tmpTag.count
          let newHourly = notNone.hourly + tmpTag.hourly
          let newMonthly = notNone.monthly + tmpTag.monthly

          retVal[tmpTag.key]['not-none'] = new Tag(tmpTag.key, tmpTag.value, {
            key: tmpTag.key,
            value: "Not None",
            cost: newCost,
            count: newCount,
            hourly: newHourly,
            monthly: newMonthly,
          });
        } else {
          retVal[tmpTag.key]['not-none'] = tmpTag;
        }
      }
    });

    var result = [];
    console.log(retVal);
    Object.keys(retVal).forEach(function(a, b) {
      console.log(a);
      Object.keys(retVal[a]).forEach(function(c, d) {
        result.push(retVal[a][c]);
      })
    })
    console.log(result);

    return result;
  }

  matchKeys(keys, tag) {
    return (
      (typeof keys === 'object' && keys.includes(tag.key))
      ||
      (typeof keys === 'string' && keys === tag.key)
    )

  }

  tagsThatMatchKeys(keys) {
    return this.tags.filter((tag) => {
      return this.matchKeys(keys, tag)
    });
  }


  
  instancesThatMatchTagKeys(key, val) {
    var retVal = [];
    var matchesTag;
    var instanceCount = 0;

    this.instances.map((instance) => {
      matchesTag = 0;

      instance.tags.forEach((tag) => {
        if (key === tag.key) {
          return retVal.push(instance);
        }
      });

      if (matchesTag === 0) {
        instanceCount = instanceCount + 1;
      }

      return instanceCount;
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
    var store = this;
    if (this.load(store, 'tags')) {
      cb(store.tags);
    }

    axios.get('/api/v1/tags')
      .then((res: any) => res.data)
      .then(function(res: any) {
        var newTags = [];
        var newTagKeys = [];
        var addedNewTagKeys = [];
        res.forEach((uniqueTag) => {
          let tag_key = new Tag(uniqueTag.key, "", uniqueTag)
          let tag = new Tag(uniqueTag.key, uniqueTag.value, uniqueTag)
          if (tag.hourly > 0 || tag.count > 0 || tag.cost > 0) {
            if (!addedNewTagKeys.includes(uniqueTag.key)) {
              addedNewTagKeys.push(uniqueTag.key)
              newTagKeys.push(tag_key);
            }
            newTags.push(tag);
          }
        });
        store.tag_keys = newTagKeys;
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
