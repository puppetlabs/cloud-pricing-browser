package aws

import (
	"encoding/base64"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/costexplorer"
	// "github.com/aws/aws-sdk-go/service/ec2"
)

func basicAuth(username, password string) string {
	auth := username + ":" + password
	return base64.StdEncoding.EncodeToString([]byte(auth))
}

/* Run should fetch report data from cloudability. */
func GetInstances() {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	_ = costexplorer.New(sess)

	// client.GetCostAndUsage()
}
