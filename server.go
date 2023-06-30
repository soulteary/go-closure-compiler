package main

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soheilhy/glosure"
)

const OUTPUT_BASE_DIR = "temp"
const DEFAULT_OUTPUT_FILE_NAME = "default.js"

var (
	INPUT_DIR  = filepath.Join(OUTPUT_BASE_DIR, "file")
	OUTPUT_DIR = filepath.Join(OUTPUT_BASE_DIR, "output")
)

const (
	ERROR_REQUEST_PARAMETER = "Request parameter error"
	ERROR_COMPILATION_LEVEL = "Compilation level error"
	ERROR_WARNING_LEVEL     = "Warning level error"
)

type Options struct {
	OutputFormat     string   `form:"output_format"`
	OutputInfo       []string `form:"output_info"`
	CompilationLevel string   `form:"compilation_level"`
	WarningLevel     string   `form:"warning_level"`
	OutputFileName   string   `form:"output_file_name"`
	Formatting       []string `form:"formatting"`
	Code             string   `form:"js_code"`
}

type ResponseStats struct {
	OriginalSize       int     `json:"originalSize"`
	OriginalGzipSize   int     `json:"originalGzipSize"`
	CompressedSize     int     `json:"compressedSize"`
	CompressedGzipSize int     `json:"compressedGzipSize"`
	CompileTime        float64 `json:"compileTime"`
}

type ResponseError struct {
	Type   string `json:"type"`
	File   string `json:"file"`
	LineNo int    `json:"lineno"`
	CharNo int    `json:"charno"`
	Error  string `json:"error"`
	Line   string `json:"line"`
}

type Response struct {
	CompiledCode   string          `json:"compiledCode"`
	Statistics     ResponseStats   `json:"statistics"`
	Errors         []ResponseError `json:"errors",omitempty`
	OutputFilePath string          `json:"outputFilePath"`
}

func GetGzipSize(input string) int {
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)

	if _, err := gz.Write([]byte(input)); err != nil {
		fmt.Println("gzip写入失败:", err)
		return 0
	}

	if err := gz.Close(); err != nil {
		fmt.Println("gzip关闭失败:", err)
		return 0
	}
	return buf.Len()
}

func main() {
	os.MkdirAll(INPUT_DIR, os.ModePerm)
	os.MkdirAll(OUTPUT_DIR, os.ModePerm)

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		buf, err := os.ReadFile("./public/index.html")
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", buf)
	})

	r.Static("/assets", "./public/assets")
	r.Static("/code", OUTPUT_DIR)

	r.POST("/compile", func(c *gin.Context) {
		err := c.Request.ParseForm()
		if err != nil {
			c.String(http.StatusBadRequest, ERROR_REQUEST_PARAMETER)
			return
		}

		options := Options{
			OutputFormat:     c.Request.Form.Get("output_format"),
			OutputInfo:       c.Request.Form["output_info"],
			CompilationLevel: c.Request.Form.Get("compilation_level"),
			WarningLevel:     c.Request.Form.Get("warning_level"),
			OutputFileName:   c.Request.Form.Get("output_file_name"),
			Code:             c.Request.Form.Get("js_code"),
			Formatting:       c.Request.Form["formatting"],
		}

		cc := glosure.NewCompiler()

		if !glosure.CheckUserInputCompilationLevel(options.CompilationLevel) {
			c.String(http.StatusBadRequest, ERROR_COMPILATION_LEVEL)
			return
		}
		cc.SetCompilationLevel(options.CompilationLevel)

		if !glosure.CheckUserInputWarningLevel(options.WarningLevel) {
			c.String(http.StatusBadRequest, ERROR_WARNING_LEVEL)
			return
		}
		cc.SetWarningLevel(options.WarningLevel)

		if len(options.Formatting) > 0 {
			for _, format := range options.Formatting {
				cc.SetFormattings(format)
			}
		}

		shouldCompileCode := false
		shouldShowWarnings := false
		shouldShowErrors := false
		shouldShowStatistics := false

		for _, info := range options.OutputInfo {
			fmt.Println(info)
			switch info {
			case "compiled_code":
				shouldCompileCode = true
			case "warnings":
				shouldShowWarnings = true
			case "errors":
				shouldShowErrors = true
			case "statistics":
				shouldShowStatistics = true
			}
		}

		if !shouldCompileCode {
			c.String(http.StatusBadRequest, ERROR_REQUEST_PARAMETER)
			return
		}

		inputFile := filepath.Join(INPUT_DIR, DEFAULT_OUTPUT_FILE_NAME)
		os.WriteFile(inputFile, []byte(options.Code), os.ModePerm)
		outputFile := filepath.Join(OUTPUT_DIR, options.OutputFileName)

		fmt.Println(options)
		fmt.Println()

		startTime := time.Now()

		err = cc.Compile(inputFile, outputFile)
		if err != nil {
			response := Response{CompiledCode: "", OutputFilePath: strings.Replace(outputFile, OUTPUT_DIR, "/code", 1)}

			if shouldShowStatistics {
				response.Statistics = ResponseStats{
					OriginalSize:       len(options.Code),
					OriginalGzipSize:   GetGzipSize(options.Code),
					CompressedSize:     0,
					CompressedGzipSize: 20,
					CompileTime:        1,
				}
			}
			// TODO parsing the error message
			// temp/file/default.js:2:10: ERROR - [JSC_PARSE_ERROR] Parse error. Semi-colon expected
			// 2| funct1ion hello(name) {
			// fmt.Println(err.Error())
			// response.Errors = []ResponseError{}

			fmt.Println(cc.CompErrors)
			fmt.Println()
			fmt.Println()
			fmt.Println()
			fmt.Println()
			fmt.Println()

			c.JSON(http.StatusOK, response)
			return
		}

		buf, err := os.ReadFile(outputFile)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		result := string(buf)

		response := Response{CompiledCode: result, OutputFilePath: strings.Replace(outputFile, OUTPUT_DIR, "/code", 1)}

		time := time.Since(startTime).Seconds()
		if shouldShowStatistics {
			response.Statistics = ResponseStats{
				OriginalSize:       len(options.Code),
				OriginalGzipSize:   GetGzipSize(options.Code),
				CompressedSize:     len(result),
				CompressedGzipSize: GetGzipSize(result),
				CompileTime:        math.Floor(time),
			}
		}

		fmt.Println(shouldShowWarnings, shouldShowErrors)
		c.JSON(http.StatusOK, response)
	})

	r.Run()
}
