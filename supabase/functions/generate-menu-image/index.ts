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

    console.log('Generating menu image with Gemini API...')
    console.log(`Original menu length: ${originalMenuText.length}`)
    console.log(`Updated menu length: ${updatedMenuText.length}`)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    // Create the prompt for Gemini
    const prompt = `Create a professional restaurant menu image. Replace the text content with this updated menu:

ORIGINAL MENU:
${originalMenuText}

UPDATED MENU TO REPLACE WITH:
${updatedMenuText}

${restaurantName ? `Restaurant Name: ${restaurantName}` : ''}

Please create a high-quality, professional restaurant menu image with elegant typography and design that displays the updated menu text clearly and beautifully. The image should look like a real restaurant menu with proper formatting, spacing, and visual appeal.`

    console.log('Sending request to Gemini API...')

    // Call Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt }
          ]
        }]
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`)
    }

    const geminiResult = await geminiResponse.json()
    console.log('Gemini API response received')

    // Extract the image data from the response
    if (!geminiResult.candidates || !geminiResult.candidates[0] || !geminiResult.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API')
    }

    const content = geminiResult.candidates[0].content
    if (!content.parts || content.parts.length === 0) {
      throw new Error('No content parts found in Gemini response')
    }

    // Look for image data in the response
    let imageData = null
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        imageData = part.inlineData.data
        break
      }
    }

    if (!imageData) {
      throw new Error('No image data found in Gemini response')
    }

    console.log('Image data extracted successfully')

    return new Response(
      JSON.stringify({
        success: true,
        imageData: imageData,
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
