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

func (t *Tagging) Put(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("%+v", r.URL.Query())

	instanceIDs := readStringArray(r.URL.Query(), "instance_ids", []string{})
	tagName := readString(r.URL.Query(), "tag_name", "")
	tagValue := readString(r.URL.Query(), "tag_value", "")

	err := tagging.TagResources(instanceIDs, tagName, tagValue)

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
