package glosure

import (
	"errors"
	"io"
	"log"
	"os"
	"os/exec"
)

func NewCompiler() Compiler {
	_, err := exec.LookPath("java")
	if err != nil {
		log.Fatal("No java found in $PATH.")
	}

	return Compiler{
		CompilationLevel: LEVEL_SIMPLE_OPTIMIZATIONS,
		WarningLevel:     WARN_LEVEL_DEFAULT,
		CompilerJarPath:  "./compiler.jar",
	}
}

func (cc *Compiler) SetCompilationLevel(level string) {
	cc.CompilationLevel = level
}

func (cc *Compiler) SetWarningLevel(level string) {
	cc.WarningLevel = level
}

func (cc *Compiler) SetFormattings(level string) {
	cc.Formattings = append(cc.Formattings, level)
}

func (cc *Compiler) Compile(srcPath string, outPath string) error {
	return cc.CompileWithClosureJar([]string{srcPath}, []string{}, outPath)
}

func (cc *Compiler) CompileWithClosureJar(jsFiles []string, entryPkgs []string, outPath string) error {
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

	if len(cc.Formattings) > 0 {
		for _, formatting := range cc.Formattings {
			args = append(args, "--formatting", string(formatting))
		}
	}

	cmd := exec.Command("java", args...)
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return errors.New("cannot attach to stderr of the compiler")
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return errors.New("cannot attach to stdout of the compiler")
	}

	err = cmd.Start()
	if err != nil {
		return errors.New("cannot run the compiler")
	}

	io.Copy(os.Stderr, stderr)
	io.Copy(os.Stdout, stdout)

	err = cmd.Wait()
	return err
}
