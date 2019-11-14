package json_writer

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/puppetlabs/cloud_pricing/datasrc/processor"
)

type Project struct {
	Name           string
	CostsLastMonth int
	CostsThisMonth int
}

type Department struct {
	Name     string
	Projects map[string]Project
}

type ToWriteJSON struct {
	Departments map[string]Department
}

func stringToInt(cost string) int {
	stringWithoutDollar := strings.Replace(cost, "$", "", -1)
	stringWithoutComma := strings.Replace(stringWithoutDollar, ",", "", -1)
	splitCost := strings.Split(stringWithoutComma, ".")

	retInt, err := strconv.Atoi(splitCost[0])

	if err != nil {
		log.Fatal(err)
	}

	return retInt
}

func Persist(processedData []processor.Tag) {
	var toWriteJSON ToWriteJSON
	t := time.Now()

	for i := range processedData {
		var line = processedData[i]

		if toWriteJSON.Departments == nil {
			toWriteJSON.Departments = make(map[string]Department)
		}

		var thisDepartment = toWriteJSON.Departments[line.Tag3]

		thisDepartment.Name = line.Tag3
		if thisDepartment.Projects == nil {
			thisDepartment.Projects = make(map[string]Project)
		}
		var thisProject = thisDepartment.Projects[line.Tag4]
		thisProject.Name = line.Tag4

		if line.YearMonth == fmt.Sprintf("%d-%02d", t.Year(), t.Month()) {
			thisProject.CostsThisMonth = stringToInt(line.TotalAmortizedCost)
		} else {
			thisProject.CostsLastMonth = stringToInt(line.TotalAmortizedCost)
		}

		thisDepartment.Projects[line.Tag4] = thisProject
		toWriteJSON.Departments[line.Tag3] = thisDepartment
	}

	b, err := json.Marshal(toWriteJSON)

	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile("./data/cloud_costs.json", b, 0644)
}
