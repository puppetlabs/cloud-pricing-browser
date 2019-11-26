package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
)

type Instances struct {
}

func readString(query url.Values, key string, stringDefault string) string {
	if len(query[key]) > 0 {
		return query[key][0]
	}
	return stringDefault
}
func readInt(query url.Values, key string, intDefault int) int {
	if len(query[key]) > 0 {
		retVal, _ := strconv.Atoi(query[key][0])
		return retVal
	}
	return intDefault
}

func (i *Instances) Get(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("%+v", r.URL.Query())

	tagKey := readString(r.URL.Query(), "tag_key", "")
	tagVal := readString(r.URL.Query(), "tag_val", "")
	vendorAccountId := readString(r.URL.Query(), "vendorAccountId", "")
	size := readInt(r.URL.Query(), "size", 100)
	page := readInt(r.URL.Query(), "page", 100)

	instancesJSON := cloudability.GetInstances(vendorAccountId, tagKey, tagVal, size, page)
	fmt.Printf("Returning %d instances\n", len(instancesJSON.Instances))

	instancesOut, _ := json.Marshal(instancesJSON)
	fmt.Fprintf(w, string(instancesOut))
}

func main() {
	tagKeysAndValuesJSON := cloudability.GetTagKeysAndValues()
	out, _ := json.Marshal(tagKeysAndValuesJSON)
	http.HandleFunc("/api/v1/tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, string(out))
	})

	var i Instances
	http.HandleFunc("/api/v1/instances", i.Get)

	http.HandleFunc("/api/v1/interesting_tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "[\"tag_user_cost_center\",\"tag_user_department\"]")
	})

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
