package aws

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials/stscreds"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/costexplorer"
)

func basicAuth(username, password string) string {
	auth := username + ":" + password
	return base64.StdEncoding.EncodeToString([]byte(auth))
}

/* Fetches Cost Data from AWS by instance/resource.. */
func Instances() {

	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	// reader := bufio.NewReader(os.Stdin)
	// fmt.Print("MFA Token -> ")
	// text, _ := reader.ReadString('\n')
	// // convert CRLF to LF
	// tokenCode := strings.Replace(text, "\n", "", -1)
	//
	// fmt.Printf("|%s|\n", tokenCode)

	billingRole := os.Getenv("BILLING_ROLE")
	tokenSerialNumber := os.Getenv("TOKEN_SERIAL_NUMBER")

	fmt.Printf("%+v", sess)

	creds := stscreds.NewCredentials(sess, billingRole, func(p *stscreds.AssumeRoleProvider) {
		p.SerialNumber = aws.String(tokenSerialNumber)
		p.TokenProvider = stscreds.StdinTokenProvider
	})

	client := costexplorer.New(sess, &aws.Config{Credentials: creds})

	groupBy := []*costexplorer.GroupDefinition{
		{Key: aws.String("NAME"), Type: aws.String("TAG")},
		{Key: aws.String("RESOURCE_ID"), Type: aws.String("DIMENSION")},
	}

	start := "2019-10-01"
	end := "2019-11-01"
	dateInterval := costexplorer.DateInterval{
		Start: &start,
		End:   &end,
	}
	getCostAndUsageWithResourcesInput := costexplorer.GetCostAndUsageWithResourcesInput{
		Granularity: aws.String("MONTHLY"),
		Metrics:     []*string{aws.String("AMORTIZED_COST")},
		GroupBy:     groupBy,
		TimePeriod:  &dateInterval,
		Filter: &costexplorer.Expression{
			Dimensions: &costexplorer.DimensionValues{
				Key: aws.String("SERVICE"),
				Values: []*string{
					aws.String("Amazon Elastic Compute Cloud - Compute"),
				},
			},
		},
	}

	result, err := client.GetCostAndUsageWithResources(&getCostAndUsageWithResourcesInput)

	if err != nil { // resp is now filled
		panic(err)
	}

	fmt.Println(result)
}
