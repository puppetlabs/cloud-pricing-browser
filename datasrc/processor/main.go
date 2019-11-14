package processor

import (
	"encoding/json"
	"fmt"
)

type Tag struct {
	Tag3               string `json:"tag3"`
	Tag4               string `json:"tag4"`
	YearMonth          string `json:"year_month"`
	UnblendedCost      string `json:"unblended_cost"`
	TotalAmortizedCost string `json:"total_amortized_cost"`
}

type Report struct {
	Results []Tag `json: results`
}

func Run(data []byte) []Tag {
	var reports Report

	fmt.Printf("%+v", string(data))

	err := json.Unmarshal(data, &reports)

	if err != nil {
		fmt.Println("Fatal Error processor/main.go Line 26")
		fmt.Println("error:", err)
	}
	fmt.Println("\n\n")
	for report := range reports.Results {
		fmt.Printf("%+v\n", reports.Results[report])
	}

	return reports.Results
}
