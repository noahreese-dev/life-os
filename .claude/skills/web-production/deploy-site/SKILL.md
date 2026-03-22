---
name: deploy-site
description: One-command website deployment — deploys HTML sites to Vercel, Netlify, or GitHub Pages with custom domain setup instructions and SSL
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Deploy Site — One-Command Website Deployment

You are deploying a built HTML website to a live URL. The goal is zero-friction deployment: one command, one URL back. The CEO or web-builder agent should be able to go from built HTML to live link in under 60 seconds.

## Invocation

`/deploy-site [file-or-directory] [platform: vercel|netlify|github-pages] [name: project-name] [domain: custom-domain]`

**Arguments:**
- `[file-or-directory]` -- Required. Path to the HTML file or directory to deploy.
- `[platform: ...]` -- Optional. Deployment platform. Defaults to `vercel` (already authenticated).
- `[name: project-name]` -- Optional. Project name for the deployment URL. Auto-generated from filename if not specified.
- `[domain: custom-domain]` -- Optional. Custom domain to configure after deployment.

**Examples:**
- `/deploy-site ./mikes-plumbing.html` -- Deploy single file to Vercel
- `/deploy-site ./site/ platform: netlify name: mikes-plumbing` -- Deploy directory to Netlify
- `/deploy-site ./bella-salon.html name: bella-salon domain: bellasalon.ca` -- Deploy with custom domain

## Steps

### 1. Prepare the Deployment

#### For a single HTML file:
1. Create a temporary deployment directory
2. Copy the HTML file as `index.html` into the directory
3. If the file references any local assets (images, CSS, JS), copy those too

```bash
# Create deploy directory
DEPLOY_DIR=$(mktemp -d)
PROJECT_NAME="[name or derived from filename]"

# Copy file as index.html
cp "[file-path]" "$DEPLOY_DIR/index.html"

# If there are local assets referenced
# cp -r ./assets "$DEPLOY_DIR/assets"
```

#### For a directory:
1. Verify `index.html` exists in the directory
2. Use the directory as-is for deployment

### 2. Deploy to Platform

#### Vercel (Preferred -- Already Authenticated)

```bash
# Deploy to Vercel
cd "$DEPLOY_DIR"
npx vercel --yes --name "$PROJECT_NAME"

# For production deployment (not just preview)
npx vercel --yes --name "$PROJECT_NAME" --prod
```

**Vercel deployment options:**
- `--yes` -- Skip confirmation prompts
- `--name` -- Set project name (becomes part of URL)
- `--prod` -- Deploy to production (not preview)
- `--token` -- Use specific token (if not already authenticated)

**Expected output:**
```
Vercel CLI 33.x.x
Deploying to project: mikes-plumbing
Production: https://mikes-plumbing.vercel.app
```

#### Netlify

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy to Netlify
cd "$DEPLOY_DIR"
npx netlify deploy --dir . --prod --site "$PROJECT_NAME"

# Or create new site and deploy
npx netlify deploy --dir . --prod
```

#### GitHub Pages

```bash
# Create a new repo or use existing
gh repo create "$PROJECT_NAME" --public --source . --push

# Enable GitHub Pages
gh api repos/[owner]/$PROJECT_NAME/pages -X POST -f source='{"branch":"main","path":"/"}'

# URL will be: https://[owner].github.io/$PROJECT_NAME
```

### 3. Verify Deployment

After deployment:
1. Extract the live URL from deployment output
2. Wait 5-10 seconds for propagation
3. Fetch the URL to verify it loads
4. Check HTTP status code (should be 200)
5. Verify the page title matches the HTML file

```bash
# Verify the deployment
LIVE_URL="[deployed URL]"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "DEPLOYED SUCCESSFULLY: $LIVE_URL"
else
  echo "DEPLOYMENT ISSUE: HTTP $HTTP_STATUS"
fi
```

### 4. Custom Domain Setup (if requested)

If a custom domain is specified, provide step-by-step instructions:

#### Vercel Custom Domain:
```bash
# Add custom domain
npx vercel domains add [domain] --project "$PROJECT_NAME"
```

**DNS Configuration:**
```
Type: CNAME
Name: www (or @ for apex)
Value: cname.vercel-dns.com
TTL: 3600
```

**For apex domain (e.g., bellasalon.ca):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### Netlify Custom Domain:
```
Type: CNAME
Name: www
Value: [site-name].netlify.app
TTL: 3600
```

#### SSL:
- Vercel: Automatic SSL via Let's Encrypt (no action needed)
- Netlify: Automatic SSL via Let's Encrypt (no action needed)
- GitHub Pages: Automatic SSL (enable in repo settings)

### 5. Post-Deployment

After successful deployment:
1. Clean up temporary directory
2. Return the live URL prominently
3. Generate a deployment record

```bash
# Cleanup
rm -rf "$DEPLOY_DIR"
```

## Output Format

```
## Deployment Complete

**URL**: [LIVE URL]
**Platform**: [Vercel/Netlify/GitHub Pages]
**Project**: [project name]
**Status**: LIVE
**Deployed**: [timestamp]

### Deployment Details
- Source: [file-path]
- File size: [X KB]
- Platform: [platform]
- Region: [auto/specific]

### URLs
- **Production**: [URL]
- **Preview**: [preview URL if applicable]
- **Dashboard**: [platform dashboard URL]

### Custom Domain (if applicable)
**Domain**: [domain]
**Status**: [Pending DNS / Active]

**DNS Records to Add:**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | [value] | 3600 |
| A | @ | [value] | 3600 |

**SSL**: Auto-provisioned (allow up to 24 hours)

### Next Steps
- [ ] Verify site loads at [URL]
- [ ] Test on mobile device
- [ ] Configure custom domain DNS (if applicable)
- [ ] Share URL in outreach email via /email-campaign
- [ ] Add URL to client project record

### Quick Share
Copy-paste for Telegram/email:
[Business Name] website is live: [URL]
```

## Redirect Rules (if needed)

If the site needs redirects (e.g., www to non-www):

#### Vercel (vercel.json):
```json
{
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

#### Netlify (_redirects file):
```
/old-page  /new-page  301
/*  /index.html  200
```

## Rules

- **One command, one URL.** The CEO types `/deploy-site file.html` and gets back a live URL. That is the entire interaction.
- **Vercel first.** It is already authenticated and works with zero config. Only use alternatives if specified.
- **Always verify.** Do not report a deployment as successful without confirming the URL returns HTTP 200.
- **Clean up.** Delete temporary directories after deployment. Do not leave artifacts.
- **Production by default.** Deploy to production, not preview. Preview URLs expire.
- **Report the URL prominently.** The live URL should be the FIRST thing in the output. Bold it. The CEO needs to copy-paste it immediately.
- **This completes the build pipeline.** After deployment, the URL feeds into `/email-campaign` for outreach. The pipeline is: build -> QA -> deploy -> email.
- **Security headers.** If deploying to Vercel or Netlify, include basic security headers (X-Frame-Options, X-Content-Type-Options).
