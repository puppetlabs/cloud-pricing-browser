package routes

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/puppetlabs/cloud-pricing-browser/lib/aws/tagging"
	"github.com/puppetlabs/cloud-pricing-browser/lib/cloudability"
)

type Tagging struct {
}

type TaggingReturn struct {
	InstanceIDs   []string
	TagName       string
	TagValue      string
	Status        string
	StatusMessage string
}

type TagRequest struct {
	InstanceIDs []string `json:"instance_ids"`
	VendorKey   string   `json:"vendorKey"`
	VendorValue string   `json:"vendorValue"`
}

func (t *Tagging) Put(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("t.Put Method %s\n", r.Method)
	if r.Method == "GET" {
		tagKeysAndValuesJSON := cloudability.GetTagKeysAndValues()
		out, _ := json.Marshal(tagKeysAndValuesJSON)
		fmt.Fprintf(w, string(out))
	} else {
		body, err := ioutil.ReadAll(r.Body)

		if err != nil {
			fmt.Println(err)
		}

		var tagRequest TagRequest
		fmt.Printf("%+v", string(body))
		json.Unmarshal(body, &tagRequest)

		fmt.Printf("%+v\n", tagRequest)

		if len(tagRequest.InstanceIDs) < 1 {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Instance ID not set"))
			return
		}

		if tagRequest.VendorKey == "" {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Vendor Key not set"))
			return
		}

		if tagRequest.VendorValue == "" {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Vendor Value not set"))
			return
		}

		err = tagging.TagResources(tagRequest.InstanceIDs, tagRequest.VendorKey, tagRequest.VendorValue)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)

			var status string
			if strings.Contains(err.Error(), "Deleted Instance") {
				status = "Deleted"
			} else {
				status = "Failure"
			}

			taggingReturn := TaggingReturn{
				InstanceIDs:   tagRequest.InstanceIDs,
				TagName:       tagRequest.VendorKey,
				TagValue:      tagRequest.VendorValue,
				StatusMessage: err.Error(),
				Status:        status,
			}

			retVal, _ := json.Marshal(taggingReturn)
			w.Write([]byte(retVal))
		} else {
			taggingReturn := TaggingReturn{
				InstanceIDs:   tagRequest.InstanceIDs,
				TagName:       tagRequest.VendorKey,
				TagValue:      tagRequest.VendorValue,
				StatusMessage: fmt.Sprintf("Set tag %s to %s", tagRequest.VendorKey, tagRequest.VendorValue),
				Status:        "Success",
			}
			retVal, _ := json.Marshal(taggingReturn)
			w.Write([]byte(retVal))
		}
	}
	return
}
