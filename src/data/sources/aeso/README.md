# AESO data snapshots used by RigToRack

These files are unmodified downloads of the AESO **Historical Pool Price** report.

| File | Report day | Downloaded (UTC) |
|---|---|---|
| `raw/pool-price-2024-01-13.csv` | Saturday 13 January 2024 | 2026-11-07T20:27Z |
| `raw/pool-price-2024-05-16.csv` | Thursday 16 May 2024 | 2026-11-07T20:27Z |

- **Publisher:** Alberta Electric System Operator (AESO), Energy Trading System public reports.
- **Report URL pattern:** `http://ets.aeso.ca/ets_web/ip/Market/Reports/HistoricalPoolPriceReportServlet?beginDate=MMDDYYYY&endDate=MMDDYYYY&contentType=csv`
- **Reporting index:** https://www.aeso.ca/market/market-and-system-reporting/
- **Columns:** `Date (HE)` = date and hour ending (HE01–HE24) in Alberta clock time (MST in January, MDT in May). `Price ($)` = hourly pool price in $/MWh. `30Ravg ($)` = 30-day rolling average pool price in $/MWh. `AIL Demand (MW)` = Alberta Internal Load in MW.
- **Re-download:** `bash scripts/fetch-aeso.sh`

## Limitations

- Price and demand only. There is no generation by fuel, intertie flow, outage or grid-alert data here, so this data cannot explain *why* prices moved.
- Pool price is the wholesale price. It is not a household or business electricity bill.
- In 2024 the pool price was bounded by a $0.00/MWh floor and a $999.99/MWh cap.
- Hour-ending labels follow AESO's convention: HE18 covers 17:00–18:00 local time.
- Use is subject to AESO's terms of use for published market data.
