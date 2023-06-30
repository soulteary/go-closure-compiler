// Glosure is a convenient HTTP server for the Closure Compiler. It only
// responds to request for compiled JavaScript and returns error for any other
// requests.
//
// Note: To force a compile on a request, pass request parameter "force=1".
package glosure

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"github.com/golang/glog"
	"github.com/soheilhy/glosure/depgraph"
)

// Creates an http.Handler using the closure compiler.
func GlosureServer(cc Compiler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		ServeHttp(res, req, &cc)
	})
}

// Creates a glosure http handler for the given root directory.
func GlosureServerWithRoot(root string) http.Handler {
	return GlosureServer(NewCompiler(root))
}

func NewCompiler(root string) Compiler {
	return Compiler{
		Root:             root,
		ErrorHandler:     http.NotFound,
		CompiledSuffix:   DefaultCompiledSuffix,
		CompilationLevel: SimpleOptimizations,
		WarningLevel:     Default,
		SourceSuffix:     DefaultSourceSuffix,
		CompileOnDemand:  true,
		fileServer:       http.FileServer(http.Dir(root)),
		depg:             depgraph.New(),
		mutex:            sync.Mutex{},
	}
}

// Enables strict compilation. Almost all warnings are treated as errors.
func (cc *Compiler) Strict() {
	cc.WarningLevel = Verbose
	// All of warning classes, except the unknown type.
	cc.CompErrors = []WarningClass{
		AccessControls,
		CheckRegExp, CheckTypes, CheckVars, Const,
		ConstantProperty, Deprecated, DuplicateMessage, Es5Strict,
		ExternsValidation, GlobalThis,
		InvalidCasts, MisplacedTypeAnnotation, MissingProperties, MissingProvide,
		MissingRequire, MissingReturn, NonStandardJsDocs,
		SuspiciousCode, StrictModuleDepCheck, TypeInvalidation,
		UndefinedVars, UnknownDefines, UselessCode, Visibility,
	}
	cc.CompWarnings = []WarningClass{}
	cc.CompSuppressed = []WarningClass{}
}

// Enables options for debugger convenience.
func (cc *Compiler) Debug() {
	cc.WarningLevel = Verbose
	// All of warning classes, except the unknown type.
	cc.CompWarnings = []WarningClass{
		AccessControls,
		CheckRegExp, CheckTypes, CheckVars, Const,
		ConstantProperty, Deprecated, DuplicateMessage, Es5Strict,
		ExternsValidation, GlobalThis,
		InvalidCasts, MisplacedTypeAnnotation, MissingProperties, MissingProvide,
		MissingRequire, MissingReturn, NonStandardJsDocs,
		SuspiciousCode, StrictModuleDepCheck, TypeInvalidation,
		UndefinedVars, UnknownDefines, UselessCode, Visibility,
	}
	cc.CompErrors = []WarningClass{}
	cc.CompSuppressed = []WarningClass{}
	cc.Formatting = PrettyPrint
}

// Glosure's main handler function.
func ServeHttp(res http.ResponseWriter, req *http.Request, cc *Compiler) {
	path := req.URL.Path

	if !cc.isCompiledJavascript(path) {
		cc.ErrorHandler(res, req)
		return
	}

	if !cc.sourceFileExists(path) {
		cc.ErrorHandler(res, req)
		return
	}

	forceCompile := req.URL.Query().Get("force") == "1"
	if !cc.CompileOnDemand || (!forceCompile && cc.jsIsAlreadyCompiled(path)) {
		cc.fileServer.ServeHTTP(res, req)
		return
	}

	err := cc.Compile(path)
	if err != nil {
		cc.ErrorHandler(res, req)
		return
	}

	glog.Info("JavaScript source is successfully compiled: ", path)
	cc.fileServer.ServeHTTP(res, req)
}

func (cc *Compiler) isCompiledJavascript(path string) bool {
	return strings.HasSuffix(path, cc.CompiledSuffix)
}

func (cc *Compiler) isSourceJavascript(path string) bool {
	return strings.HasSuffix(path, cc.SourceSuffix) &&
		!strings.HasSuffix(path, cc.CompiledSuffix)
}

