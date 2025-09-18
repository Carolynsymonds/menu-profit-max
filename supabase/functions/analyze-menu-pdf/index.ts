import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MenuItem {
  dishTitle: string;
  ingredients: string[];
  price: string;
  category?: string;
}

interface ProfitizationStrategy {
  strategy: string;
  actionInstruction: string;
  category: string;
  action: string;
  dish: string;
  newPrice?: number;
  why: string;
}

interface AnalysisResult {
  items: MenuItem[];
  categories: string[];
  totalItems: number;
  analysisDate: string;
  strategies?: ProfitizationStrategy[];
}
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileData, fileName } = await req.json()

    if (!fileData) {
      throw new Error('No file data provided')
    }

    console.log(`Processing file: ${fileName || 'unnamed'}`)
    console.log(`File data length: ${fileData.length} characters`)
    
    // Extract text from PDF using real PDF parsing
    const extractedText = await extractTextFromPDF(fileData)
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('No readable text found in PDF. Please ensure the PDF contains text-based content.')
    }
    
    console.log(`Extracted text length: ${extractedText.length} characters`)
    
    // Analyze the text to extract menu items
    const analysisResult = await analyzeMenuText(extractedText)
    
    if (analysisResult.items.length === 0) {
      throw new Error('No menu items found in the PDF. Please ensure the PDF contains a restaurant menu with prices.')
    }

    console.log(`Analysis complete: ${analysisResult.totalItems} items found`)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...analysisResult,
          originalText: extractedText
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error analyzing PDF:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred while analyzing the PDF'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function extractTextFromPDF(fileData: string): Promise<string> {
  try {
    console.log('Converting PDF to text using ConvertAPI...')
    
    // Convert base64 string to Uint8Array
    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Create FormData for ConvertAPI
    const formData = new FormData()
    const blob = new Blob([bytes], { type: 'application/pdf' })
    formData.append('File', blob, 'menu.pdf')
    formData.append('StoreFile', 'true')
    
    console.log(`Sending PDF to ConvertAPI (${bytes.length} bytes)...`)
    
    // Call ConvertAPI to convert PDF to text
    const convertResponse = await fetch('https://v2.convertapi.com/convert/pdf/to/txt', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer M4N0bKpliaxcAU8g6i5m1s20OxKFqzCJ'
      },
      body: formData
    })
    
    if (!convertResponse.ok) {
      const errorText = await convertResponse.text()
      console.error('ConvertAPI error response:', errorText)
      throw new Error(`ConvertAPI error: ${convertResponse.status} ${convertResponse.statusText}`)
    }
    
    const convertResult = await convertResponse.json()
    console.log('ConvertAPI response:', convertResult)
    
    if (!convertResult.Files || convertResult.Files.length === 0) {
      throw new Error('No files returned from ConvertAPI')
    }
    
    // Get the text file URL
    const textFile = convertResult.Files[0]
    const textUrl = textFile.Url
    
    console.log(`Fetching text content from: ${textUrl}`)
    
    // Fetch the extracted text content
    const textResponse = await fetch(textUrl)
    
    if (!textResponse.ok) {
      throw new Error(`Failed to fetch text content: ${textResponse.status} ${textResponse.statusText}`)
    }
    
    const extractedText = await textResponse.text()
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('No readable text extracted from PDF')
    }
    
    console.log(`Successfully extracted text: ${extractedText.length} characters`)
    console.log('Sample text:', extractedText.substring(0, 200) + '...')
    
    return extractedText.trim()
    
  } catch (error) {
    console.error('Error extracting text from PDF using ConvertAPI:', error)
    throw new Error(`PDF text extraction failed: ${error.message}`)
  }
}

async function analyzeMenuText(text: string): Promise<AnalysisResult> {
  console.log('Analyzing menu text with GPT:', text.substring(0, 500) + '...')
  
  try {
    // Send text to GPT for intelligent analysis
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a restaurant menu analyzer. Extract all menu items from the provided text and return them in a structured JSON format.

For each menu item, identify:
1. dishTitle: The name of the dish
2. ingredients: Array of main ingredients (extract 3-5 key ingredients)
3. price: The price in $X.XX format
4. category: The menu category (Appetizers, Main Courses, Desserts, etc.)

Return ONLY a valid JSON object with this structure:
{
  "items": [
    {
      "dishTitle": "Dish Name",
      "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
      "price": "$12.99",
      "category": "Category Name"
    }
  ],
  "categories": ["Category1", "Category2"],
  "totalItems": 5
}

If no menu items are found, return: {"items": [], "categories": [], "totalItems": 0}`
          },
          {
            role: 'user',
            content: `Analyze this restaurant menu text and extract all menu items:\n\n${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text()
      console.error('GPT API error:', errorText)
      throw new Error(`GPT API error: ${gptResponse.status}`)
    }

    const gptResult = await gptResponse.json()
    console.log('GPT response:', gptResult)

    if (!gptResult.choices || !gptResult.choices[0] || !gptResult.choices[0].message) {
      throw new Error('Invalid GPT response format')
    }

    const gptContent = gptResult.choices[0].message.content
    console.log('GPT analysis result:', gptContent)

    // Parse GPT response - handle markdown code blocks
    let analysisResult: AnalysisResult
    try {
      // Remove markdown code blocks if present
      let jsonContent = gptContent.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      analysisResult = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError)
      console.error('Raw GPT content:', gptContent)
      throw new Error('GPT returned invalid JSON')
    }

    // Validate the response structure
    if (!analysisResult.items || !Array.isArray(analysisResult.items)) {
      throw new Error('GPT response missing items array')
    }

    // Add analysis date
    analysisResult.analysisDate = new Date().toISOString()

        console.log(`GPT found ${analysisResult.totalItems} menu items in ${analysisResult.categories?.length || 0} categories`)

        // Generate profitization strategies
        const strategies = await generateProfitizationStrategies(analysisResult)
        analysisResult.strategies = strategies

        return analysisResult

  } catch (error) {
    console.error('Error analyzing menu with GPT:', error)
    
    // Fallback to basic regex analysis if GPT fails
    console.log('Falling back to basic text analysis...')
    return await basicMenuAnalysis(text)
  }
}

