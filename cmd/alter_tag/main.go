package main

import (
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials/stscreds"
	"github.com/aws/aws-sdk-go/aws/session"

	"github.com/puppetlabs/cloud-pricing-browser/lib/aws/tagging"

	"fmt"
)

func main() {
	account := os.Args[1]
	region := os.Args[2]
	service := os.Args[3]
	instance_id := os.Args[4]
	tag_name := os.Args[5]
	tag_value := os.Args[6]

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)

	taggingRoleName := "TaggingUser"

	taggingRole := fmt.Sprintf("arn:aws:iam::%s:role/%s", account, taggingRoleName)
	// tokenSerialNumber := os.Getenv("TOKEN_SERIAL_NUMBER")

	// fmt.Printf("Using tagging Role: %s and Serial Number: %s\n", taggingRole, //tokenSerialNumber)
	fmt.Printf("Setting %s to %s on %s in account %s\n", tag_name, tag_value, instance_id, account)

	creds := stscreds.NewCredentials(sess, taggingRole)

	if service == "s3" {
		tagging.TagS3(sess, creds, instance_id, tag_name, tag_value)
	} else if service == "ec2" {
		tagging.TagEC2(sess, creds, instance_id, tag_name, tag_value)
	} else if service == "cloudfront" {
		tagging.TagCloudfront(sess, creds, account, instance_id, tag_name, tag_value)
	} else if service == "rds" {
		tagging.TagRDS(sess, creds, account, region, instance_id, tag_name, tag_value)
	}

	if err != nil {
		panic(err)
	}

}