func (cc *Compiler) getSourceJavascriptPath(relPath string) string {
	return path.Join(cc.Root, relPath[:len(relPath)-len(cc.CompiledSuffix)]+
		cc.SourceSuffix)
}

func (cc *Compiler) getCompiledJavascriptPath(relPath string) string {
	if cc.isCompiledJavascript(relPath) {
		return path.Join(cc.Root, relPath)
	}

	return path.Join(cc.Root, relPath[:len(relPath)-len(cc.SourceSuffix)]+
		cc.CompiledSuffix)
}

func (cc *Compiler) sourceFileExists(path string) bool {
	srcPath := cc.getSourceJavascriptPath(path)
	_, err := os.Stat(srcPath)
	return err == nil
}

func (cc *Compiler) jsIsAlreadyCompiled(path string) bool {
	srcPath := cc.getSourceJavascriptPath(path)
	srcStat, err := os.Stat(srcPath)
	if err != nil {
		return false
	}

	outPath := cc.getCompiledJavascriptPath(path)
	outStat, err := os.Stat(outPath)
	if err != nil {
		return false
	}

	if outStat.ModTime().Before(srcStat.ModTime()) {
		return false
	}

	return true
}

func (cc *Compiler) Compile(relOutPath string) error {
	_, err := exec.LookPath("java")
	if err != nil {
		glog.Fatal("No java found in $PATH.")
	}

	if cc.CompilerJarPath == "" {
		glog.Fatal("download the closure compiler jar file from https://github.com/google/closure-compiler/tags and put it to js/__compiler__.jar .")
	}

	srcPath := cc.getSourceJavascriptPath(relOutPath)
	outPath := cc.getCompiledJavascriptPath(relOutPath)

	srcPkgs, err := getClosurePackage(srcPath)
	useClosureDeps := err == nil

	cc.mutex.Lock()
	defer cc.mutex.Unlock()

	jsFiles := make([]string, 0)
	if useClosureDeps {
		if len(cc.depg.Nodes) == 0 {
			cc.reloadDependencyGraph()
		}

		nodes := []*depgraph.Node{}
		for _, srcPkg := range srcPkgs {
			node, ok := cc.depg.Nodes[srcPkgs[0]]
			if !ok {
				return errors.New(fmt.Sprintf("Package %s not found in %s.", srcPkg,
					cc.Root))
			}
			nodes = append(nodes, node)
		}

		deps := cc.depg.GetDependencies(nodes)
		for _, dep := range deps {
			jsFiles = append(jsFiles, dep.Path)
		}
	} else {
		jsFiles = append(jsFiles, srcPath)
	}

	return cc.CompileWithClosureJar(jsFiles, srcPkgs, outPath)
}

func (cc *Compiler) CompileWithClosureJar(jsFiles []string, entryPkgs []string,
	outPath string) error {
	args := []string{"-jar", cc.CompilerJarPath}

	for _, b := range cc.BaseFiles {
		args = append(args, "--js", b)
	}

	for _, file := range jsFiles {
		args = append(args, "--js", file)
	}

	if len(entryPkgs) != 0 && cc.OnlyClosureDependencies {
		args = append(args,
			"--manage_closure_dependencies", "true",
			"--only_closure_dependencies", "true")

		for _, entryPkg := range entryPkgs {
			args = append(args, "--closure_entry_point", entryPkg)
		}
	}

	for _, e := range cc.Externs {
		args = append(args, "--externs", e)
	}

	args = append(args,
		"--js_output_file", outPath,
		"--compilation_level", string(cc.CompilationLevel),
		"--warning_level", string(cc.WarningLevel))

	if cc.AngularPass {
		args = append(args, "--angular_pass", "true")
	}

	if cc.ProcessJqueryPrimitives {
		args = append(args, "--process_jquery_primitives", "true")
	}

	for _, e := range cc.CompErrors {
		args = append(args, "--jscomp_error", string(e))
	}

	for _, e := range cc.CompWarnings {
		args = append(args, "--jscomp_warning", string(e))
	}

	for _, e := range cc.CompSuppressed {
		args = append(args, "--jscomp_off", string(e))
	}

	if cc.Formatting != "" {
		args = append(args, "--formatting", string(cc.Formatting))
	}

	cmd := exec.Command("java", args...)
	stdErr, err := cmd.StderrPipe()
	if err != nil {
		return errors.New("Cannot attach to stderr of the compiler.")
	}

	stdOut, err := cmd.StdoutPipe()
	if err != nil {
		return errors.New("Cannot attach to stdout of the compiler.")
	}

	err = cmd.Start()
	if err != nil {
		return errors.New("Cannot run the compiler.")
	}

	io.Copy(os.Stderr, stdErr)
	io.Copy(os.Stdout, stdOut)

	err = cmd.Wait()
	return err
}

