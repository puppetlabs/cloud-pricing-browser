package config

import (
	"testing"
)

func TestMarshalAccounts(t *testing.T) {
	var c Config
	c.Accounts = []Account{
		Account{
			Name:          "name",
			ContactName:   "contact_name",
			ContactEmail:  "contact_email",
			Number:        "number",
			ReaperChannel: "reaper_channel",
		},
	}

	marshaledAccounts := string(c.MarshalAccounts())
	expected := "[{\"name\":\"name\",\"contactname\":\"contact_name\",\"contactemail\":\"contact_email\",\"number\":\"number\",\"reaperchannel\":\"reaper_channel\"}]"
	if marshaledAccounts != expected {
		t.Errorf("Account didn't marshal: %+v, %s, %s",
			c.Accounts,
			marshaledAccounts,
			expected,
		)
	}

}
