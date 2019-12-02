package routes

import (
	"net/url"
	"strconv"
)

func readString(query url.Values, key string, stringDefault string) string {
	if len(query[key]) > 0 {
		return query[key][0]
	}
	return stringDefault
}

func readStringArray(query url.Values, key string, stringArrayDefault []string) []string {
	if len(query[key]) > 0 {
		return query[key]
	}
	return stringArrayDefault
}

func readInt(query url.Values, key string, intDefault int) int {
	if len(query[key]) > 0 {
		retVal, _ := strconv.Atoi(query[key][0])
		return retVal
	}
	return intDefault
}

func readBool(query url.Values, key string, boolDefault bool) bool {
	if len(query[key]) > 0 {
		b, _ := strconv.ParseBool(query[key][0])
		return b
	}
	return boolDefault
}
