package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
)

type Instances struct {
}

func (i *Instances) Get(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("%+v", r.URL.Query())

	tagKey := readString(r.URL.Query(), "tag_key", "")
	tagVal := readString(r.URL.Query(), "tag_val", "")
	vendorAccountId := readString(r.URL.Query(), "vendorAccountId", "")
	untagged := readBool(r.URL.Query(), "untagged", false)
	size := readInt(r.URL.Query(), "size", 100)
	page := readInt(r.URL.Query(), "page", 100)

	var instancesJSON cloudability.ReturnInstances
	if untagged {
		instancesJSON = cloudability.UntaggedInstanceReport(size, page)
	} else {
		instancesJSON = cloudability.GetInstances(vendorAccountId, tagKey, tagVal, size, page)
	}
	fmt.Printf("Returning %d instances\n", len(instancesJSON.Instances))

	instancesOut, _ := json.Marshal(instancesJSON)
	fmt.Fprintf(w, string(instancesOut))
}
