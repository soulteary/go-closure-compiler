package depgraph

import (
	"testing"
)

func TestNew(t *testing.T) {
	graph := New()
	if len(graph.Nodes) != 0 {
		t.Error("New dependecy graph is not empty.")
	}
}

func TestDependecy(t *testing.T) {
	graph := New()
	graph.AddFile("pkg1", "file1")
	graph.AddFile("pkg2", "file2")
	graph.AddFile("pkg3", "file3")

	directDependencies := [...]struct {
		From    string
		To      string
		IsValid bool
	}{
		{"pkg1", "pkg2", true},
		{"pkg2", "pkg3", true},
		{"pkg1", "pkg3", true},
		{"pkg3", "pkg2", false},
		{"pkg4", "pkg3", false},
	}

	for _, element := range directDependencies {
		err := graph.AddDependency(element.From, element.To)
		if element.IsValid && err != nil {
			t.Error("Cannot add a valid dependency: ", element.From, "->", element.To)
		}
		if !element.IsValid && err == nil {
			t.Error("Can add an invalid dependency: ", element.From, "->", element.To)
		}
	}

	recursiveDependencies := [...]struct {
		Pkg  string
		Deps []string
	}{
		{"pkg1", []string{"pkg3", "pkg2", "pkg1"}},
		{"pkg2", []string{"pkg3", "pkg2"}},
		{"pkg3", []string{"pkg3"}},
	}

	for _, element := range recursiveDependencies {
		deps := graph.GetDependenciesOfPackage(element.Pkg)
		for i, dep := range deps {
			if dep.Pkg != element.Deps[i] {
				t.Error("Wrong dependencies for package: ", element.Pkg, dep.Pkg,
					element.Deps[i])
			}
		}
	}
}
