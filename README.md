## Overview 

A document intelligence portal for analyzing hotel proposal PDFs.

This project lets users upload hotel PDFs, run an extraction pipeline on the document, and view structured outputs in a dashboard. Extracted values are stored in Supabase, and users can hover over results to see explanations of what was extracted and how the model derived each value.

## What It Does

Hotel proposals are often long, inconsistent, and time-consuming to review manually. This project helps turn those PDFs into structured, searchable information.

With this portal, a user can:
- Upload a hotel proposal PDF
- Run an extraction process to identify key values
- Store extracted results in a database
- View totals and structured outputs in the UI
- Hover over values to see explanation details for how the result was generated

## Getting Started
1. Run `npm init -y`
2. Run `npm install`
3. From root directory, run `cd app/backend`
4. Start the Node.js backend
   
    ```
    node server.js
    ```
   * Should see `Server is running on http://localhost:5001` in terminal at this point.
5. In a new terminal tab, run `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) to see the portal

## How to Use
* Using the file upload button in the top right corner, users can upload PDFs <img width="55" alt="Screenshot 2024-11-26 at 3 11 19 AM" src="https://github.com/user-attachments/assets/1b35010e-755f-4a8a-8838-76d1e12ba4be">
* Once the file is uploaded, users can click **Generate Totals** to run the extraction algorithm
* On hover, users can view explanations of the values

## Note
* Uploading duplicate documents will cause the system/database to crash
* The extraction algorithm takes ~30-40 seconds to run

