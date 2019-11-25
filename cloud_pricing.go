package main

import (
	"github.com/puppetlabs/cloud-pricing-browser/datasrc/aws"
	// "github.com/puppetlabs/cloud-pricing-browser/datasrc/cloudability"
)

func main() {
	// teamCosts := cloudability.FetchTeamCosts()
	// cloudability.DeleteAll()
	// instances := cloudability.FetchInstances()
	// cloudability.PopulateUniqueTags(instances)
	aws.Instances()
}
