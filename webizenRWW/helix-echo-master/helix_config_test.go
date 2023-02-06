package helix

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_Conf_NewConfig(t *testing.T) {
	conf := NewHelixConfig()
	assert.Equal(t, "8443", conf.Port)
	assert.Equal(t, "test_cert.pem", conf.Cert)
	assert.Equal(t, "test_key.pem", conf.Key)
}

func Test_Conf_LoadJSONFile(t *testing.T) {
	file := "test_conf.json"
	conf := NewHelixConfig()
	// fail to load inexisting file
	conf = NewHelixConfig()
	err := conf.LoadJSONFile(file)
	assert.Error(t, err)
	// change some config value
	conf.Port = "8888"
	data, err := json.Marshal(conf)
	assert.NoError(t, err)
	// write file
	err = ioutil.WriteFile(file, data, 0644)
	assert.NoError(t, err)
	// read file
	conf = NewHelixConfig()
	err = conf.LoadJSONFile(file)
	assert.NoError(t, err)
	assert.Equal(t, "8888", conf.Port)
	// Cleanup
	err = os.Remove(file)
	assert.NoError(t, err)
}

func Test_Conf_GetCurrentRoot(t *testing.T) {
	root := GetCurrentRoot()
	assert.NotEmpty(t, root)
}
