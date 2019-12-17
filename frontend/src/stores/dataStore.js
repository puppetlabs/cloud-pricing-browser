import { observable, toJS } from 'mobx'

import Tag from './Tag';
import Instance from './instance';
import Account from './account';

const axios = require('axios');


class DataStore {
  @observable data = 'supercalifragilisticexpialidocious'
  @observable accounts = []
  @observable accountsHash = {};
  @observable instances = []
  @observable tags = []
  @observable tag_keys = []
  @observable portfolioOptions = []
  @observable organizationOptions = []
  @observable title = ""
  @observable state = ""


  constructor() {
    this.loadPortfolioOptions();
    this.loadOrganizationOptions();
  }

  loadPortfolioOptions() {
    var store = this;
    axios.get('/api/v1/portfolios')
      .then((res) => res.data)
      .then(function(res) {
        store.portfolioOptions = res
      });
  }

  loadOrganizationOptions() {
    var store = this;
    axios.get('/api/v1/organizations')
      .then((res) => res.data)
      .then(function(res) {
        store.organizationOptions = res
      });
  }

  instancesThatMatchTags(key, val, size, page, cb) {
      var store = this;
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
        cb(res.instances.map((instance) => new Instance(instance)), res.page_count);
        store.state = "done"
      })
      .catch((err: any) => {
        store.state = "error"
      })
  }

  addTagToInstance(instanceID, tag, val) {
    let allInstances = this.instances;

    var x = 0;
    allInstances.forEach((instance) => {
      if (instance.resourceIdentifier === instanceID) {
        allInstances[x][tag] = val;
      }
      x++;
    });

    this.instances = allInstances;
  }

  deleteInstance(instanceID) {
    let allInstances = this.instances;

    this.instances = allInstances.filter(
      (instance) => { return instance.resourceIdentifier !== instanceID }
    )
  }

  setTag(instanceIDs, vendorKey, vendorValue, cb) {
    axios.put(`/api/v1/tags`, {
      instance_ids: instanceIDs,
      vendorKey: vendorKey,
      vendorValue: vendorValue,
    })
    .then((res) => res.data)
    .then((res) => {
      console.log(res);
      console.log(res.Status);
      console.log(res.StatusMessage);
      if (res.Status === "Success") {
        return cb("success", res.StatusMessage)
      } else if (res.Status === "Deleted") {
        return cb("info", res.StatusMessage)
      } else {
        return cb("warning", res.StatusMessage)
      }
    }).catch((err) => {
      if (err.response.data.Status === "Deleted") {
        return cb("info", err.response.data.StatusMessage)
      } 
      return cb("danger", err.response.data.StatusMessage);
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


  fetchInstances(params, cb) {
    var store = this;
    console.log("Getting from /api/v1/instances");
    return axios.get('/api/v1/instances', {
      params: params}
      )
      .then((res: any) => res.data)
      .then(function(res: any) {
        store.instances = res.instances.map((instance)     => new Instance(instance));
        // store.accounts = new Set(res.instances.map((instance) => instance.vendorAccountId));
        store.state    = "done"
        cb(store.instances);
      });
  }

  makeAccountsHash(accounts) {
    let accountsHash = {};

    accounts.forEach((account) => {
      accountsHash[account.number] = `${account.name} (${account.number})`;
    });

    return accountsHash;
  }

  fetchAccounts(params, cb) {
    let store = this;
    console.log("Getting from /api/v1/accounts");
    return axios.get('/api/v1/accounts', {
      params: params})
      .then((res: any) => res.data)
      .then(function(res: any) {
        store.accounts = res.map((account)     => new Account(account));
        store.accountsHash = store.makeAccountsHash(store.accounts);
        store.state    = "done"
        cb(store.accounts);
      });
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
