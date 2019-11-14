package main

import (
	// "github.com/puppetlabs/cloud_pricing/datasrc/aws"
	"github.com/puppetlabs/cloud_pricing/datasrc/cloudability"
	"github.com/puppetlabs/cloud_pricing/datasrc/json_writer"
	"github.com/puppetlabs/cloud_pricing/datasrc/processor"
)

func main() {
	teamCosts := cloudability.FetchTeamCosts()
	// instances := aws.GetInstances()
	instances := cloudability.FetchInstances()
	cloudability.PopulateUniqueTags(instances)
	processed_data := processor.Run(teamCosts)

	json_writer.Persist(processed_data)
}
