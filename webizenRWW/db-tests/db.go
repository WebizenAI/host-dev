// Lets Write a GoLang n3 Encoder

// Path: db-tests\db.go
// Compare this snippet from helix\account.go:
// }
//
// func NewUser() *User {
// 	return &User{}
// }
//
// func (c *Context) GetAccountHandler(w web.ResponseWriter, req *web.Request) {
// 	if len(c.User) == 0 {
// 		c.AuthenticationRequired(w, req)
// 	}
// }
//
// func (c *Context) LoginHandler(w web.ResponseWriter, req *web.Request) {
// 	ok, err := c.verifyPass(req.FormValue("username"), req.FormValue("password"))
// 	if err != nil {

// 		logger.Info().Msg("Login error: " + err.Error())
// 	}
// 	if !ok {
// 		c.AuthenticationRequired(w, req)
// 		return
// 	}
// 	user := req.FormValue("username")
//
// 	w.Header().Set("User", user)
//
// 	c.newAuthzToken(w, req.Request, user)
// }
//
// func (c *Context) LogoutHandler(w web.ResponseWriter, req *web.Request) {
// 	// delete session/cookie
// 	if len(c.User) == 0 {
// 		c.AuthenticationRequired(w, req)
// 		return

// 	}
// }
//
// func (c *Context) DeleteAccountHandler(w web.ResponseWriter, req *web.Request) {
// 	if len(c.User) == 0 {
// 		c.AuthenticationRequired(w, req)
// 		return
// 	}
// 	err := c.deleteUser(c.User)
// 	if err != nil {
// 		logger.Info().Msg("Error closing account for " + c.User + ":" + err.Error())
// 		w.WriteHeader(http.StatusInternalServerError)
// 		return
// 	}
// 	// also clean sessions, etc by logging user out
// }
