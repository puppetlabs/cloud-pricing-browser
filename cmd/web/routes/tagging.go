package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/puppetlabs/cloud-pricing-browser/lib/aws/tagging"
)

type Tagging struct {
}

type TaggingReturn struct {
	InstanceIDs []string
	TagName     string
	TagValue    string
	Status      string
}

func (t *Tagging) Post(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("%+v", r.URL.Query())

	vendorAccountID := readString(r.URL.Query(), "vendorAccountID", "")
	region := readString(r.URL.Query(), "region", "")
	service := readString(r.URL.Query(), "service", "")
	instanceIDs := readStringArray(r.URL.Query(), "instance_ids", []string{})
	tagName := readString(r.URL.Query(), "tag_name", "")
	tagValue := readString(r.URL.Query(), "tag_value", "")

	err := tagging.TagResources(vendorAccountID, region, service, instanceIDs, tagName, tagValue)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
	} else {
		taggingReturn := TaggingReturn{
			InstanceIDs: instanceIDs,
			TagName:     tagName,
			TagValue:    tagValue,
			Status:      "Success",
		}
		fmt.Fprintf(w, "Set tags.")
		retVal, _ := json.Marshal(taggingReturn)
		w.Write([]byte(retVal))
	}

}
