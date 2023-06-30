package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/soheilhy/glosure"
)

// To see all logs from the server, run this file as:
//
//	go run server.go --logtostderr -v=1
func main() {
	debug := flag.Bool("debug", false, "run the compiler in debug mode.")
	advanced := flag.Bool("advanced", false, "use advanced optimizations.")

	// Parse the flags if you want to use glog.
	flag.Parse()

	// Creat a new compiler.
	cc := glosure.NewCompiler("./js/")
	if *debug {
		cc.Debug()
	} else {
		// Use strict mode for the closure compiler. All warnings are treated as
		// error.
		cc.Strict()
	}

	if *advanced {
		// Use advanced optimizations.
		cc.CompilationLevel = glosure.AdvancedOptimizations
	}

	http.Handle("/", glosure.GlosureServer(cc))
	fmt.Println("Checkout http://localhost:8080/sample.min.js?force=1")
	http.ListenAndServe(":8080", nil)
}
