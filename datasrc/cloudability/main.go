package cloudability

import (
	"encoding/base64"
	"encoding/json"

	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

func basicAuth(username, password string) string {
	auth := username + ":" + password
	return base64.StdEncoding.EncodeToString([]byte(auth))
}

func Get(endpoint string) []byte {
	cloudabilityApiKey := os.Getenv("CLOUDABILITY_API_KEY")
	cloudabilityURL := fmt.Sprintf("https://api.cloudability.com/v3%s", endpoint)
	fmt.Println(cloudabilityURL)
	req, _ := http.NewRequest("GET", cloudabilityURL, nil)
	req.Header.Set("Authorization", fmt.Sprintf("Basic %s", basicAuth(cloudabilityApiKey, os.Getenv("CLOUDABILITY_USER_PASSWORD"))))
	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Fatal Error Line 27")
		log.Fatal(err)
	}

	defer resp.Body.Close()

	fmt.Println(resp.StatusCode)

	if resp.StatusCode == http.StatusOK {
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Fatal Error Line 35")
			log.Fatal(err)
		}
		return bodyBytes
	}

	return []byte{}
}

type RecommendationResults struct {
	Result []Result `json:"result"`
}

func FetchInstances() []Result {
	ec2Data := Get("/rightsizing/aws/recommendations/ec2?duration=thirty-day")

	var recRes RecommendationResults
	json.Unmarshal(ec2Data, &recRes)

	return WriteResults(recRes.Result)
}

/* Run should fetch report data from cloudability. */
func FetchTeamCosts() []byte {
	cloudabilityApiKey := os.Getenv("CLOUDABILITY_API_KEY")

	year, month, _ := time.Now().Date()

	cloudabilityURL := fmt.Sprintf("https://app.cloudability.com/api/1/reporting/cost/run?dimensions=tag3,year_month,tag4&end_date=%d-%2d-28&metrics=unblended_cost,total_amortized_cost&order=desc&sort_by=unblended_cost&start_date=%d-%2d-01&auth_token=%s", year, int(month), year, int(month), cloudabilityApiKey)
	fmt.Println(cloudabilityURL)
	req, _ := http.NewRequest("GET", cloudabilityURL, nil)

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Fatal Error Line 27")
		log.Fatal(err)
	}

	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Fatal Error Line 35")
			log.Fatal(err)
		}
		return bodyBytes
	}

	return []byte{}
}
