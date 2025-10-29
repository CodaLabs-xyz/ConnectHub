# Farcaster Mini App Configuration

This project is configured as a Farcaster Mini App with proper splash screen handling and SDK initialization.

## Configuration Files

### 1. Environment Variables (.env)

Add these variables to your `.env` file:

```bash
# Required: Your app's public URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your App Name

# Farcaster Mini App Assets (recommended)
NEXT_PUBLIC_APP_ICON_URL=https://your-domain.com/icon.png
NEXT_PUBLIC_APP_IMAGE_URL=https://your-domain.com/og-image.png
NEXT_PUBLIC_APP_SPLASH_URL=https://your-domain.com/splash.png
NEXT_PUBLIC_APP_SPLASH_BG_COLOR=#1e40af
```

### 2. Manifest File

The Farcaster manifest is automatically served at `/.well-known/farcaster.json` via an API route.

It includes:
- **name**: Your app name
- **version**: API version (currently "1")
- **iconUrl**: App icon (recommended 200x200px)
- **homeUrl**: Your app's home URL
- **imageUrl**: Preview image for social sharing
- **buttonTitle**: Text shown on the launch button
- **splashImageUrl**: Splash screen image
- **splashBackgroundColor**: Splash screen background color

### 3. Image Assets

Create and place these images in your `public/` directory or host them externally:

- **icon.png** (200x200px): App icon shown in Farcaster
- **og-image.png** (1200x630px): Open Graph image for sharing
- **splash.png** (varies): Splash screen image shown while loading

Recommended splash image specs:
- Minimum resolution: 400x400px
- Aspect ratio: Match your app's main view
- Format: PNG with transparency or solid background
- Keep file size < 500KB for fast loading

## SDK Initialization

The app uses the `SdkInitializer` component to properly handle the Farcaster splash screen:

### How it works:

1. **DOM Ready Delay** (500ms): Ensures the DOM is fully loaded before initialization
2. **Context Retrieval**: Gets Farcaster SDK context with 2s timeout
3. **Environment Validation**: Checks if running inside Farcaster Mini App
4. **ready() Call**: Signals to Farcaster that the app is ready to display
5. **Fallback Timeout** (3s): Forces ready state if SDK calls timeout

### Key Features:

- ✅ Comprehensive logging for debugging
- ✅ Timeout handling to prevent infinite loading
- ✅ Environment detection (Farcaster vs browser)
- ✅ Error recovery and graceful degradation

## Testing

### Local Testing

1. Run your app locally:
   ```bash
   npm run dev
   ```

2. Use Warpcast's Mini App Debug Tool (desktop only)
   - Must be logged into Warpcast
   - Navigate to your local URL
   - Verify splash screen appears and dismisses

### Production Testing

1. Deploy your app to a public URL
2. Update environment variables with production URLs
3. Test the manifest:
   ```
   curl https://your-domain.com/.well-known/farcaster.json
   ```
4. Share your Mini App in Farcaster

## Troubleshooting

### Splash screen doesn't dismiss

**Possible causes:**
- `sdk.actions.ready()` is not being called
- Network timeout preventing SDK initialization
- JavaScript errors blocking execution

**Solutions:**
- Check browser console for errors
- Verify SDK initialization logs
- Ensure all required scripts are loaded

### Manifest not found (404)

**Possible causes:**
- API route not deployed correctly
- Environment variables not set

**Solutions:**
- Verify `app/.well-known/farcaster.json/route.ts` exists
- Check deployment logs
- Test manifest URL directly

### Images not loading

**Possible causes:**
- Incorrect URLs in environment variables
- CORS issues with external hosting
- Files not deployed to public directory

**Solutions:**
- Verify image URLs are accessible
- Check CORS headers if using external hosting
- Ensure images are in `public/` directory

## Best Practices

1. **Call ready() as soon as possible**: Don't wait for data fetching
2. **Use skeleton states**: Show layout placeholders while loading data
3. **Optimize images**: Compress images to reduce load time
4. **Test thoroughly**: Test on actual Farcaster clients, not just browsers
5. **Monitor performance**: Use PageSpeed Insights to optimize load times

## Resources

- [Farcaster Mini App Docs](https://miniapps.farcaster.xyz/docs)
- [SDK Reference](https://miniapps.farcaster.xyz/docs/reference/sdk)
- [Loading Guide](https://miniapps.farcaster.xyz/docs/guides/loading)
