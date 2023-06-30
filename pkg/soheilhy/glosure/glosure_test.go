package glosure

import (
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
)

func TestGetClosureDependecies(t *testing.T) {
	deps, err := getClosureDependecies("./test_resources/pkg1.js")
	if err != nil {
		t.Error(err)
		return
	}
	if deps == nil || deps[0] != "pkg2" || deps[1] != "pkg3" {
		t.Error("Invalid dependecies loaded from javascript file: ", deps)
	}
}

func TestGetClosurePackage(t *testing.T) {
	pkgs, err := getClosurePackage("./test_resources/pkg1.js")
	if err != nil {
		t.Error(err)
		return
	}

	if len(pkgs) != 1 || pkgs[0] != "pkg1" {
		t.Error("Invalid package loaded from javascript file: ", pkgs)
	}
}

func TestCompilerJar(t *testing.T) {
	cc := NewCompiler("./test_resources")
	err := cc.Compile("pkg1.min.js")
	if err != nil {
		t.Error(err)
		return
	}

	_, err = ioutil.ReadFile("./test_resources/pkg1.min.js")
	if err != nil {
		t.Error(err)
	}
}

func Example() {
	// Parse the flags if you want to use glog.
	flag.Parse()

	// Creat a new compiler assuming javascript files are in "example/js".
	cc := NewCompiler("./example/js/")
	// Use strict mode for the closure compiler. All warnings are treated as
	// error.
	cc.Strict()
	// Or use debug mode.
	// cc.Debug()

	// Use advanced optimizations.
	cc.CompilationLevel = AdvancedOptimizations

	http.Handle("/", GlosureServer(cc))
	fmt.Println("Checkout http://localhost:8080/sample.min.js")
	http.ListenAndServe(":8080", nil)
}
