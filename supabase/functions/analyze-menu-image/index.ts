import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate profitization strategies for menu items
async function generateProfitizationStrategies(analysisResult: any): Promise<any[]> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not found')
  }

  try {
    console.log('Generating profitization strategies with GPT...')
    
    const menuItemsText = analysisResult.items.map((item: any) => 
      `${item.dishTitle} - ${item.price} (${item.category || 'Uncategorized'}) - Ingredients: ${(item.ingredients || []).join(', ')}`
    ).join('\n')

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a restaurant profit optimization expert. Analyze the menu and generate specific profitization strategies.

For each strategy, provide:
1. Strategy Type (e.g., "Up Price", "Premium Anchor Pricing", "Premium UpSell Add On", "Reframe Item", "Maximize Sides", "Set Menus", "Drop Low Performers", "Staff Training", "Drop Low Margin Dishes", "Prime Position High Margin", "Swap Ingredients", "Seasonal Options", "Wine Pairing", "Drinks Pairing", "Portion Control", "Hide Low Margin Dishes", "Maximize Starters", "Expand Drinks", "Add SocialTrend Dish", "Expand Desserts")

2. Action Instruction: Highly specific, actionable instruction under 15 words

3. Category: The menu category this applies to

4. Action: One of "Up price", "New Dish", "New Extra", "Reframe", "Remove Dish", "Staffing", "Ingredients", "Reposition", "New Combo"

5. Dish: The specific dish name

6. New Price: The suggested new price (number only, no $)

7. Why: Brief explanation under 10 words

8. Uplift Text: Specific profit uplift description in format "+X–Y% [type] profit" where type could be "plate", "menu-wide entrée profitability", "incremental profit on affected tables", "menu efficiency", "table profitability", "average order value", etc.

Return ONLY a valid JSON array with this structure:
[
  {
    "strategy": "Up Price",
    "actionInstruction": "Bucatini Cacio e Pepe ($24) → raise to $26",
    "category": "Two",
    "action": "Up price",
    "dish": "Bucatini Cacio e Pepe",
    "newPrice": 26,
    "why": "Perception of premium product, needs premium price",
    "upliftText": "+12–15% plate profit"
  }
]

IMPORTANT JSON RULES:
- Escape all quotes in strings (use \" for quotes within text)
- No trailing commas
- All strings must be properly quoted
- Use only double quotes, never single quotes
- Ensure all strings are properly terminated

Generate 15-20 diverse strategies covering different profitization techniques. Make uplift ranges realistic and specific to each strategy type.

IMPORTANT: Order the strategies by priority - put the most obvious and convenient strategies first (top 3 should be the easiest to implement with immediate impact). Order by:
1. Ease of implementation (immediate vs long-term)
2. Obviousness (clear pricing opportunities vs complex restructuring)
3. Convenience (simple changes vs major operational changes)

Prioritize strategies like "Up Price" for obvious underpriced items, "Premium UpSell Add On" for easy extras, and "Reframe Item" for simple positioning changes at the top.`
          },
          {
            role: 'user',
            content: `Analyze this restaurant menu and generate profitization strategies:\n\nMenu Items:\n${menuItemsText}\n\nCategories: ${analysisResult.categories.join(', ')}\n\nTotal Items: ${analysisResult.totalItems}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    })

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text()
      console.error('GPT strategies API error:', errorText)
      throw new Error(`GPT strategies API error: ${gptResponse.status}`)
    }

    const gptResult = await gptResponse.json()
    console.log('GPT strategies response:', gptResult)

    if (!gptResult.choices || !gptResult.choices[0] || !gptResult.choices[0].message) {
      throw new Error('Invalid GPT strategies response format')
    }

    const gptContent = gptResult.choices[0].message.content
    console.log('GPT strategies result:', gptContent)

    // Parse GPT response - handle markdown code blocks and sanitize JSON
    let strategies: any[]
    let jsonContent: string
    try {
      // Remove markdown code blocks if present
      jsonContent = gptContent.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Additional sanitization for common GPT JSON issues
      // Remove any trailing commas before closing braces/brackets
      jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1')
      
      // Log the content for debugging (first 500 chars)
      console.log('Strategies JSON content to parse (first 500 chars):', jsonContent.substring(0, 500))
      
      strategies = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse GPT strategies response:', parseError)
      console.error('Raw GPT strategies content (first 1000 chars):', gptContent.substring(0, 1000))
      console.error('Strategies JSON content that failed (first 1000 chars):', jsonContent.substring(0, 1000))
      throw new Error(`GPT returned invalid JSON for strategies: ${parseError.message}`)
    }

    // Validate the response structure
    if (!Array.isArray(strategies)) {
      throw new Error('GPT strategies response is not an array')
    }

    console.log(`Generated ${strategies.length} profitization strategies`)
    return strategies

  } catch (error) {
    console.error('Error generating profitization strategies:', error)
    
    // Return empty array if GPT fails
    return []
  }
}

