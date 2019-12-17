package main

import (
	"fmt"
	"log"
	"net/http"

	_ "github.com/BurntSushi/toml"
	"github.com/puppetlabs/cloud-pricing-browser/cmd/config"
	"github.com/puppetlabs/cloud-pricing-browser/cmd/web/routes"
)

func main() {
	var c config.Config
	c.Initialize()

	var i routes.Instances
	var t routes.Tagging

	http.HandleFunc("/api/v1/instances", i.Get)
	http.HandleFunc("/api/v1/tags", t.Put)

	http.HandleFunc("/api/v1/portfolios", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, c.MarshalOptions(c.Portfolios))
	})

	http.HandleFunc("/api/v1/accounts", func(w http.ResponseWriter, r *http.Request) {
		accounts := c.MarshalAccounts()
		fmt.Fprintf(w, string(accounts))
	})

	http.HandleFunc("/api/v1/organizations", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, c.MarshalOptions(c.Organizations))
	})

	http.HandleFunc("/api/v1/interesting_tags", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, c.MarshalOptions(c.InterestingTags))
	})

	fmt.Println("Listening on localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
