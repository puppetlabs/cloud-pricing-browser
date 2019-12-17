package tagging

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/service/rds"
)

func TagRDS(sess client.ConfigProvider, creds *credentials.Credentials, account string, region string, instance_id string, tag_name string, tag_value string) error {
	// Create rds service client
	svc := rds.New(sess, &aws.Config{Credentials: creds})

	arn := fmt.Sprintf("arn:aws:rds:%s:%s:cluster:%s", region, account, instance_id)

	input := &rds.AddTagsToResourceInput{
		ResourceName: aws.String(arn),
		Tags: []*rds.Tag{
			{
				Key:   aws.String(tag_name),
				Value: aws.String(tag_value),
			},
		},
	}

	result, err := svc.AddTagsToResource(input)

	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			default:
				fmt.Println(aerr.Error())
				return aerr
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
			return err
		}
		return nil
	}
	fmt.Printf("%+v", result)
	return nil

}
