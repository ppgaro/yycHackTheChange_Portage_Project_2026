#!/usr/bin/env bash
# Re-download the AESO Historical Pool Price snapshots that RigToRack bundles.
# The app never calls AESO at runtime; it reads the CSVs in src/data/sources/aeso/raw/.
# Usage: bash scripts/fetch-aeso.sh
set -euo pipefail

base="http://ets.aeso.ca/ets_web/ip/Market/Reports/HistoricalPoolPriceReportServlet"
out="$(cd "$(dirname "$0")/.." && pwd)/src/data/sources/aeso/raw"
mkdir -p "$out"

fetch() {
	local mmddyyyy="$1" iso="$2"
	curl -sS -m 60 -o "$out/pool-price-$iso.csv" \
		"$base?beginDate=$mmddyyyy&endDate=$mmddyyyy&contentType=csv"
	printf 'saved %s\n' "$out/pool-price-$iso.csv"
}

fetch 01132024 2024-01-13
fetch 05162024 2024-05-16
