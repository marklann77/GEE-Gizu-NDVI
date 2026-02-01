# Gizu Region Vegetation Dynamics Monitor


## Overview
This project provides an automated, interactive dashboard for monitoring rangeland health in the Gizu region of Sudan. This tool leverages satellite time-series data to identify critical grazing windows and inter-annual variability.

## Demo / Example
* **Live App:** [Gizu Region NDVI Monitor](https://develop-gee-workshops.users.earthengine.app/view/gizu-region-ndvi)
* **Interactive Features:** Users can click any location on the map to generate a 2-year NDVI phenology chart, providing a high-resolution look at seasonal vegetation trends.

## Data Sources
* **Name/Description:** Sentinel-2 MSI: MultiSpectral Instrument, Level-2A (Harmonized).
* **Originator/Provider:** European Space Agency (ESA) via Google Earth Engine.
* **Date Accessed:** January 2026.
* **Spatial Resolution:** 10m to 20m, specifically chosen to capture sparse rangeland micro-vegetation.

## Data Processing and Methodology
This project utilizes a "data-first" approach to ensure technical rigor and reproducible outputs.

* **Software/Tools Used:** Google Earth Engine (GEE) JavaScript API.
* **Key Processing Steps:**
    * **Cloud Masking:** Implemented a `QA60` bitmasking function to ensure analysis only uses clear-sky pixels.
    * **NDVI Calculation:** Normalized Difference Vegetation Index calculated using NIR (B8) and Red (B4) bands.
    * **Quality Mosaic:** Employed a `.qualityMosaic('NDVI')` approach to capture peak biomass across the 2023–2025 period, highlighting the maximum biological potential of the rangeland.
    * **Interactive UI:** Built a custom sidebar and legend using the `ui.Panel` and `ui.Chart` libraries for real-time geospatial analysis.

## Setup & Usage
* **Prerequisites:** A Google Earth Engine account.
* **Execution:** 1.  Open the GEE Code Editor.
    2.  Paste the provided project script.
    3.  Hit **Run** to load the dashboard.
    4.  Use the **Map Tool** to click and analyze specific grazing corridors in Northern Sudan.

## Outputs
* **Peak Vegetation Layer:** A high-contrast visualization map designed for arid-context rangeland monitoring.
* **Phenology Charts:** Detailed temporal graphs representing "Start of Season" (SOS) and senescence, critical for understanding pastoralist migration patterns.

## Contact
* **Name:** Mark Lannaman
* **LinkedIn:** [https://www.linkedin.com/in/mark-lannaman-177551184/]
