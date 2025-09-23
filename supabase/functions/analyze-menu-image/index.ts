import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { fileData, fileName, fileType } = await req.json()

    if (!fileData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Extract text from image using GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this menu image. Return plain text only, preserving the structure and formatting as much as possible.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: fileData // This should be the full data URL
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const openaiResult = await response.json()
    const extractedText = openaiResult.choices?.[0]?.message?.content

    if (!extractedText) {
      throw new Error('No text extracted from image')
    }

    // Now analyze the extracted text using the existing menu analysis logic
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a restaurant menu analysis expert. Analyze the provided menu text and extract structured information about dishes, prices, and ingredients. Return a JSON object with the following structure:

{
  "dishes": [
    {
      "name": "Dish Name",
      "price": "Price as string",
      "description": "Description if available",
      "ingredients": ["ingredient1", "ingredient2"],
      "category": "Category name"
    }
  ],
  "categories": ["Category1", "Category2"],
  "summary": {
    "totalDishes": number,
    "priceRange": "min - max",
    "averagePrice": "average price"
  }
}

Be thorough and accurate in your analysis.`
          },
          {
            role: 'user',
            content: `Please analyze this menu text and extract all dishes with their prices, descriptions, and ingredients:\n\n${extractedText}`
          }
        ],
        max_tokens: 4000
      })
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.text()
      console.error('OpenAI analysis error:', errorData)
      throw new Error(`OpenAI analysis error: ${analysisResponse.status}`)
    }

    const analysisResult = await analysisResponse.json()
    const analysisText = analysisResult.choices?.[0]?.message?.content

    if (!analysisText) {
      throw new Error('Menu analysis failed')
    }

    // Parse the JSON response
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysisText)
    } catch (parseError) {
      console.error('Failed to parse analysis result:', analysisText)
      throw new Error('Failed to parse menu analysis result')
    }

    // Return the analysis result
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...parsedAnalysis,
          originalText: extractedText,
          fileName: fileName,
          fileType: fileType,
          analysisMethod: 'image_ocr'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-menu-image function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred while analyzing the menu image' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
