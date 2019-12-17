package main

import "github.com/puppetlabs/cloud-pricing-browser/lib/cloudability"

func main() {
	// teamCosts := cloudability.FetchTeamCosts()
	// cloudability.DeleteAll()
	instances := cloudability.FetchInstances()
	cloudability.PopulateUniqueTags(instances)

	buckets := cloudability.FetchBuckets()
	cloudability.PopulateUniqueTags(buckets)

	// aws.Instances()
}
