package meta

import (
	"strconv"
	"strings"

	"golang.org/x/text/language"
)

type TranslationCollection []*Translation

func (tc *TranslationCollection) GetName() string {
	return "uesio/studio.translation"
}

func (tc *TranslationCollection) GetBundleFolderName() string {
	return "translations"
}

func (tc *TranslationCollection) GetFields() []string {
	return StandardGetFields(&Translation{})
}

func (tc *TranslationCollection) NewItem() Item {
	return &Translation{}
}

func (tc *TranslationCollection) AddItem(item Item) {
	*tc = append(*tc, item.(*Translation))
}

func (tc *TranslationCollection) GetItemFromPath(path string) (BundleableItem, bool) {

	lang := strings.TrimSuffix(path, ".yaml")

	_, err := language.ParseBase(lang)
	if err != nil {
		return nil, false
	}

	return &Translation{
		Language: lang,
	}, true
}

func (tc *TranslationCollection) FilterPath(path string, conditions BundleConditions) bool {
	if conditions == nil {
		return StandardPathFilter(path)
	}
	if len(conditions) != 1 {
		return false
	}

	requestedLanguage := conditions["uesio/studio.language"]
	language := strings.TrimSuffix(path, ".yaml")

	if requestedLanguage != language {
		// Ignore this file
		return false
	}
	return true
}

func (tc *TranslationCollection) GetItem(index int) Item {
	return (*tc)[index]
}

func (tc *TranslationCollection) Loop(iter GroupIterator) error {
	for index := range *tc {
		err := iter(tc.GetItem(index), strconv.Itoa(index))
		if err != nil {
			return err
		}
	}
	return nil
}

func (tc *TranslationCollection) Len() int {
	return len(*tc)
}

func (tc *TranslationCollection) GetItems() interface{} {
	return *tc
}
