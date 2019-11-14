package main

import (
	"encoding/json"
	"fmt"
	"github.com/puppetlabs/cloud_pricing/datasrc/cloudability"
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

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
