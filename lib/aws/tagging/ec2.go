package tagging

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/service/ec2"
)

func TagEC2(sess client.ConfigProvider, creds *credentials.Credentials, instance_ids []string, tag_name string, tag_value string) {
	// Create EC2 service client
	svc := ec2.New(sess, &aws.Config{Credentials: creds})

	var aws_string_instance_ids []*string
	for _, instance_id := range instance_ids {
		aws_string_instance_ids = append(aws_string_instance_ids, aws.String(instance_id))
	}

	input := &ec2.CreateTagsInput{
		Resources: aws_string_instance_ids,
		Tags: []*ec2.Tag{
			{
				Key:   aws.String(tag_name),
				Value: aws.String(tag_value),
			},
		},
	}

	result, err := svc.CreateTags(input)

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
