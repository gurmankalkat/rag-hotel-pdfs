## Overview 

The portal allows users to upload a PDF, process it with a custom extraction algorithm, and store the extracted data in Supabase. The extracted data is displayed on the portal for easy access. On hover, users can view explanations of the values or gain insight into how GPT-4o derived them.

The code includes a significant amount of placeholder or "dummy" content to illustrate what a fully functional dashboard could look like. Not all features are operational and these elements are included for showcasing purposes.

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

