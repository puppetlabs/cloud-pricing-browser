package tagging

import (
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials/stscreds"
	"github.com/aws/aws-sdk-go/aws/session"

	"fmt"
)

func TagResources(instanceIDs []string, tagName string, tagValue string) error {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)

	if err != nil {
		return err
	}

	for _, instanceID := range instanceIDs {
		instance := cloudability.GetInstance(instanceID)
		taggingRoleName := "TaggingUser"

		taggingRole := fmt.Sprintf("arn:aws:iam::%s:role/%s", account, taggingRoleName)
		tokenSerialNumber := os.Getenv("TOKEN_SERIAL_NUMBER")

		fmt.Printf("Using tagging Role: %s and Serial Number: %s\n", taggingRole, tokenSerialNumber)
		fmt.Printf("Setting %s to %s on %+v in account %s\n", tagName, tagValue, instanceIDs, account)

		creds := stscreds.NewCredentials(sess, taggingRole, func(p *stscreds.AssumeRoleProvider) {
			p.SerialNumber = aws.String(tokenSerialNumber)
			p.TokenProvider = stscreds.StdinTokenProvider
		})

		if service == "ec2" {
			TagEC2(sess, creds, instanceIDs, tagName, tagValue)
			return nil
		}

		for _, instanceID := range instanceIDs {
			if service == "s3" {
				TagS3(sess, creds, instanceID, tagName, tagValue)
				return nil
			} else if service == "cloudfront" {
				TagCloudfront(sess, creds, account, instanceID, tagName, tagValue)
				return nil
			} else if service == "rds" {
				TagRDS(sess, creds, account, region, instanceID, tagName, tagValue)
				return nil
			}
		}

		return fmt.Errorf("Service Not found")
	}
}
