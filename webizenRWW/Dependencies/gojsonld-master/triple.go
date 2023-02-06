/*
	Copyright (c) 2012 Kier Davis

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	associated documentation files (the "Software"), to deal in the Software without restriction,
	including without limitation the rights to use, copy, modify, merge, publish, distribute,
	sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial
	portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
	NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
	OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

package gojsonld

import (
	"fmt"
)

// A Triple contains a subject, a predicate and an object term.
type Triple struct {
	Subject   Term
	Predicate Term
	Object    Term
}

// Function NewTriple returns a new triple with the given subject, predicate and object.
func NewTriple(subject Term, predicate Term, object Term) (triple *Triple) {
	return &Triple{
		Subject:   subject,
		Predicate: predicate,
		Object:    object,
	}
}

// Method String returns the NTriples representation of this triple.
func (triple Triple) String() (str string) {
	subj_str := "nil"
	if triple.Subject != nil {
		subj_str = triple.Subject.String()
	}

	pred_str := "nil"
	if triple.Predicate != nil {
		pred_str = triple.Predicate.String()
	}

	obj_str := "nil"
	if triple.Object != nil {
		obj_str = triple.Object.String()
	}

	return fmt.Sprintf("%s %s %s .", subj_str, pred_str, obj_str)
}

// Method Equal returns this triple is equivalent to the argument.
func (triple Triple) Equal(other *Triple) bool {
	return triple.Subject.Equal(other.Subject) &&
		triple.Predicate.Equal(other.Predicate) &&
		triple.Object.Equal(other.Object)
}
