package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/thecloudmasters/uesio/pkg/bundles"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/metadata"
	"github.com/thecloudmasters/uesio/pkg/middlewares"
	"github.com/thecloudmasters/uesio/pkg/sess"
)

func getRoute(r *http.Request, namespace, path, prefix string, session *sess.Session) (*metadata.Route, error) {
	var route metadata.Route
	var routes metadata.RouteCollection

	err := bundles.LoadAll(&routes, namespace, nil, session)
	if err != nil {
		return nil, err
	}

	router := mux.NewRouter()

	for _, item := range routes {
		router.Path(prefix + item.Path)
	}

	routematch := &mux.RouteMatch{}

	matched := router.Match(r, routematch)

	if !matched {
		// If we're the login route but we didn't find a match, return the uesio login page
		if path == "login" {
			site := session.GetSite()
			return &metadata.Route{
				ViewRef:   site.GetAppBundle().LoginRoute,
				Namespace: site.AppRef,
				Path:      path,
			}, nil
		}

		// If we're logged in return the not found page

		return nil, errors.New("No Route Match Found: " + path)
	}

	pathTemplate, err := routematch.Route.GetPathTemplate()
	if err != nil {
		return nil, errors.New("No Path Template For Route Found")
	}

	pathTemplate = strings.Replace(pathTemplate, prefix, "", 1)

	for _, item := range routes {
		if item.Path == pathTemplate {
			route = item
			break
		}
	}

	if &route == nil {
		return nil, errors.New("No Route Found in Cache")
	}

	// Cast the item to a route and add params
	route.Params = routematch.Vars
	route.Path = path

	return &route, nil
}

// RouteAPI is good
func RouteAPI(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	namespace := vars["namespace"]
	path := vars["route"]

	session := middlewares.GetSession(r)
	workspace := session.GetWorkspace()

	prefix := "/site/routes/" + namespace + "/"

	if workspace != nil {
		prefix = "/workspace/" + workspace.AppRef + "/" + workspace.Name + "/routes/" + namespace + "/"
	}

	route, err := getRoute(r, namespace, path, prefix, session)
	if err != nil {
		logger.LogErrorWithTrace(r, err)
		respondJSON(w, r, &RouteMergeData{
			ViewName:      "notfound",
			ViewNamespace: "uesio",
		})
		return
	}

	viewNamespace, viewName, err := metadata.ParseKey(route.ViewRef)
	if err != nil {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}

	respondJSON(w, r, &RouteMergeData{
		ViewName:      viewName,
		ViewNamespace: viewNamespace,
		Params:        route.Params,
		Namespace:     route.Namespace,
		Path:          path,
		Workspace:     GetWorkspaceMergeData(workspace),
	})

}

// RedirectToLogin function
func RedirectToLogin(w http.ResponseWriter, r *http.Request) {
	// TODO: This is special. NOTHING SPECIAL!
	redirectPath := "/login"
	if r.URL.Path != "" && r.URL.Path != "/" {
		redirectPath = redirectPath + "?r=" + r.URL.Path
	}
	http.Redirect(w, r, redirectPath, 302)
}

// ServeRoute serves a route
func ServeRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]
	path := vars["route"]

	session := middlewares.GetSession(r)
	workspace := session.GetWorkspace()

	prefix := "/app/" + namespace + "/"

	if workspace != nil {
		prefix = "/workspace/" + workspace.AppRef + "/" + workspace.Name + prefix
	}

	route, err := getRoute(r, namespace, path, prefix, session)
	if err != nil {
		logger.LogErrorWithTrace(r, err)
		RedirectToLogin(w, r)
		return
	}

	ExecuteIndexTemplate(w, route, false, session)
}

// ServeLocalRoute serves a route
func ServeLocalRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	path := vars["route"]

	session := middlewares.GetSession(r)
	site := session.GetSite()

	route, err := getRoute(r, site.AppRef, path, "/", session)
	if err != nil {
		logger.LogWithTrace(r, "Error Getting Route: "+err.Error(), logger.INFO)
		RedirectToLogin(w, r)
		return
	}

	ExecuteIndexTemplate(w, route, false, session)
}
