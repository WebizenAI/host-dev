package main

import (
	"fmt"
	"github.com/coreos/bbolt"
	"unicode/utf8"
)

func main() {
	// Open a bbolt database
	db, _ := bbolt.Open("triples.db", 0600, nil)
	defer db.Close()

	// Add some triples to the database
	triples := []string{
		"<http://example.com/subject1> <http://example.com/predicate> \"object1\" .\n",
		"<http://example.com/subject2> <http://example.com/predicate> \"object2\" .\n",
	}

	db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("triples"))
		for _, triple := range triples {
			// Encode the triple using UTF-8
			encodedTriple := []byte(triple)
			if !utf8.Valid(encodedTriple) {
				return fmt.Errorf("Invalid UTF-8 encoding")
			}
			b.Put(encodedTriple, []byte(""))
		}
		return nil
	})

	// Retrieve all triples from the database
	db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("triples"))
		c := b.Cursor()

		for k, v := c.First(); k != nil; k, v = c.Next() {
			decodedTriple, _ := utf8.Decode(k)
			fmt.Printf("%s\n", string(decodedTriple))
			_ = v
		}
		return nil
	
	})
}