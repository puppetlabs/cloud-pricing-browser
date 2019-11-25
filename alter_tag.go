package main

import (
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"

	"fmt"
)

func main() {
	account := os.Args[1]
	instance_id := os.Args[2]
	tag_name := os.Args[3]
	tag_value := os.Args[4]

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-west-2")},
	)

	// Create EC2 service client
	svc := ec2.New(sess)

	input := &ec2.CreateTagsInput{
		Resources: []*string{
			aws.String(instance_id),
		},
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

	fmt.Println(result)
}
