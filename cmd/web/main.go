package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/puppetlabs/cloud-pricing-browser/cmd/web/routes"
	"github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
)

func main() {
	tagKeysAndValuesJSON := cloudability.GetTagKeysAndValues()
	out, _ := json.Marshal(tagKeysAndValuesJSON)
	http.HandleFunc("/api/v1/tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, string(out))
	})

	var i routes.Instances
	var t routes.Tagging
	http.HandleFunc("/api/v1/instances", i.Get)
	http.HandleFunc("/api/v1/tag", t.Post)

	http.HandleFunc("/api/v1/interesting_tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "[\"tag_user_cost_center\",\"tag_user_department\"]")
	})

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
