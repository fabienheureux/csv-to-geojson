# Deployment Guide

## Quick Start

1. **Test locally**:
   ```bash
   cd csv-geojson-converter
   npm install
   npm run dev
   ```
   Visit `http://localhost:5173` and test with the included `sample.csv` file.

2. **Create GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CSV to GeoJSON converter"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Configure GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Update configuration** (if needed):
   - If your repository name is NOT `csv-to-geojson`, edit `vite.config.js`:
     ```javascript
     base: '/YOUR_REPO_NAME/',
     ```
   - Commit and push the change:
     ```bash
     git add vite.config.js
     git commit -m "Update base path"
     git push
     ```

5. **Wait for deployment**:
   - Go to the **Actions** tab
   - The deployment workflow will run automatically
   - Once complete, your app will be live at:
     `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Checks out the code
2. Installs Node.js and dependencies
3. Builds the production app
4. Deploys to GitHub Pages

This happens automatically on every push to the `main` branch.

## Manual Deployment

If you prefer to deploy to another hosting service:

```bash
npm run build
```

Then upload the contents of the `dist/` folder to:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository or use Vercel CLI
- **Any static host**: Upload `dist` folder contents via FTP/SSH

## Environment Variables

This app doesn't require any environment variables. Everything runs client-side.

## Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file in the `public/` folder with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

### App loads but shows 404 errors
- Check that the `base` path in `vite.config.js` matches your repository name

### GitHub Actions fails
- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow has the correct permissions

### CSV conversion not working
- Check browser console for errors
- Ensure JavaScript is enabled in the browser
- Verify CSV file has proper headers and coordinate columns
