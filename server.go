package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/golang/glog"
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

	http.Handle("/", http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		ServeHttp(res, req, &cc)
	}))

	fmt.Println("Checkout http://localhost:8080/sample.min.js?force=1")
	http.ListenAndServe(":8080", nil)
}

func getSourceJavascriptPath(relPath, root, compiledSuffix, sourceSuffix string) string {
	return path.Join(root, relPath[:len(relPath)-len(compiledSuffix)]+sourceSuffix)
}

func isCompiledJavascript(path, compiledSuffix string) bool {
	return strings.HasSuffix(path, compiledSuffix)
}

func getCompiledJavascriptPath(relPath, root, compiledSuffix, sourceSuffix string) string {
	if isCompiledJavascript(relPath, compiledSuffix) {
		return path.Join(root, relPath)
	}

	return path.Join(root, relPath[:len(relPath)-len(sourceSuffix)]+compiledSuffix)
}

func sourceFileExists(path, root, compiledSuffix, sourceSuffix string) bool {
	srcPath := getSourceJavascriptPath(path, root, compiledSuffix, sourceSuffix)
	_, err := os.Stat(srcPath)
	return err == nil
}

// Glosure's main handler function.
func ServeHttp(res http.ResponseWriter, req *http.Request, cc *glosure.Compiler) {
	path := req.URL.Path

	if !strings.HasSuffix(path, cc.CompiledSuffix) {
		cc.ErrorHandler(res, req)
		return
	}

	if !sourceFileExists(path, cc.Root, cc.CompiledSuffix, cc.SourceSuffix) {
		cc.ErrorHandler(res, req)
		return
	}

	forceCompile := req.URL.Query().Get("force") == "1"
	if !cc.CompileOnDemand || (!forceCompile && jsIsAlreadyCompiled(path, cc.Root, cc.CompiledSuffix, cc.SourceSuffix)) {
		http.FileServer(http.Dir(cc.Root)).ServeHTTP(res, req)
		return
	}

	srcPath := getSourceJavascriptPath(path, cc.Root, cc.CompiledSuffix, cc.SourceSuffix)
	outPath := getCompiledJavascriptPath(getSourceJavascriptPath(path, cc.Root, cc.CompiledSuffix, cc.SourceSuffix), cc.Root, cc.CompiledSuffix, cc.SourceSuffix)

	err := cc.Compile(path, srcPath, outPath)
	if err != nil {
		cc.ErrorHandler(res, req)
		return
	}

	glog.Info("JavaScript source is successfully compiled: ", path)
	http.FileServer(http.Dir(cc.Root)).ServeHTTP(res, req)
}

func jsIsAlreadyCompiled(path, root, compiledSuffix, sourceSuffix string) bool {
	srcPath := getSourceJavascriptPath(path, root, compiledSuffix, sourceSuffix)
	srcStat, err := os.Stat(srcPath)
	if err != nil {
		return false
	}

	outPath := getCompiledJavascriptPath(path, root, compiledSuffix, sourceSuffix)
	outStat, err := os.Stat(outPath)
	if err != nil {
		return false
	}

	if outStat.ModTime().Before(srcStat.ModTime()) {
		return false
	}

	return true
}
