package settings

import (
	"log"
	"net/http"
	"strconv"
	"strings"
)

func BundleName(res http.ResponseWriter, req *http.Request, logger *log.Logger, dir string) bool {
	if req.Method != "GET" {
		logger.Println(req.URL.Path + "::" + req.Method + "::" + strconv.Itoa(http.StatusNotFound) + "::" + http.StatusText(http.StatusMethodNotAllowed))
		http.Error(res, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return false
	}

	dir = strings.Replace(dir, "bundles/", "", 1)
	dir = strings.Replace(dir, "/", "", 1)

	res.WriteHeader(http.StatusOK)
	res.Write([]byte(dir))
	return true
}
