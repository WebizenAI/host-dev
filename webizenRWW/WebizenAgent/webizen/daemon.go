package main

import (
	"net/http"
	"os"

	"github.com/webizenai/webizen"
)

var (
	port   = os.Getenv("WEBIZEN_PORT")
	host   = os.Getenv("WEBIZEN_HOST")
	root   = os.Getenv("WEBIZEN_ROOT")
	static = os.Getenv("WEBIZEN_STATIC_DIR")
	debug  = os.Getenv("WEBIZEN_DEBUG")
	log    = os.Getenv("WEBIZEN_LOGGING")
	cert   = os.Getenv("WEBIZEN_CERT")
	key    = os.Getenv("WEBIZEN_KEY")
	hsts   = os.Getenv("WEBIZEN_HSTS")
	bolt   = os.Getenv("WEBIZEN_BOLT_PATH")
)

func main() {
	println("Starting server...")

	config := webizen.NewConfig()
	config.Port = port
	config.Hostname = host
	config.Root = root
	config.StaticDir = static
	config.Cert = cert
	config.Key = key
	config.BoltPath = bolt //check if this is a valid path it might be bbolt
	if len(debug) > 0 {
		config.Debug = true
	}
	if len(log) > 0 {
		config.Logging = true
	}
	if len(hsts) > 0 {
		config.HSTS = true
	}

	println("Listening on " + config.Hostname + ":" + config.Port)

	if len(config.BoltPath) > 0 {
		// Start Bolt
		err := config.StartBolt()
		if err != nil {
			println(err.Error())
			return
		}
		defer config.BoltDB.Close()
	}

	// prepare new handler
	handler := webizen.NewServer(config)
	// prepare server
	s := &http.Server{
		Addr:    ":" + config.Port,
		Handler: handler,
	}
	// set TLS config
	tlsCfg, err := webizen.NewTLSConfig(config.Cert, config.Key)
	if err != nil {
		println(err.Error())
		return
	}
	s.TLSConfig = tlsCfg
	// start server
	s.ListenAndServeTLS(config.Cert, config.Key)
}
