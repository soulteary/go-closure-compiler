package glosure

import "strings"

const (
	LEVEL_WHITESPACE_ONLY        = "WHITESPACE_ONLY"
	LEVEL_SIMPLE_OPTIMIZATIONS   = "SIMPLE_OPTIMIZATIONS"
	LEVEL_ADVANCED_OPTIMIZATIONS = "ADVANCED_OPTIMIZATIONS"
)

func CheckUserInputCompilationLevel(level string) bool {
	switch strings.ToUpper(level) {
	case LEVEL_WHITESPACE_ONLY, LEVEL_SIMPLE_OPTIMIZATIONS, LEVEL_ADVANCED_OPTIMIZATIONS:
		return true
	default:
		return false
	}
}

const (
	WARN_LEVEL_QUIET   = "QUIET"
	WARN_LEVEL_DEFAULT = "DEFAULT"
	WARN_LEVEL_VERBOSE = "VERBOSE"
)

func CheckUserInputWarningLevel(level string) bool {
	switch strings.ToUpper(level) {
	case WARN_LEVEL_QUIET, WARN_LEVEL_DEFAULT, WARN_LEVEL_VERBOSE:
		return true
	default:
		return false
	}
}

const (
	FORMATTING_PRETTY_PRINT          = "pretty_print"
	FORMATTING_PRINT_INPUT_DELIMITER = "print_input_delimiter"
)

func CheckUserInputFormatting(level string) bool {
	switch strings.ToLower(level) {
	case FORMATTING_PRETTY_PRINT, FORMATTING_PRINT_INPUT_DELIMITER:
		return true
	default:
		return false
	}
}
