package tagging

import (
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials/stscreds"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/puppetlabs/cloud-pricing-browser/lib/cloudability"

	"fmt"
)

func TagResources(instanceIDs []string, tagName string, tagValue string) error {
	for _, instanceID := range instanceIDs {
		fmt.Printf("%+v", instanceIDs)
		if instanceID == "" {
			time.Sleep(10 * time.Minute)

			return nil
		}

		instance := cloudability.GetInstance(instanceID)

		fmt.Printf("Changing Tags on (from instance id: %s):", instanceID)
		fmt.Printf("%+v", instance)
		region := instance.Region
		account := instance.VendorAccountId
		service := instance.Service

		if service == "ec2-recs" {
			service = "ec2"
		}

		sess, err := session.NewSession(&aws.Config{
			Region: aws.String(region),
		})

		if err != nil {
			return err
		}

		taggingRoleName := "TaggingUser"

		taggingRole := fmt.Sprintf("arn:aws:iam::%s:role/%s", account, taggingRoleName)
		// tokenSerialNumber := os.Getenv("TOKEN_SERIAL_NUMBER")

		fmt.Printf("Using tagging Role: %s\n", taggingRole)
		fmt.Printf("Setting %s to %s on %+v in account %s\n", tagName, tagValue, instanceIDs, account)

		creds := stscreds.NewCredentials(sess, taggingRole)

		if service == "ec2" {
			err := TagEC2(sess, creds, instanceID, tagName, tagValue)
			if err != nil && strings.Contains(err.Error(), "InvalidInstanceID.NotFound") {
				cloudability.DeleteInstance(instanceID)
				return fmt.Errorf("Deleted Instance with ID: %s as it did not exist", instanceID)
			} else if err != nil {
				return fmt.Errorf(err.Error())
			}

			var tagger cloudability.Tagger
			tagger.ConnectToDB()
			tagger.TagInstance(instanceID, tagName, tagValue)

			return nil
		}

		if service == "s3" {
			return TagS3(sess, creds, instanceID, tagName, tagValue)

		} else if service == "cloudfront" {
			return TagCloudfront(sess, creds, account, instanceID, tagName, tagValue)

		} else if service == "rds" {
			return TagRDS(sess, creds, account, region, instanceID, tagName, tagValue)

		}

		return fmt.Errorf("Service Not found")
	}

	return nil
}
