package cloudability

import (
	"fmt"
	"os"
	"testing"

	"github.com/jinzhu/gorm"
)

func TestMain(m *testing.M) {
	db := PostgresConnectTest()

	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Result{})
	db.AutoMigrate(&UniqueTag{})

	db.Unscoped().Delete(Tag{})
	db.Unscoped().Delete(UniqueTag{})
	db.Unscoped().Delete(Result{})

	exitVal := m.Run()
	os.Exit(exitVal)
}

func TestTagInstances(t *testing.T) {
	var ta Tagger
	ta.DB = PostgresConnectTest()

	tagsa := []Tag{
		Tag{
			Key:   "tag_user_test_key_aa",
			Value: "test_value_aa",
		},
		Tag{
			Key:   "tag_user_test_key_ab",
			Value: "test_value_ab",
		},
	}

	tagsb := []Tag{
		Tag{
			Key:   "tag_user_test_key_ba",
			Value: "test_value_ba",
		},
		Tag{
			Key:   "tag_user_test_key_bb",
			Value: "test_value_bb",
		},
	}

	tagsc := []Tag{
		Tag{
			Key:   "tag_user_test_key_ca",
			Value: "test_value_ca",
		},
		Tag{
			Key:   "tag_user_test_key_cb",
			Value: "test_value_cb",
		},
	}

	instance1 := Result{
		EffectiveHourly:    1,
		HoursRunning:       1,
		Name:               "Test 1",
		Terminated:         false,
		ResourceIdentifier: "i-00000001",
		Tags:               tagsa,
	}

	instance2 := Result{
		EffectiveHourly:    1,
		HoursRunning:       1,
		Name:               "Test 2",
		Terminated:         false,
		ResourceIdentifier: "i-00000002",
		Tags:               tagsb,
	}

	instance3 := Result{
		EffectiveHourly:    1,
		HoursRunning:       1,
		Name:               "Test 3",
		Terminated:         false,
		ResourceIdentifier: "i-00000003",
		Tags:               tagsc,
	}

	CreateInstanceForTest(instance1)
	CreateInstanceForTest(instance2)
	CreateInstanceForTest(instance3)

	var preResultOne Result
	var preResultTwo Result
	var preResultThree Result
	ta.DB.Where("resource_identifier = ?", "i-00000001").Preload("Tags").First(&preResultOne)
	ta.DB.Where("resource_identifier = ?", "i-00000002").Preload("Tags").First(&preResultTwo)
	ta.DB.Where("resource_identifier = ?", "i-00000003").Preload("Tags").First(&preResultThree)

	ta.TagInstance("i-00000001", "test_key_aa", "test_value_aa")
	ta.TagInstance("i-00000002", "test_key_bb", "test_value_bbb")
	ta.TagInstance("i-00000003", "test_key_cc", "test_value_cc")

	var resultOne Result
	var resultTwo Result
	var resultThree Result
	ta.DB.Where("resource_identifier = ?", "i-00000001").Preload("Tags").First(&resultOne)
	ta.DB.Where("resource_identifier = ?", "i-00000002").Preload("Tags").First(&resultTwo)
	ta.DB.Where("resource_identifier = ?", "i-00000003").Preload("Tags").First(&resultThree)

	resultOneCompareTo := []Tag{
		Tag{
			Key:   "tag_user_test_key_aa",
			Value: "test_value_aa",
		},
		Tag{
			Key:   "tag_user_test_key_ab",
			Value: "test_value_ab",
		},
	}
	if !TagSlicesEqual(JustTags(resultOne.Tags), resultOneCompareTo) {
		t.Errorf("Test One Didn't Work:\n\n %+v\n\n %+v\n\n---------", JustTags(resultOne.Tags), resultOneCompareTo)
	}

	resultTwoCompareTo := []Tag{
		Tag{
			Key:   "tag_user_test_key_ba",
			Value: "test_value_ba",
		},
		Tag{
			Key:   "tag_user_test_key_bb",
			Value: "test_value_bbb",
		},
	}
	if !TagSlicesEqual(JustTags(resultTwo.Tags), resultTwoCompareTo) {
		t.Errorf("Test Two Didn't Work:\n\n %+v\n\n %+v\n\n---------", JustTags(resultTwo.Tags), resultTwoCompareTo)
	}

	resultThreeCompareTo := []Tag{
		Tag{
			Key:   "tag_user_test_key_ca",
			Value: "test_value_ca",
		},
		Tag{
			Key:   "tag_user_test_key_cb",
			Value: "test_value_cb",
		},
		Tag{
			Key:   "tag_user_test_key_cc",
			Value: "test_value_cc",
		},
	}
	if !TagSlicesEqual(JustTags(resultThree.Tags), resultThreeCompareTo) {
		t.Errorf("Test Three Didn't Work:\n\n %+v\n\n %+v\n\n---------", JustTags(resultThree.Tags), resultThreeCompareTo)
	}
}

func CreateInstanceForTest(obj Result) {
	var thisResult Result
	db := PostgresConnectTest()

	db.Where(Result{
		ResourceIdentifier: obj.ResourceIdentifier,
	}).Set("gorm:association_autoupdate", false).Assign(obj).FirstOrCreate(&thisResult)
}

func JustTags(tags []Tag) []Tag {
	var retVal []Tag
	for _, tag := range tags {
		retVal = append(retVal, Tag{
			Key:   tag.Key,
			Value: tag.Value,
		})
	}
	return retVal
}

func PostgresConnectTest() *gorm.DB {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := "cloud_pricing_test"
	dbHost := "localhost"

	db, err := gorm.Open(
		"postgres",
		fmt.Sprintf("host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable", dbHost, dbUser, dbName, dbPass),
	)

	db.LogMode(false)

	if err != nil {
		fmt.Println(err)
		panic("failed to connect database")
	}

	return db
}

func TagSlicesEqual(a, b []Tag) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}
