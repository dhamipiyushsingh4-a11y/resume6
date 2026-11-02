# ResumeCraft — ATS Resume Builder

A responsive resume builder made with HTML, CSS and vanilla JavaScript. It includes four resume layouts, live preview, browser-local saving, print-to-PDF export, a local keyword-match ATS estimate, and a job-description-to-resume generator. The generator has an instant local mode and an optional Gemini AI mode.

## Run locally
1. Download and unzip this project.
2. Open `index.html` in a modern browser.
3. Enter your details, choose a template, paste a job description and click **Analyze my resume**.
4. Use **Generate my ATS resume** in the Job Description → Resume section to tailor your resume, then choose a template. Click **Download PDF**. In the print dialog choose **Save as PDF**, paper size **A4**, and enable background graphics if you want the Executive template's dark header.

No build tools or dependencies are required.

## Files
- `index.html` — page structure and form fields
- `styles.css` — responsive UI, resume templates and print styles
- `app.js` — live preview, local save, ATS estimate and optional Gemini request

## ATS checker notes
The built-in checker extracts frequently occurring terms from a job description and checks whether they appear in the resume text. Its score is a simple estimate, not a score from an employer's ATS. Different ATS products parse and rank resumes differently. A higher keyword score does not guarantee an interview. Add keywords only when they truthfully represent your experience.

## Optional Gemini AI suggestions
1. Create a Gemini API key in Google AI Studio.
2. Paste it into the **AI-powered analysis (optional)** field in the app.
3. Run the analysis while connected to the internet.

**Security warning:** This static version sends the key from the browser to Google's Gemini API. The key is not saved by this app, but browser-based keys can be inspected by the person using the page and may be exposed if you publish a shared public site. Do not use a private or billing-enabled production key this way. For a public production deployment, move the Gemini request to a server-side endpoint (for example, a Node.js backend or serverless function), store the key as a server environment variable, and add rate limiting and usage controls. GitHub Pages can host the static frontend but cannot run the backend.

## Publish with GitHub Pages
1. Sign in to GitHub and create a new public repository, for example `ats-resume-builder`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish. Your site URL will look like `https://YOUR-USERNAME.github.io/ats-resume-builder/`.

## Privacy
Resume details are saved only when the user clicks **Save in this browser**, using that browser's local storage. The app has no account system or database. If the optional AI feature is used, resume content and the job description are sent to the Gemini API for that request. Avoid entering sensitive information.


## Job description auto-generator
- **Instant generation** works without an API key. It prioritizes job-description terms already supported by your entered profile, updates the summary and reorders skills. It is a lightweight local tailoring helper, not generative AI.
- **AI generation** uses the optional Gemini API key to tailor the summary, skill ordering and wording from your entered profile. It is instructed not to invent candidate credentials or achievements.
- Always review generated content for accuracy before applying. A job description alone cannot establish your real education, work history, projects or skills; fill in your own profile first.