serve(async (req) => {
  console.log('=== ANALYZE MENU IMAGE FUNCTION STARTED ===')
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
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
    console.log('Supabase client created successfully')

    console.log('Parsing request body...')
    // Get the request body
    const { fileData, fileName, fileType } = await req.json()
    console.log('Request body parsed:', {
      fileName: fileName,
      fileType: fileType,
      fileDataLength: fileData ? fileData.length : 0,
      fileDataPreview: fileData ? fileData.substring(0, 100) + '...' : 'null'
    })

    if (!fileData) {
      console.error('No file data provided in request')
      return new Response(
        JSON.stringify({ success: false, error: 'No file data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize OpenAI client
    console.log('Checking OpenAI API key...')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not found')
    }
    console.log('OpenAI API key found, length:', openaiApiKey.length)

    console.log('=== STEP 1: EXTRACTING TEXT FROM IMAGE ===')
    console.log('Calling OpenAI API for image text extraction...')
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
            role: 'system',
            content: 'You are an OCR and document-structure expert. Extract text verbatim from images and organize it cleanly without inventing content.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Task: Extract the text from the attached restaurant menu image and return it in two parts.

VERBATIM_TEXT

Transcribe all visible text exactly as written.

Preserve line breaks, capitalization, punctuation, currency symbols, and spacing as much as possible.

If a word/number is unreadable, write [unclear]. Do not guess.

STRUCTURED_JSON
Organize the menu into a JSON object with these fields (omit a field if not present):

{
  "restaurant_name": "",
  "hours": "",
  "contact": {"phone": "", "social": ""},
  "sections": [
    {
      "title": "BREAKFAST",
      "items": [
        {"name": "", "price": "", "description": ""}
      ]
    }
  ],
  "footer": ""
}


For each section (e.g., BREAKFAST, APPETIZER, MAIN COURSE, DESSERT, DRINKS), include every item with its name, price, and description if present.

Do not normalize prices or reword descriptions.

If a description is missing, use an empty string.

If a section header appears multiple times or is split, merge logically.`
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

    console.log('OpenAI API response status:', response.status)
    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    console.log('Parsing OpenAI API response...')
    const openaiResult = await response.json()
    console.log('OpenAI API response structure:', {
      hasChoices: !!openaiResult.choices,
      choicesLength: openaiResult.choices?.length || 0,
      hasMessage: !!openaiResult.choices?.[0]?.message,
      hasContent: !!openaiResult.choices?.[0]?.message?.content
    })
    
    const fullResponse = openaiResult.choices?.[0]?.message?.content
    console.log('Full response length:', fullResponse ? fullResponse.length : 0)
    console.log('Full response preview (first 200 chars):', fullResponse ? fullResponse.substring(0, 200) + '...' : 'null')

    if (!fullResponse) {
      console.error('No text extracted from image - fullResponse is empty')
      throw new Error('No text extracted from image')
    }

    console.log('=== STEP 2: PARSING RESPONSE ===')
    console.log('Extracting VERBATIM_TEXT and STRUCTURED_JSON sections...')
    // Parse the response to extract VERBATIM_TEXT and STRUCTURED_JSON
    const verbatimMatch = fullResponse.match(/VERBATIM_TEXT\s*\n(.*?)\n\s*STRUCTURED_JSON/s)
    const jsonMatch = fullResponse.match(/STRUCTURED_JSON\s*\n(.*?)$/s)
    
    console.log('Regex match results:', {
      verbatimMatchFound: !!verbatimMatch,
      jsonMatchFound: !!jsonMatch,
      verbatimLength: verbatimMatch ? verbatimMatch[1].length : 0,
      jsonLength: jsonMatch ? jsonMatch[1].length : 0
    })
    
    let extractedText = ''
    let structuredData: any = null
    
    if (verbatimMatch) {
      extractedText = verbatimMatch[1].trim()
      console.log('Extracted verbatim text length:', extractedText.length)
      console.log('Verbatim text preview:', extractedText.substring(0, 100) + '...')
    } else {
      console.log('No VERBATIM_TEXT section found')
    }
    
    if (jsonMatch) {
      console.log('Found STRUCTURED_JSON section, attempting to parse...')
      try {
        let jsonString = jsonMatch[1].trim()
        console.log('Raw JSON string length:', jsonString.length)
        console.log('Raw JSON preview:', jsonString.substring(0, 200) + '...')
        
        // Remove markdown code block formatting if present
        if (jsonString.startsWith('```json')) {
          console.log('Removing ```json markdown formatting')
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonString.startsWith('```')) {
          console.log('Removing ``` markdown formatting')
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        console.log('Cleaned JSON string length:', jsonString.length)
        console.log('Cleaned JSON preview:', jsonString.substring(0, 200) + '...')
        
        structuredData = JSON.parse(jsonString)
        console.log('Successfully parsed structured JSON:', {
          hasRestaurantName: !!structuredData.restaurant_name,
          sectionsCount: structuredData.sections?.length || 0,
          totalItems: structuredData.sections?.reduce((sum: number, section: any) => sum + (section.items?.length || 0), 0) || 0
        })
      } catch (parseError) {
        console.error('Failed to parse structured JSON:', jsonMatch[1])
        console.error('Parse error details:', parseError)
        // Fall back to extracting just the text
        extractedText = fullResponse
        console.log('Falling back to using full response as extracted text')
      }
    } else {
      console.log('No STRUCTURED_JSON section found')
    }
    
    // If we couldn't parse the structured format, fall back to the old analysis method
    if (!structuredData) {
      console.log('=== STEP 3: FALLBACK TEXT ANALYSIS ===')
      console.log('Structured data parsing failed, falling back to text analysis method')
      console.log('Extracted text length for analysis:', extractedText.length)
      
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
      try {
        structuredData = JSON.parse(analysisText)
      } catch (parseError) {
        console.error('Failed to parse analysis result:', analysisText)
        throw new Error('Failed to parse menu analysis result')
      }
    }
    
    console.log('=== STEP 4: DATA CONVERSION ===')
    console.log('Converting structured data to expected format...')
    // Convert the structured data to the expected format
    let parsedAnalysis
    if (structuredData && structuredData.sections) {
      console.log('Using structured data with sections:', structuredData.sections.length)
      // Convert from new structured format to expected format
      const dishes: any[] = []
      const categories: string[] = []
      
      structuredData.sections.forEach((section: any, index: number) => {
        console.log(`Processing section ${index + 1}: ${section.title} with ${section.items?.length || 0} items`)
        categories.push(section.title)
        section.items.forEach((item: any, itemIndex: number) => {
          console.log(`  Item ${itemIndex + 1}: ${item.name} - ${item.price}`)
          dishes.push({
            dishTitle: item.name,
            price: item.price,
            description: item.description || '',
            ingredients: [], // Will be populated by AI analysis if needed
            category: section.title
          })
        })
      })
      
      console.log('Data conversion completed:', {
        totalDishes: dishes.length,
        categoriesCount: categories.length,
        restaurantName: structuredData.restaurant_name || 'Unknown'
      })
      
      parsedAnalysis = {
        items: dishes, // Use 'items' to match expected format
        dishes, // Keep both for compatibility
        categories,
        totalItems: dishes.length,
        summary: {
          totalDishes: dishes.length,
          priceRange: '', // Will be calculated
          averagePrice: '' // Will be calculated
        },
        restaurantInfo: {
          name: structuredData.restaurant_name || '',
          hours: structuredData.hours || '',
          contact: structuredData.contact || {},
          footer: structuredData.footer || ''
        }
      }
    } else {
      console.log('Using data as-is (no sections structure)')
      // Use the data as-is if it's already in the expected format
      parsedAnalysis = structuredData || {}
    }

    // Add analysis date
    parsedAnalysis.analysisDate = new Date().toISOString()
    console.log(`Found ${parsedAnalysis.totalItems || parsedAnalysis.dishes?.length || 0} menu items in ${parsedAnalysis.categories?.length || 0} categories`)

    console.log('=== STEP 5: GENERATING PROFITIZATION STRATEGIES ===')
    console.log('Generating profitization strategies...')
    console.log('Items to analyze:', parsedAnalysis.items?.length || parsedAnalysis.dishes?.length || 0)
    
    const strategies = await generateProfitizationStrategies(parsedAnalysis)
    console.log('Strategies generation completed:', {
      strategiesCount: strategies.length || 0,
      strategiesPreview: strategies.slice(0, 2).map(s => ({ strategy: s.strategy, dish: s.dish }))
    })
    
    parsedAnalysis.strategies = strategies

    console.log('=== STEP 6: PREPARING RESPONSE ===')
    console.log('Preparing final response with:', {
      totalItems: parsedAnalysis.totalItems || parsedAnalysis.dishes?.length || 0,
      categoriesCount: parsedAnalysis.categories?.length || 0,
      strategiesCount: parsedAnalysis.strategies?.length || 0,
      hasOriginalText: !!extractedText,
      originalTextLength: extractedText.length,
      fileName: fileName,
      fileType: fileType
    })

    // Return the analysis result
    const responseData = {
      success: true,
      data: {
        ...parsedAnalysis,
        originalText: extractedText,
        fileName: fileName,
        fileType: fileType,
        analysisMethod: 'image_ocr'
      }
    }
    
    console.log('=== FUNCTION COMPLETED SUCCESSFULLY ===')
    console.log('Response data size:', JSON.stringify(responseData).length, 'characters')
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('=== FUNCTION ERROR ===')
    console.error('Error in analyze-menu-image function:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
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
