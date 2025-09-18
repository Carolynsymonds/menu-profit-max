import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateImageRequest {
  originalMenuText: string;
  updatedMenuText: string;
  restaurantName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { originalMenuText, updatedMenuText, restaurantName }: GenerateImageRequest = await req.json()

    if (!originalMenuText || !updatedMenuText) {
      throw new Error('Both originalMenuText and updatedMenuText are required')
    }

    console.log('Generating menu image...')
    console.log(`Original menu length: ${originalMenuText.length}`)
    console.log(`Updated menu length: ${updatedMenuText.length}`)

    // Create a professional-looking menu image using SVG
    // This creates a high-quality, scalable menu that displays exactly the text provided
    const menuLines = updatedMenuText.split('\n').filter(line => line.trim())
    
    // Calculate dynamic height based on content
    const lineHeight = 35;
    const padding = 60;
    const minHeight = 400;
    const calculatedHeight = Math.max(minHeight, (menuLines.length * lineHeight) + (padding * 2));
    
    // Create SVG with proper menu formatting - only showing the provided text
    const svgContent = `
      <svg width="800" height="${calculatedHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="${calculatedHeight}" fill="url(#bg)" stroke="#e9ecef" stroke-width="2"/>
        
        <!-- Menu Content - Only the provided text, no added titles -->
        <g transform="translate(60, ${padding})">
          ${menuLines.map((line, index) => {
            const y = index * lineHeight;
            if (line.toUpperCase() === line && line.length < 20 && !line.includes('$')) {
              // Category header (uppercase, short, no price)
              return `<text x="0" y="${y}" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#8B4513">${line}</text>`;
            } else {
              // Menu item
              return `<text x="0" y="${y}" font-family="Arial, sans-serif" font-size="16" fill="#333">${line}</text>`;
            }
          }).join('')}
        </g>
        
        <!-- Decorative elements -->
        <circle cx="100" cy="50" r="3" fill="#8B4513"/>
        <circle cx="700" cy="50" r="3" fill="#8B4513"/>
        <circle cx="100" cy="${calculatedHeight - 50}" r="3" fill="#8B4513"/>
        <circle cx="700" cy="${calculatedHeight - 50}" r="3" fill="#8B4513"/>
      </svg>
    `

    // Convert SVG to data URL
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgContent)

    return new Response(
      JSON.stringify({
        success: true,
        imageData: dataUrl,
        message: 'Menu image generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating menu image:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred while generating the menu image'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
