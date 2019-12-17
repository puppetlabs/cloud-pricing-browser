package config

import (
	"encoding/json"
	"log"
	"sort"

	"github.com/spf13/viper"
)

// Option is a generic type for config items which are lists of optoins
type Option struct {
	Label string `toml:"label" json:"label"`
	Value string `toml:"value" json:"value"`
}

// Account matches the format of the account list in the toml config
type Account struct {
	Name          string `toml:"name" json:"name"`
	ContactName   string `toml:"contactname" json:"contactname"`
	ContactEmail  string `toml:"contactemail" json:"contactemail"`
	Number        string `toml:"number" json:"number"`
	ReaperChannel string `toml:"reaperchannel" json:"reaperchannel"`
}

// Config struct matches the format of the toml config.
type Config struct {
	Accounts        []Account `toml:"account"`
	Portfolios      []Option  `toml:"portfolios"`
	Organizations   []Option  `toml:"orgnizations"`
	InterestingTags []Option  `toml:"interestingtags"`
}

// MarshalAccounts that are being sent over GET api endpoints.
func (c *Config) MarshalAccounts() []byte {
	sort.Slice(c.Accounts[:], func(i, j int) bool {
		return c.Accounts[i].Number < c.Accounts[j].Number
	})

	retVal, _ := json.Marshal(c.Accounts)
	return retVal
}

// MarshalOptions that are being sent over GET api endpoints.
func (c *Config) MarshalOptions(optionSet []Option) string {
	ba, _ := json.Marshal(optionSet)
	return string(ba)
}

// Initialize the toml config
func (c *Config) Initialize() {
	viper.SetConfigType("toml")
	viper.AddConfigPath("./")
	viper.SetConfigName("./config")

	err := viper.ReadInConfig() // Find and read the config file

	if err != nil {
		log.Fatalf("unable to decode into struct, %v", err)
	}

	err = viper.Unmarshal(&c)

	if err != nil {
		log.Fatalf("unable to decode into struct, %v", err)
	}
}
