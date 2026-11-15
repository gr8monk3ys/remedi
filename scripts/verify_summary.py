#!/usr/bin/env python3
"""Turn a test runner's machine report into one VERIFY line.

    python3 scripts/verify_summary.py <stage> <report> [<report> ...]

Reports: JUnit XML (*.xml), Vitest/Jest JSON, or Playwright JSON. Several
reports for one stage are summed. Prints

    VERIFY stage=<name> tests=<total> passed=<n> failed=<n> skipped=<n>

and appends it to $GITHUB_STEP_SUMMARY when set. Exits non-zero if a report
is missing, unreadable, of an unknown shape, or holds zero tests, so evidence
can never be faked by a runner that silently ran nothing.
"""
import json
import os
import sys
import xml.etree.ElementTree as ET


def junit(path):
    cases = list(ET.parse(path).getroot().iter("testcase"))
    failed = sum(1 for c in cases if c.find("failure") is not None or c.find("error") is not None)
    skipped = sum(1 for c in cases if c.find("skipped") is not None)
    return len(cases), len(cases) - failed - skipped, failed, skipped


def from_json(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if "numTotalTests" in data:  # Vitest / Jest
        skipped = data.get("numPendingTests", 0) + data.get("numTodoTests", 0)
        return data["numTotalTests"], data["numPassedTests"], data["numFailedTests"], skipped
    if "stats" in data and "expected" in data["stats"]:  # Playwright
        s = data["stats"]
        passed = s["expected"] + s.get("flaky", 0)
        failed, skipped = s["unexpected"], s.get("skipped", 0)
        return passed + failed + skipped, passed, failed, skipped
    raise ValueError("unknown JSON report shape")


def main(argv):
    if len(argv) < 3:
        sys.exit(__doc__)
    stage, totals = argv[1], [0, 0, 0, 0]
    for path in argv[2:]:
        try:
            counts = junit(path) if path.endswith(".xml") else from_json(path)
        except Exception as e:  # any unreadable report fails the step
            sys.exit(f"verify_summary: cannot parse {path}: {e}")
        totals = [a + b for a, b in zip(totals, counts)]
    if totals[0] == 0:
        sys.exit(f"verify_summary: {stage} reported zero tests")
    line = "VERIFY stage={} tests={} passed={} failed={} skipped={}".format(stage, *totals)
    print(line)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(line + "\n\n")


if __name__ == "__main__":
    main(sys.argv)
