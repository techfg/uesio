package call

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/thecloudmasters/cli/pkg/config/host"
)

func Request(method, url string, body io.Reader, sessid string) (*http.Response, error) {

	host, err := host.GetHostPrompt()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, fmt.Sprintf("%s/%s", host, url), body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Cookie", "sessid="+sessid)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		data, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		resp.Body.Close()
		return nil, errors.New(string(data))
	}
	return resp, nil
}

func GetJSON(url, sessid string, response interface{}) error {
	resp, err := Request("GET", url, nil, sessid)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return json.NewDecoder(resp.Body).Decode(response)
}

func PostJSON(url, sessid string, request interface{}, response interface{}) error {

	payloadBytes := &bytes.Buffer{}

	err := json.NewEncoder(payloadBytes).Encode(request)
	if err != nil {
		return err
	}

	resp, err := Request("POST", url, payloadBytes, sessid)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return json.NewDecoder(resp.Body).Decode(response)

}