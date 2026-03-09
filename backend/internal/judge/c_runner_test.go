package judge

import (
	"path/filepath"
	"strings"
	"testing"

	"github.com/mattbriggs04/bitforge/backend/internal/model"
)

func TestFormatRuntimeOutput(t *testing.T) {
	input := strings.Join([]string{
		"CASE|0|zero length copy|PASS",
		"CASE|1|basic 4 byte copy|FAIL",
		"SUMMARY|1|2",
	}, "\n")

	got := formatRuntimeOutput(input)
	want := strings.Join([]string{
		"CASE 0 | zero length copy | PASS",
		"CASE 1 | basic 4 byte copy | FAIL",
		"SUMMARY: 1/2",
	}, "\n")

	if got != want {
		t.Fatalf("unexpected formatted runtime output\nwant:\n%s\n\ngot:\n%s", want, got)
	}
}

func TestFormatCompileOutputSanitizesTempPaths(t *testing.T) {
	workingDir := filepath.Join("/tmp", "bitforge-judge", "abc123")
	sourcePath := filepath.Join(workingDir, "submission.c")
	input := sourcePath + ":14:20: error: expected ';' before '}' token"

	got := formatCompileOutput(input, sourcePath, workingDir)
	if strings.Contains(got, "/tmp/bitforge-judge/") {
		t.Fatalf("expected temp path to be removed, got: %s", got)
	}
	if !strings.Contains(got, "solution.c:14:20: error") {
		t.Fatalf("expected solution.c path, got: %s", got)
	}
}

func TestBuildHarnessAddsLineMapping(t *testing.T) {
	harness, err := buildHarness("int f(void) { return 0; }\n", []model.JudgeTestCase{
		{
			Name: "sample",
			Payload: map[string]any{
				"code": "case_passed = 1;",
			},
		},
	}, nil)
	if err != nil {
		t.Fatalf("buildHarness returned error: %v", err)
	}

	if !strings.Contains(harness, "#line 1 \"solution.c\"") {
		t.Fatalf("missing solution line mapping in harness")
	}
	if !strings.Contains(harness, "#line 1 \"harness.c\"") {
		t.Fatalf("missing harness line mapping in harness")
	}
}
