#!/usr/bin/env python3
"""Turn a test runner's machine report into one VERIFY line.

    python3 scripts/verify_summary.py <stage> <report> [<report> ...]

Reports: JUnit XML (*.xml), Vitest/Jest JSON, or Playwright JSON. Several
reports for one stage are summed. Prints

    VERIFY stage=<name> tests=<total> passed=<n> failed=<n> skipped=<n>

and appends it to $GITHUB_STEP_SUMMARY when set. When $VERIFY_STAGE_DIR is set,
the counts and sorted IDs of passing tests are also written to $VERIFY_STAGE_DIR/<stage>.json for the
verify-report artifact. Exits non-zero if a report
is missing, unreadable, of an unknown shape, or holds zero tests, so evidence
can never be faked by a runner that silently ran nothing.
"""
import json
import os
import sys
import xml.etree.ElementTree as ET


def junit(path):
    """Counts plus IDs (<classname>::<name>) of the passing test cases."""
    cases = list(ET.parse(path).getroot().iter("testcase"))
    failed = sum(1 for c in cases if c.find("failure") is not None or c.find("error") is not None)
    skipped = sum(1 for c in cases if c.find("skipped") is not None)
    ids = {
        "{}::{}".format(c.get("classname", ""), c.get("name", ""))
        for c in cases
        if all(c.find(t) is None for t in ("failure", "error", "skipped"))
    }
    return (len(cases), len(cases) - failed - skipped, failed, skipped), ids


def from_json(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if "numTotalTests" in data:  # Vitest / Jest; ID: <file relative to cwd>::<fullName>
        skipped = data.get("numPendingTests", 0) + data.get("numTodoTests", 0)
        ids = set()
        for f in data.get("testResults", []):
            rel = os.path.relpath(f.get("name") or f.get("testFilePath") or "")
            for a in f.get("assertionResults", []):
                if a.get("status") == "passed":
                    name = a.get("fullName") or " ".join(a.get("ancestorTitles", []) + [a.get("title", "")])
                    ids.add(rel + "::" + name)
        return (data["numTotalTests"], data["numPassedTests"], data["numFailedTests"], skipped), ids
    if "stats" in data and "expected" in data["stats"]:  # Playwright; ID: <file>::<title path>
        s = data["stats"]
        passed = s["expected"] + s.get("flaky", 0)
        failed, skipped = s["unexpected"], s.get("skipped", 0)
        ids = set()

        def walk(suite, path):
            for spec in suite.get("specs", []):
                if any(t.get("status") in ("expected", "flaky") for t in spec.get("tests", [])):
                    ids.add("{}::{}".format(spec.get("file", ""), " > ".join(path + [spec["title"]])))
            for child in suite.get("suites", []):
                walk(child, path + [child.get("title", "")])

        for file_suite in data.get("suites", []):  # top-level suite title is the file itself
            walk(file_suite, [])
        return (passed + failed + skipped, passed, failed, skipped), ids
    raise ValueError("unknown JSON report shape")


def main(argv):
    if len(argv) < 3:
        sys.exit(__doc__)
    stage, totals, passed_ids = argv[1], [0, 0, 0, 0], set()
    for path in argv[2:]:
        try:
            counts, ids = junit(path) if path.endswith(".xml") else from_json(path)
        except Exception as e:  # any unreadable report fails the step
            sys.exit(f"verify_summary: cannot parse {path}: {e}")
        totals = [a + b for a, b in zip(totals, counts)]
        passed_ids |= ids
    if totals[0] == 0:
        sys.exit(f"verify_summary: {stage} reported zero tests")
    line = "VERIFY stage={} tests={} passed={} failed={} skipped={}".format(stage, *totals)
    print(line)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(line + "\n\n")
    stage_dir = os.environ.get("VERIFY_STAGE_DIR")
    if stage_dir:
        os.makedirs(stage_dir, exist_ok=True)
        keys = ("tests", "passed", "failed", "skipped")
        with open(os.path.join(stage_dir, stage + ".json"), "w", encoding="utf-8") as f:
            json.dump({"stage": stage, **dict(zip(keys, totals)), "passed_ids": sorted(passed_ids)}, f)
            f.write("\n")


if __name__ == "__main__":
    main(sys.argv)