func errAnchor(charNo int) string {
	indent := charNo - 1
	if indent < 0 {
		indent = 0
	}
	return strings.Repeat("-", int(indent)) + "^"
}

func concatContent(nodes []*depgraph.Node) string {
	var buffer bytes.Buffer
	for _, val := range nodes {
		content, err := ioutil.ReadFile(val.Path)
		if err != nil {
			// TODO(soheil): Should we simply ignore such errors?
			continue
		}
		buffer.Write(content)
	}
	return buffer.String()
}

func (cc *Compiler) reloadDependencyGraph() {
	// TODO(soheil): Here, we are loading the files twice. We can make it in one
	//               pass.
	filepath.Walk(cc.Root,
		func(path string, info os.FileInfo, err error) error {
			if !cc.isSourceJavascript(path) {
				return nil
			}

			pkgs, err := getClosurePackage(path)
			if err != nil {
				return nil
			}

			for _, pkg := range pkgs {
				glog.V(1).Info("Found package ", pkg, " in ", path)
				cc.depg.AddFile(pkg, path)
			}
			return nil
		})

	for _, node := range cc.depg.Nodes {
		deps, err := getClosureDependecies(node.Path)
		if err != nil || deps == nil {
			continue
		}
		for _, dep := range deps {
			glog.V(1).Info("Found dependency from ", node.Pkg, " to ", dep)
			cc.depg.AddDependency(node.Pkg, dep)
		}
	}
}

type ClosureApiResult struct {
	CompiledCode string
	Errors       []ClosureError   `json:"errors"`
	Warnings     []ClosureWarning `json:"warnings"`
	ServerErrors []struct {
		Code  int    `json:"code"`
		Error string `json:"error"`
	} `json:"serverErrors"`
}

type ClosureError struct {
	Charno    int
	Lineno    int
	File      string
	ErrorType string `json:"type"`
	Error     string
	Line      string
}

type ClosureWarning struct {
	Charno      int
	Lineno      int
	File        string
	WarningType string `json:"type"`
	Warning     string
	Line        string
}

var closureProvideRegex *regexp.Regexp
var closureRequireRegex *regexp.Regexp

func init() {
	re, err := regexp.Compile(`goog.provide\(['"](.*)['"]\).*;`)
	if err != nil {
		panic("Cannot compile closure provide regex.")
	}

	closureProvideRegex = re

	re, err = regexp.Compile(`goog.require\(['"](.*)['"]\).*;`)
	if err != nil {
		panic("Cannot compile closure require regex.")
	}

	closureRequireRegex = re
}

func getClosurePackage(path string) ([]string, error) {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	res := closureProvideRegex.FindAllStringSubmatch(string(content), -1)
	if len(res) == 0 || len(res[0]) != 2 {
		return nil, errors.New("No closure package found.")
	}

	pkgs := []string{}
	for _, match := range res {
		pkgs = append(pkgs, match[1])
	}
	return pkgs, nil
}

func getClosureDependecies(path string) ([]string, error) {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	matches := closureRequireRegex.FindAllStringSubmatch(string(content), -1)
	if len(matches) == 0 {
		return nil, nil
	}

	deps := make([]string, 0, len(matches))
	for _, m := range matches {
		deps = append(deps, m[1])
	}
	return deps, nil
}
