// Package gpaccount handles the logic of the gPanel account server
package gpaccount

import (
	"net/http"
	"strings"

	"github.com/kentonh/gPanel/pkg/api/domain"
	"github.com/kentonh/gPanel/pkg/api/ip"
	logapi "github.com/kentonh/gPanel/pkg/api/log"
	"github.com/kentonh/gPanel/pkg/api/server"
	"github.com/kentonh/gPanel/pkg/api/settings"
	"github.com/kentonh/gPanel/pkg/api/ssh"
	"github.com/kentonh/gPanel/pkg/api/subdomain"
	"github.com/kentonh/gPanel/pkg/api/user"
)

func (con *Controller) apiHandler(res http.ResponseWriter, req *http.Request) (bool, bool) {
	path := req.URL.Path[1:]
	if len(path) == 0 {
		path = con.Directory + "index.html"
	} else {
		path = con.Directory + path
	}

	splitUrl := strings.SplitN(path, "api", 2)
	suspectApi := strings.ToLower(splitUrl[len(splitUrl)-1])

	switch suspectApi {
	case "/settings/name":
		return true, settings.BundleName(res, req, con.APILogger, con.Directory)
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
	case "/server/status":
		return true, server.Status(res, req, con.APILogger, con.Public)
	case "/server/start":
		return true, server.Start(res, req, con.APILogger, con.Public)
	case "/server/shutdown":
		return true, server.Shutdown(res, req, con.APILogger, con.Public)
	case "/server/restart":
		return true, server.Restart(res, req, con.APILogger, con.Public)
	case "/server/maintenance":
		return true, server.Maintenance(res, req, con.APILogger, con.Public)
	case "/log/read":
		return true, logapi.Read(res, req, con.APILogger, "/home/"+con.Name+"/")
	case "/log/delete":
		return true, logapi.Truncate(res, req, con.APILogger, "/home/"+con.Name+"/")
	case "/ip/list":
		return true, ip.List(res, req, con.APILogger, con.Directory)
	case "/ip/filter":
		return true, ip.Filter(res, req, con.APILogger, con.Directory)
	case "/ip/unfilter":
		return true, ip.Unfilter(res, req, con.APILogger, con.Directory)
	case "/domain/list":
		return true, domain.List(res, req, con.APILogger)
	case "/domain/link":
		return true, domain.Link(res, req, con.APILogger, con.Public.Port)
	case "/domain/unlink":
		return true, domain.Unlink(res, req, con.APILogger)
	case "/settings/get_nameservers":
		return true, settings.GetNameservers(res, req, con.APILogger)
	case "/ssh/addkey":
		return true, ssh.AddKey(res, req, con.APILogger)
	case "/ssh/deletekey":
		return true, ssh.DeleteKey(res, req, con.APILogger)
	case "/ssh/getkeys":
		return true, ssh.GetKeys(res, req, con.APILogger)
	case "/subdomain/list":
		return true, subdomain.List(res, req, con.APILogger, con.Directory)
	case "/subdomain/add":
		return true, subdomain.Add(res, req, con.APILogger, con.Directory)
	case "/subdomain/remove":
		return true, subdomain.Remove(res, req, con.APILogger, con.Directory)
	default:
		return false, false
	}
}
