package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"
)

type User struct {
	// fields for the User struct
}

type Users []User

var headscaleURL, headscaleAPIKey string
var headscaleUsers Users
var apiTestStatus string

func init() {
	headscaleURL = "localStorage.getItem('headscaleURL')"
	headscaleAPIKey = "localStorage.getItem('headscaleAPIKey')"
}

func getUsers() error {
	endpointURL := "/api/v1/namespace"
	req, err := http.NewRequest("GET", headscaleURL+endpointURL, nil)
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		apiTestStatus = "failed"
		return fmt.Errorf("failed to get users from Headscale")
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var data struct {
		Namespaces Users `json:"namespaces"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return err
	}

	headscaleUsers = data.Namespaces
	sort.Slice(headscaleUsers, func(i, j int) bool {
		// sort logic for the users
		return headscaleUsers[i].Name < headscaleUsers[j].Name
	})
	apiTestStatus = "succeeded"
	return nil
}

func editUser(currentUsername string, newUsername string) error {
	endpointURL := fmt.Sprintf("/api/v1/namespace/%s/rename/%s", currentUsername, newUsername)
	req, err := http.NewRequest("POST", headscaleURL+endpointURL, bytes.NewBuffer([]byte{}))
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to edit user %s", currentUsername)
	}

	return nil
}

func newAPIKey(APIKeyExpiration string) (string, error) {
	endpointURL := "/api/v1/apikey"
	req, err := http.NewRequest("POST", headscaleURL+endpointURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"expiration":"%s"}`, APIKeyExpiration))))
	if err != nil {
		return "", err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to create new api key")
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var data struct {
		APIKey string `json:"apiKey"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return "", err
	}
	return data.APIKey, nil
}

func init() {
	headscaleURL = "localStorage.getItem('headscaleURL')"
	headscaleAPIKey = "localStorage.getItem('headscaleAPIKey')"
}

func expireAPIKey(APIKeyPrefix string) error {
	endpointURL := "/api/v1/apikey/expire"
	req, err := http.NewRequest("POST", headscaleURL+endpointURL, bytes.NewBuffer([]byte(fmt.Sprintf(`{"prefix":"%s"}`, APIKeyPrefix))))
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to expire api key with prefix %s", APIKeyPrefix)
	}

	return nil
}

func updateTags(deviceID string, tags []string) error {
	endpointURL := fmt.Sprintf("/api/v1/machine/%s/tags", deviceID)
	req, err := http.NewRequest("POST", headscaleURL+endpointURL, bytes.NewBuffer([]byte(`{"tags":%s}`, json.Marshal(tags))))
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to update tags for device %s", deviceID)
	}

	return nil
}

func removeUser(currentUsername string) error {
	endpointURL := fmt.Sprintf("/api/v1/namespace/%s", currentUsername)
	req, err := http.NewRequest("DELETE", headscaleURL+endpointURL, nil)
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to remove user %s", currentUsername)
	}

	return nil
}

func newUser(newUsername string) error {
	endpointURL := "/api/v1/namespace"
	req, err := http.NewRequest("POST", headscaleURL+endpointURL, bytes.NewBuffer([]byte(`{"name":%s}`, strings.ToLower(newUsername))))
	if err != nil {
		return err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to create new user %s", newUsername)
	}

	return nil
}

func getDevices() ([]Device, error) {
	endpointURL := "/api/v1/machine"
	req, err := http.NewRequest("GET", headscaleURL+endpointURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch devices")
	}

	var devices []Device
	if err := json.NewDecoder(resp.Body).Decode(&devices); err != nil {
		return nil, err
	}

	return sortDevices(devices), nil
}

type User struct {
	// struct fields here
}

func getUsers() ([]User, error) {
	headscaleURL := "https://example.com"
	headscaleAPIKey := "abc123"

	endpointURL := "/api/v1/namespace"
	req, err := http.NewRequest("GET", headscaleURL+endpointURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+headscaleAPIKey)

	client := http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", res.StatusCode)
	}

	var headscaleUsers []User
	if err := json.NewDecoder(res.Body).Decode(&headscaleUsers); err != nil {
		return nil, err
	}

	// sort the users
	sort.Slice(headscaleUsers, func(i, j int) bool {
		return headscaleUsers[i].Name < headscaleUsers[j].Name
	})

	return headscaleUsers, nil
}
