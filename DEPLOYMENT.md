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

4. **Wait for deployment**:
   - Go to the **Actions** tab
   - The deployment workflow will run automatically
   - Once complete, your app will be live at:
     `https://YOUR_USERNAME.github.io/` (root domain deployment)

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Checks out the code
2. Installs Node.js and dependencies
3. Builds the production app (configured for root domain deployment)
4. Deploys to GitHub Pages

This happens automatically on every push to the `main` branch. The app deploys to the root of your GitHub Pages site (`https://YOUR_USERNAME.github.io/`).

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

No environment variables are required. The app is configured to deploy to the root domain by default.

## Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file in the `public/` folder with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

### Blank page or 404 errors

If you see a blank page after deployment:

1. **Check GitHub Pages is enabled**:
   - Go to Settings > Pages
   - Ensure "GitHub Actions" is selected as the source

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Common issues: incorrect base path, asset loading errors

3. **Verify deployment**:
   - Go to Actions tab
   - Check if the workflow completed successfully
   - Look for any error messages in the build logs

4. **Try force refresh**:
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - This clears the cache and reloads the page

### GitHub Actions fails
- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow has the correct permissions (in workflow file)
- Verify Node.js version compatibility (workflow uses Node 20)

### CSV conversion not working
- Check browser console for errors
- Ensure JavaScript is enabled in the browser
- Verify CSV file has proper headers and coordinate columns
