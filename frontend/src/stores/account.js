import { observable } from 'mobx'

class Account {
    @observable name
    @observable number
    @observable contactname
    @observable contactemail
    @observable reaperchannel
  
    constructor(account) {
      this.name = account.name
      this.number = account.number
      this.contactname = account.contactname
      this.contactemail = account.contactemail
      this.reaperchannel = account.reaperchannel
    }
}

export default Account