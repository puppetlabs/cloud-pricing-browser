package cloudability

type TagList struct {
	Tags []Tag
}

func (tl *TagList) ReplaceTag(newTag Tag) {
	var retTags []Tag
	for _, iTag := range tl.Tags {
		if iTag.Key == newTag.Key {
			retTags = append(retTags, newTag)
		} else {
			retTags = append(retTags, iTag)
		}
	}

	tl.Tags = retTags
}
