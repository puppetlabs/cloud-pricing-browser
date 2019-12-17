package tagging

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/service/ec2"
)

func TagEC2(sess client.ConfigProvider, creds *credentials.Credentials, instanceID string, tag_name string, tag_value string) error {
	// Create EC2 service client
	svc := ec2.New(sess, &aws.Config{Credentials: creds})

	var instanceIDs = []string{instanceID}

	var awsStringInstanceIDs []*string
	for _, instanceID := range instanceIDs {
		awsStringInstanceIDs = append(awsStringInstanceIDs, aws.String(instanceID))
	}

	input := &ec2.CreateTagsInput{
		Resources: awsStringInstanceIDs,
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
			case "InvalidInstanceID.NotFound":
				fmt.Println("awserr.Error: ")
				fmt.Println(aerr.Code())
				fmt.Println(aerr.Error())
				return err
			default:
				fmt.Println("awserr.Error: ")
				fmt.Println(aerr.Code())
				fmt.Println(aerr.Error())
				return err
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Printf("Tagging EC2 instances returned error %s\n", err.Error())
			return err
		}
		return err
	}

	fmt.Printf("%+v", result)
	return nil
}
