package cloudability

import (
	"fmt"
	"os"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var ignoredKeys = []string{
	"tag_user_Name",
}

type Tag struct {
	gorm.Model
	Key      string `json:"vendorKey"`
	Value    string `json:"vendorValue"`
	ResultID uint
}

type UniqueTag struct {
	gorm.Model
	Cost    float64 `json:"cost"`
	Count   int     `json:"count"`
	Hourly  float64 `json:"hourly"`
	Key     string  `json:"key"`
	Monthly float64 `json:"monthly"`
	Value   string  `json:"value"`
}

type Result struct {
	gorm.Model
	EffectiveHourly    float64   `json:"effectiveHourly"`
	HoursRunning       int       `jons:"hoursRunning"`
	LastSeen           time.Time `json:"lastSeen"`
	Name               string    `json:"name"`
	NodeType           string    `json:"nodeType"`
	OS                 string    `json:"os"`
	Provider           string    `json:"provider"`
	Region             string    `json:"region"`
	ResourceIdentifier string    `json:"resourceIdentifier" gorm:"unique"`
	Service            string    `json:"service"`
	Tags               []Tag     `json:"tags" gorm:"foreignkey:ResultID" gorm:"auto_preload"`
	TotalSpend         float64   `json:"totalSpend"`
	VendorAccountId    string    `json:"vendorAccountId"`
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func DeleteAll() {
	db := PostgresConnect()
	db.LogMode(true)

	db.Unscoped().Delete(Tag{})
	db.Unscoped().Delete(UniqueTag{})
	db.Unscoped().Delete(Result{})

}

func PostgresConnect() *gorm.DB {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	fmt.Printf("host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable\n\n", dbHost, dbUser, dbName, dbPass)
	db, err := gorm.Open(
		"postgres",
		fmt.Sprintf("host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable", dbHost, dbUser, dbName, dbPass),
	)

	db.LogMode(true)

	if err != nil {
		fmt.Println(err)
		panic("failed to connect database")
	}

	return db
}

func GetTagKeysAndValues() []UniqueTag {
	var tags []UniqueTag
	// db, err := gorm.Open("sqlite3", "test.db")
	db := PostgresConnect()
	db.Find(&tags)
	return tags
}

type ReturnInstances struct {
	Instances []Result `json:"instances"`
	PageCount int      `json:"page_count"`
}

func GetInstances(key string, val string, size int, page int) ReturnInstances {
	var instances []Result
	// var tags []Tag
	db := PostgresConnect()
	// db.Joins("INNER JOIN tags on results.id = tags.result_id").Limit(100).Find(&instances)

	// db.Find(&instances)
	// db.Find(&tags)
	// db.Model(&instances).Related(&tags)

	db.Joins("JOIN tags on results.id = tags.result_id").Where("tags.key = ?", key).Where("tags.value = ?", val).Limit(size).Preload("Tags").Find(&instances)

	// pagination.Paging(&pagination.Param{
	// 	DB:      db,
	// 	Page:    page,
	// 	Limit:   size,
	// 	OrderBy: []string{"total_spend desc"},
	// }, &instances)

	for i, inst := range instances {
		fmt.Printf("%d. %+v\n\n", i, inst)
	}

	fmt.Printf("\n\n%d\n\n", len(instances))
	return ReturnInstances{
		Instances: instances,
		PageCount: 10,
	}
}

func PopulateUniqueTags(results []Result) []Result {
	tagInfo := make(map[string]map[string]UniqueTag)

	for _, result := range results {
		for _, tag := range result.Tags {
			if _, ok := tagInfo[tag.Key]; ok {
				if _, ok := tagInfo[tag.Key][tag.Value]; ok {
					var tmpStruct = tagInfo[tag.Key][tag.Value]
					tmpStruct.Cost = tmpStruct.Cost + result.TotalSpend
					tmpStruct.Count = tmpStruct.Count + 1
					tmpStruct.Hourly = tmpStruct.Hourly + result.EffectiveHourly
					tmpStruct.Monthly = tmpStruct.Monthly + (result.EffectiveHourly * 24 * 30)
					tagInfo[tag.Key][tag.Value] = tmpStruct
				} else {
					tagInfo[tag.Key][tag.Value] = UniqueTag{
						Key:     tag.Key,
						Value:   tag.Value,
						Count:   1,
						Cost:    result.TotalSpend,
						Hourly:  result.EffectiveHourly,
						Monthly: (result.EffectiveHourly * 24 * 30),
					}
				}
			} else {
				tagInfo[tag.Key] = make(map[string]UniqueTag)
				tagInfo[tag.Key][tag.Value] = UniqueTag{
					Key:     tag.Key,
					Value:   tag.Value,
					Cost:    result.TotalSpend,
					Count:   1,
					Hourly:  result.EffectiveHourly,
					Monthly: (result.EffectiveHourly * 24 * 30),
				}
				tagInfo[tag.Key]["none"] = UniqueTag{
					Key:     tag.Key,
					Value:   "none",
					Count:   0,
					Cost:    0,
					Hourly:  0,
					Monthly: 0,
				}

			}
		}
	}

	db := PostgresConnect()

	for _, result := range results {
		for tag, _ := range tagInfo {
			if stringArrayDoesNotContain(GetKeys(result.Tags), tag) {
				var tmpStruct = tagInfo[tag]["none"]
				tmpStruct.Count = tmpStruct.Count + 1
				tmpStruct.Cost = tmpStruct.Cost + result.TotalSpend
				tmpStruct.Hourly = tmpStruct.Hourly + result.EffectiveHourly
				tmpStruct.Monthly = tmpStruct.Monthly + (result.EffectiveHourly * 24 * 30)
				tagInfo[tag]["none"] = tmpStruct
			}
		}
	}

	for _, a := range tagInfo {
		for _, b := range a {
			var uniqueTag UniqueTag
			if stringArrayDoesNotContain(ignoredKeys, b.Key) {
				db.Where(UniqueTag{Key: b.Key, Value: b.Value}).Assign(b).FirstOrCreate(&uniqueTag)
			}
		}
	}
	return results
}

func GetKeys(tags []Tag) []string {
	var retVal []string
	for _, t := range tags {
		retVal = append(retVal, t.Key)
	}

	return retVal
}

func stringArrayDoesNotContain(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return false
		}
	}
	return true
}

func WriteResults(results []Result) []Result {
	db := PostgresConnect()

	// Migrate the schema
	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Result{})
	db.AutoMigrate(&UniqueTag{})
	// Create
	for _, result := range results {
		var thisResult Result
		db.Where(Result{ResourceIdentifier: result.ResourceIdentifier}).Assign(result).FirstOrCreate(&thisResult)
		// db.Create(&result)
	}

	return results
}
