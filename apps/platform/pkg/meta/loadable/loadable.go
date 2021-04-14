package loadable

// Group interface
type Group interface {
	GetItem(index int) Item
	Loop(iter func(item Item) error) error
	Len() int
	NewItem() Item
	GetItems() interface{}
	Slice(start int, end int)
	Filter(iter func(item Item) (bool, error)) error
}

// Item interface
type Item interface {
	SetField(string, interface{}) error
	GetField(string) (interface{}, error)
	Loop(iter func(string, interface{}) error) error
}
