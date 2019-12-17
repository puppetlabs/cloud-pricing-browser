package cloudability

import (
	"fmt"

	"github.com/jinzhu/gorm"
)

func tagsContain(tags []Tag, key string) bool {
	for _, tag := range tags {
		if tag.Key == key {
			return true
		}
	}

	return false
}

func GetTagKeysAndValues() []UniqueTag {
	var tags []UniqueTag
	// db, err := gorm.Open("sqlite3", "test.db")
	db := PostgresConnect()
	db.Find(&tags)
	return tags
}

type Tagger struct {
	DB *gorm.DB
}

func (t *Tagger) ConnectToDB() {
	t.DB = PostgresConnect()
}

func (t *Tagger) InstanceByResourceID(resourceID string) Result {
	var result Result
	t.DB.Where("resource_identifier = ?", resourceID).Preload("Tags").First(&result)
	return result
}

func (t *Tagger) TagObject(result Result, key string, value string) Tag {
	tag := Tag{
		Key:      fmt.Sprintf("tag_user_%s", key),
		Value:    value,
		ResultID: result.ID,
	}

	return tag
}

func tagID(tags []Tag, key string) uint {
	for _, tag := range tags {
		if tag.Key == key {
			return tag.ID
		}
	}
	return 0
}

func (t *Tagger) TagInstance(resourceID string, key string, value string) {
	instance := t.InstanceByResourceID(resourceID)
	tag := t.TagObject(instance, key, value)

	var tagList TagList

	// t.DB.Model(&instance).Association("Tags").Find(&tagList.Tags)
	tagList.Tags = instance.Tags

	if tagsContain(tagList.Tags, tag.Key) {
		tagID := tagID(instance.Tags, tag.Key)
		var tagToUpdate Tag
		if tagID != 0 {
			t.DB.Where("id = ?", tagID).First(&tagToUpdate)
			tagToUpdate.Value = tag.Value
			t.DB.Save(&tagToUpdate)
		}
	} else {
		t.DB.Model(&instance).Association("Tags").Append(tag)
	}

}
