package main

import (
	"encoding/json"
	"fmt"
	"github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
	"log"
	"net/http"
)

func main() {
	tagKeysAndValuesJSON := cloudability.GetTagKeysAndValues()
	out, _ := json.Marshal(tagKeysAndValuesJSON)
	http.HandleFunc("/api/v1/tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, string(out))
	})

	instancesJSON := cloudability.GetInstances()
	instancesOut, _ := json.Marshal(instancesJSON)
	http.HandleFunc("/api/v1/instances", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Returning %d instances\n", len(instancesJSON))
		fmt.Fprintf(w, string(instancesOut))
	})

	http.HandleFunc("/api/v1/interesting_tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "[\"tag_user_cost_center\",\"tag_user_department\"]")
	})

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
