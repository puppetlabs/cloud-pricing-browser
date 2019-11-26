package tagging

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/service/s3"
)

func TagS3(sess client.ConfigProvider, creds *credentials.Credentials, instance_id string, tag_name string, tag_value string) {
	// Create S3 service client
	svc := s3.New(sess, &aws.Config{Credentials: creds})

	input := &s3.PutBucketTaggingInput{
		Bucket: aws.String(instance_id),
		Tagging: &s3.Tagging{
			TagSet: []*s3.Tag{
				{
					Key:   aws.String(tag_name),
					Value: aws.String(tag_value),
				},
			},
		},
	}

	result, err := svc.PutBucketTagging(input)

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