async function basicMenuAnalysis(text: string): Promise<AnalysisResult> {
  console.log('Performing basic menu analysis...')
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const items: MenuItem[] = []
  const categories: string[] = []
  let currentCategory = ''

  for (const line of lines) {
    // Skip empty lines and very short lines
    if (line.length < 3) continue

    // Check if line is a category header
    const categoryPatterns = [
      /^[A-Z\s]+$/,  // All caps
      /^[A-Z][a-z\s]+$/,  // Title case
      /^[A-Z][a-z\s]*[A-Z][a-z\s]*$/,  // Mixed case like "Main Courses"
    ]

    const isCategory = categoryPatterns.some(pattern =>
      pattern.test(line) &&
      !line.includes('$') &&
      !line.includes('.') &&
      line.length > 3 &&
      line.length < 50
    )

    if (isCategory) {
      currentCategory = line.trim()
      if (!categories.includes(currentCategory)) {
        categories.push(currentCategory)
      }
      continue
    }

    // Look for price patterns: $X.XX, $X, X.XX, etc.
    const pricePatterns = [
      /\$(\d+\.?\d*)$/,  // $12.99
      /\$(\d+)$/,        // $12
      /(\d+\.\d{2})$/,   // 12.99
      /(\d+\.\d{1})$/,   // 12.9
      /(\d+)$/,          // 12
    ]

    let priceMatch: RegExpMatchArray | null = null
    let price = ''

    for (const pattern of pricePatterns) {
      const match = line.match(pattern)
      if (match) {
        priceMatch = match
        price = match[0]
        break
      }
    }

    if (priceMatch) {
      const dishPart = line.replace(price, '').trim()

      // Skip if dish part is too short or looks like a category
      if (dishPart.length < 3) continue

      // Extract dish title and ingredients
      let dishTitle = dishPart
      let ingredients: string[] = []

      // Try different separators for ingredients
      const separators = [' - ', ' – ', ' — ', ' | ', ' • ', ' * ']

      for (const separator of separators) {
        if (dishPart.includes(separator)) {
          const parts = dishPart.split(separator)
          dishTitle = parts[0].trim()
          const ingredientsText = parts.slice(1).join(separator).trim()

          if (ingredientsText) {
            // Split ingredients by common delimiters
            ingredients = ingredientsText
              .split(/[,;]/)
              .map(ing => ing.trim())
              .filter(ing => ing.length > 0)
          }
          break
        }
      }

      // Clean up dish title
      dishTitle = dishTitle.replace(/[^\w\s\-'&]/g, '').trim()

      // Skip if dish title is still too short
      if (dishTitle.length < 2) continue

      items.push({
        dishTitle,
        ingredients,
        price: price.startsWith('$') ? price : `$${price}`,
        category: currentCategory || 'Uncategorized'
      })
    }
  }

  console.log(`Basic analysis found ${items.length} menu items in ${categories.length} categories`)

  return {
    items,
    categories,
    totalItems: items.length,
    analysisDate: new Date().toISOString()
  }
}

async function generateProfitizationStrategies(analysisResult: AnalysisResult): Promise<ProfitizationStrategy[]> {
  try {
    console.log('Generating profitization strategies with GPT...')
    
    const menuItemsText = analysisResult.items.map(item => 
      `${item.dishTitle} - ${item.price} (${item.category || 'Uncategorized'}) - Ingredients: ${item.ingredients.join(', ')}`
    ).join('\n')

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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

Return ONLY a valid JSON array with this structure:
[
  {
    "strategy": "Up Price",
    "actionInstruction": "Bucatini Cacio e Pepe ($24) → raise to $26",
    "category": "Two",
    "action": "Up price",
    "dish": "Bucatini Cacio e Pepe",
    "newPrice": 26,
    "why": "Perception of premium product, needs premium price"
  }
]

Generate 15-20 diverse strategies covering different profitization techniques.`
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

    // Parse GPT response - handle markdown code blocks
    let strategies: ProfitizationStrategy[]
    try {
      // Remove markdown code blocks if present
      let jsonContent = gptContent.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      strategies = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse GPT strategies response:', parseError)
      console.error('Raw GPT content:', gptContent)
      throw new Error('GPT returned invalid JSON for strategies')
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
