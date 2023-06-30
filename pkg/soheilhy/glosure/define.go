package glosure

type WarningClass string

const (
	AccessControls              = "accessControls"
	AmbiguousFunctionDecl       = "ambiguousFunctionDecl"  // new added
	CheckDebuggerStatement      = "checkDebuggerStatement" // new added
	CheckRegExp                 = "checkRegExp"
	CheckTypes                  = "checkTypes"
	CheckVars                   = "checkVars"
	ClosureDepMethodUsageChecks = "closureDepMethodUsageChecks" // new added
	ConformanceViolations       = "conformanceViolations"       // new added
	Const                       = "const"
	ConstantProperty            = "constantProperty"
	DeprecatedAnnotations       = "deprecatedAnnotations" // new added
	Deprecated                  = "deprecated"
	DuplicateMessage            = "duplicateMessage"
	Duplicate                   = "duplicate" // new added
	Es5Strict                   = "es5Strict"
	ExternsValidation           = "externsValidation"
	ExtraRequire                = "extraRequire" // new added
	GlobalThis                  = "globalThis"
	InvalidCasts                = "invalidCasts"
	MisplacedSuppress           = "misplacedSuppress" // new added
	MisplacedTypeAnnotation     = "misplacedTypeAnnotation"
	MissingGetCssName           = "missingGetCssName" // new added
	MissingProperties           = "missingProperties"
	MissingProvide              = "missingProvide"
	MissingRequire              = "missingRequire"
	MissingReturn               = "missingReturn"
	NewCheckTypes               = "newCheckTypes" // new added
	NonStandardJsDocs           = "nonStandardJsDocs"
	ReportUnknownTypes          = "reportUnknownTypes"
	StrictCheckTypes            = "strictCheckTypes"        // new added
	StrictMissingProperties     = "strictMissingProperties" // new added
	StrictModuleDepCheck        = "strictModuleDepCheck"
	StrictPrimitiveOperators    = "strictPrimitiveOperators" // new added
	SuspiciousCode              = "suspiciousCode"
	TweakValidation             = "tweakValidation" // new added
	TypeInvalidation            = "typeInvalidation"
	UndefinedNames              = "undefinedNames" // new added
	UndefinedVars               = "undefinedVars"
	UnknownDefines              = "unknownDefines"
	UnusedLocalVariables        = "unusedLocalVariables"   // new added
	UnusedPrivateMembers        = "unusedPrivateMembers"   // new added
	UntranspilableFeatures      = "untranspilableFeatures" // new added
	UselessCode                 = "uselessCode"
	ViolatedModuleDep           = "violatedModuleDep" // new added
	Visibility                  = "visibility"
)

// Compiler represents a contextual object for the closure compiler containing
// compilation options. To create a Compiler instance with default options use
// glosure.NewCompiler().
type Compiler struct {
	// Path containing all JavaScript sources.
	Root string

	// Path of Closure's "compiler.jar".
	CompilerJarPath string

	// Closure compiler compilation level. Valid levels are: WhiteSpaceOnly, SimpleOptimizations (default), AdvancedOptimizations.
	CompilationLevel string
	// Closure compiler warning level. Valid levels are: Quite, Default, and Verbose.
	WarningLevel string
	// Formatting of the compiled output. Valid formattings are: PrettyPrint, and PrintInputDelimiter.
	Formattings []string
	// Whether to optimize out all unused JavaScript code.
	OnlyClosureDependencies bool

	// List of exern JavaScript files.
	Externs []string
	// JavaScript files that should be included in every compilation.
	BaseFiles []string

	// Whether to perform an angular pass.
	AngularPass bool
	// Whether to process jQuery primitives.
	ProcessJqueryPrimitives bool

	// Warnings that should be treated as errors.
	CompErrors []WarningClass
	// Warnings.
	CompWarnings []WarningClass
	// Warnings that are suppressed.
	CompSuppressed []WarningClass
}
