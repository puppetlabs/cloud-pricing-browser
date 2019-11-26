package tagging

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/service/cloudfront"
)

func TagCloudfront(sess client.ConfigProvider, creds *credentials.Credentials, account string, instance_id string, tag_name string, tag_value string) {
	// Create EC2 service client
	svc := cloudfront.New(sess, &aws.Config{Credentials: creds})

	arn := fmt.Sprintf("arn:aws:cloudfront::%s:distribution/%s", account, instance_id)
	input := &cloudfront.TagResourceInput{
		Resource: aws.String(arn),
		Tags: &cloudfront.Tags{
			Items: []*cloudfront.Tag{
				{
					Key:   aws.String(tag_name),
					Value: aws.String(tag_value),
				},
			},
		},
	}

	result, err := svc.TagResource(input)

	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return
	}

	fmt.Printf("%+v", result)
}
