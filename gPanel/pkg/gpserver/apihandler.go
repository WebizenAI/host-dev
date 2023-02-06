// Package gpserver handles the logic of the gPanel server
package gpserver

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/kentonh/gPanel/pkg/api/bundle"
	logapi "github.com/kentonh/gPanel/pkg/api/log"
	"github.com/kentonh/gPanel/pkg/api/server"
	"github.com/kentonh/gPanel/pkg/api/user"
	"github.com/kentonh/gPanel/pkg/api/settings"
	"github.com/kentonh/gPanel/pkg/api/domain"
)

func (con *Controller) apiHandler(res http.ResponseWriter, req *http.Request) (bool, bool) {
	path := req.URL.Path[1:]
	if len(path) == 0 {
		path = (con.Directory + "index.html")
	} else {
		path = (con.Directory + path)
	}

	splitUrl := strings.SplitN(path, "api", 2)
	suspectApi := strings.ToLower(splitUrl[len(splitUrl)-1])

	if req.ContentLength > 0 {
		var bundleRequestData struct {
			BName string `json:"bundle_name,omitempty"`
		}

		buf, err := ioutil.ReadAll(req.Body)
		if err != nil {
			return false, false
		}

		b1 := ioutil.NopCloser(bytes.NewBuffer(buf))
		req.Body = ioutil.NopCloser(bytes.NewBuffer(buf))

		err = json.NewDecoder(b1).Decode(&bundleRequestData)
		if err != nil {
			return false, false
		}

		if specific, ok := con.Bundles[bundleRequestData.BName]; ok {
			switch suspectApi {
			case "/server/status":
				return true, server.Status(res, req, con.APILogger, specific.Public)
			case "/server/start":
				return true, server.Start(res, req, con.APILogger, specific.Public)
			case "/server/shutdown":
				return true, server.Shutdown(res, req, con.APILogger, specific.Public)
			case "/server/maintenance":
				return true, server.Maintenance(res, req, con.APILogger, specific.Public)
			case "/server/restart":
				return true, server.Restart(res, req, con.APILogger, specific.Public)
			case "/log/read":
				return true, logapi.Read(res, req, con.APILogger, specific.Directory)
			case "/log/truncate":
				return true, logapi.Truncate(res, req, con.APILogger, specific.Directory)
			case "/bundle/delete":
				return true, bundle.Delete(res, req, con.APILogger, con.Bundles, specific.Directory)
			default:
				return false, false
			}
		}
	}

	switch suspectApi {
	case "/user/auth":
		return true, user.Auth(res, req, con.APILogger, con.Directory)
	case "/user/register":
		return true, user.Register(res, req, con.APILogger, con.Directory)
	case "/user/logout":
		return true, user.Logout(res, req, con.APILogger, con.Directory)
	case "/user/list":
		return true, user.List(res, req, con.APILogger, con.Directory)
	case "/user/delete":
		return true, user.Delete(res, req, con.APILogger, con.Directory)
	case "/user/update_password":
		return true, user.UpdatePassword(res, req, con.APILogger, con.Directory)
	case "/bundle/create":
		return true, bundle.Create(res, req, con.APILogger, con.Bundles)
	case "/bundle/list":
		return true, bundle.List(res, req, con.APILogger, con.Bundles)
	case "/log/read":
		return true, logapi.Read(res, req, con.APILogger, con.Directory)
	case "/log/delete":
		return true, logapi.Truncate(res, req, con.APILogger, con.Directory)
	case "/settings/set_smtp":
		return true, settings.SetSMTP(res, req, con.APILogger)
	case "/settings/get_smtp":
		return true, settings.GetSMTP(res, req, con.APILogger)
	case "/settings/set_admin":
		return true, settings.SetAdmin(res, req, con.APILogger)
	case "/settings/get_admin":
		return true, settings.GetAdmin(res, req, con.APILogger)
	case "/settings/add_nameserver":
		return true, settings.AddNameserver(res, req, con.APILogger)
	case "/settings/get_nameservers":
		return true, settings.GetNameservers(res, req, con.APILogger)
	case "/settings/remove_nameserver":
		return true, settings.RemoveNameserver(res, req, con.APILogger)
	case "/domain/list":
		return true, domain.List(res, req, con.APILogger)
	case "/domain/unlink":
		return true, domain.Unlink(res, req, con.APILogger)
	default:
		return false, false
	}
}
