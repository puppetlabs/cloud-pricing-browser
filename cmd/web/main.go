package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
)

func main() {
	tagKeysAndValuesJSON := cloudability.GetTagKeysAndValues()
	out, _ := json.Marshal(tagKeysAndValuesJSON)
	http.HandleFunc("/api/v1/tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, string(out))
	})

	http.HandleFunc("/api/v1/instances", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("%+v", r.URL.Query())
		tagKey := ""
		tagVal := ""
		size := 0
		page := 0
		if len(r.URL.Query()["tag_key"]) > 0 {
			tagKey = r.URL.Query()["tag_key"][0]
			tagVal = r.URL.Query()["tag_val"][0]
			size, _ = strconv.Atoi(r.URL.Query()["size"][0])
			page, _ = strconv.Atoi(r.URL.Query()["page"][0])
		}

		instancesJSON := cloudability.GetInstances(tagKey, tagVal, size, page)
		fmt.Printf("Returning %d instances\n", len(instancesJSON.Instances))

		instancesOut, _ := json.Marshal(instancesJSON)
		fmt.Fprintf(w, string(instancesOut))
	})

	http.HandleFunc("/api/v1/interesting_tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "[\"tag_user_cost_center\",\"tag_user_department\"]")
	})

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
