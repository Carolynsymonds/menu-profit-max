import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate profitization strategies for menu items
// deno-lint-ignore-file no-explicit-any
export async function generateProfitizationStrategies(analysisResult: any): Promise<any[]> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) throw new Error("OpenAI API key not found");

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const toMenuText = (it: any) =>
    `${it.dishTitle} | ${it.price ?? "N/A"} | ${it.category ?? "Uncategorized"} | Ingredients: ${(it.ingredients ?? []).join(", ")}`;

  const extractJsonArray = (s: string): string => {
    const fenced = s.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    const start = fenced.indexOf("[");
    const end = fenced.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON array found");
    return fenced.slice(start, end + 1);
  };

  const sanitizeJson = (s: string): string => s.replace(/,(\s*[}\]])/g, "$1");

  type Strategy = {
    strategy: string;
    actionInstruction: string;
    category: string;
    action: "Up price" | "New Dish" | "New Extra" | "Reframe" | "Remove Dish" | "Staffing" | "Ingredients" | "Reposition" | "New Combo";
    dish: string;
    newPrice: number | null;
    why: string;
    upliftText: string;
  };

  const validate = (arr: any[]): Strategy[] => {
    const ok: Strategy[] = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const out: Strategy = {
        strategy: String(item.strategy ?? ""),
        actionInstruction: String(item.actionInstruction ?? ""),
        category: String(item.category ?? ""),
        action: ["Up price","New Dish","New Extra","Reframe","Remove Dish","Staffing","Ingredients","Reposition","New Combo"].includes(item.action)
          ? item.action
          : "Reframe",
        dish: String(item.dish ?? ""),
        newPrice: item.newPrice === null || item.newPrice === undefined || isNaN(Number(item.newPrice)) ? null : Number(item.newPrice),
        why: String(item.why ?? ""),
        upliftText: String(item.upliftText ?? "")
      };
      if (!out.strategy || !out.actionInstruction || !out.dish || !out.upliftText) continue;
      ok.push(out);
    }
    return ok;
  };

  const withTimeout = (ms: number) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return { signal: ctrl.signal, clear: () => clearTimeout(id) };
  };

  const retryFetch = async (url: string, init: RequestInit, tries = 3): Promise<Response> => {
    let lastErr: any;
    for (let i = 0; i < tries; i++) {
      const t = withTimeout(45_000);
      try {
        const res = await fetch(url, { ...init, signal: t.signal });
        t.clear();
        if (res.ok) return res;
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          await new Promise(r => setTimeout(r, (i + 1) * 800));
          continue;
        }
        lastErr = new Error(`HTTP ${res.status} – ${await res.text()}`);
      } catch (err) {
        lastErr = err;
      }
      await new Promise(r => setTimeout(r, (i + 1) * 800));
    }
    throw lastErr ?? new Error("Request failed");
  };

  // ── Prompt ────────────────────────────────────────────────────────────────────
  const menuItemsText = (analysisResult.items ?? []).map(toMenuText).join("\n");
  const categories = (analysisResult.categories ?? []).join(", ");
  const totalItems = analysisResult.totalItems ?? (analysisResult.items?.length ?? 0);

  const systemPrompt = `
You are a restaurant menu optimization expert.
Return ONLY a strict JSON array of strategies.

Anchor in:
- Menu Engineering (stars/dogs, placement)
- Cost-based pricing + demand (25–30% food cost; note underpriced items)
- Psychology (naming, framing, bundles, anchors)
- Streamlining & cross-utilization
- Upsells/bundles (sides, drinks, desserts)
- Supplier/cost monitoring
- Value messaging (justify price without alienating guests)

CRITICAL ORDERING RULE:
Put these as the FIRST THREE items (in this exact priority):
1) "New Extra" (simple add-on/side/upgrade, e.g., avocado side, sauce add-on)
2) "Reframe" (rename/positioning change, e.g., "Chef's Special")
3) "New Combo" (simple bundle with existing items, e.g., Breakfast + Coffee)
Only after those, include other actions (Up price, Reposition, Ingredients, etc.).

FIELDS (exact keys):
- "strategy"  (e.g., "Up Price","Premium UpSell Add On","Reframe Item","Reposition","New Combo","Swap Ingredients","Portion Control")
- "actionInstruction" (<= 15 words, imperative, specific)
- "category"  (menu section)
- "action"    ("Up price","New Dish","New Extra","Reframe","Remove Dish","Staffing","Ingredients","Reposition","New Combo")
- "dish"      (target item)
- "newPrice"  (number only; null if not a price change)
- "why"       (<= 10 words)
- "upliftText" (\"+X–Y% <type> profit\")

RULES:
- 15–20 items.
- Use realistic uplift ranges.
- ONLY double quotes. No comments or trailing commas.
- Return just the JSON array.
`.trim();

  const userPrompt = `
Analyze this restaurant menu and generate profitization strategies.

Menu Items:
${menuItemsText}

Categories: ${categories}
Total Items: ${totalItems}
`.trim();

  // ── Call OpenAI ───────────────────────────────────────────────────────────────
  const body = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  let raw = "";
  try {
    const res = await retryFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    raw = json?.choices?.[0]?.message?.content ?? "";
    if (!raw) throw new Error("Empty completion content");
  } catch (e) {
    console.error("GPT strategies request failed:", e);
    return [];
  }

  // ── Parse & validate ─────────────────────────────────────────────────────────
  let strategies: Strategy[] = [];
  try {
    const jsonBlock = sanitizeJson(extractJsonArray(raw));
    const parsed = JSON.parse(jsonBlock);
    if (!Array.isArray(parsed)) throw new Error("Root is not an array");
    strategies = validate(parsed);
  } catch (err) {
    console.error("Failed to parse strategies JSON:", err);
    console.error("Raw content (first 800 chars):", (raw ?? "").slice(0, 800));
    return [];
  }

  // ── Safeguard ordering: ensure the first 3 are convenient & catchy ───────────
  const ACTION_WEIGHT: Record<string, number> = {
    "New Extra": 100,  // add-ons/sides/upgrades first
    "Reframe": 95,     // rename/positioning
    "New Combo": 90,   // simple bundles
    "Up price": 80,
    "Reposition": 70,
    "Ingredients": 55,
    "New Dish": 50,
    "Staffing": 40,
    "Remove Dish": 35
  };

  const CATCHY_BONUS = (s: Strategy): number => {
    const t = `${s.actionInstruction} ${s.dish}`.toLowerCase();
    let score = 0;
    // obvious add-ons/bundles/phrases customers love
    if (/(avocado|sauce|side|add[- ]?on|cheese|bacon|extra)/.test(t)) score += 12;
    if (/(combo|bundle|coffee|breakfast|lunch|dessert)/.test(t)) score += 10;
    if (/(rename|chef|special|signature|house)/.test(t)) score += 8;
    if (/(pair|pairing|wine|drink)/.test(t)) score += 6;
    return score;
  };

  const priorityScore = (s: Strategy): number =>
    (ACTION_WEIGHT[s.action] ?? 0) + CATCHY_BONUS(s);

  strategies.sort((a, b) => priorityScore(b) - priorityScore(a));

  // extra guard: promote at least one of each (New Extra, Reframe, New Combo) to top-3 if present
  const topPicks: Strategy[] = [];
  const take = (pred: (x: Strategy) => boolean) => {
    const idx = strategies.findIndex(pred);
    if (idx >= 0) topPicks.push(...strategies.splice(idx, 1));
  };
  take(s => s.action === "New Extra");
  take(s => s.action === "Reframe");
  take(s => s.action === "New Combo");
  strategies = [...topPicks, ...strategies];

  console.log(`Generated ${strategies.length} profitization strategies (reordered with convenience-first top 3)`);
  return strategies;
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
    
    // Skip validation if we have good structured data
    console.log('=== STEP 2.5: VALIDATING MENU CONTENT ===')
    console.log('Checking if validation is needed...')
    
    // If we have structured JSON with items, skip validation
    if (structuredData && structuredData.sections && structuredData.sections.length > 0) {
      const totalItems = structuredData.sections.reduce((sum, section) => sum + (section.items?.length || 0), 0)
      console.log(`Found structured data with ${structuredData.sections.length} sections and ${totalItems} items - skipping validation`)
    } else {
      console.log('No structured data found, performing validation...')
    const menuValidationPrompt = `You are a restaurant menu validator. Analyze the provided text and determine if it's a restaurant menu.

A valid restaurant menu should contain:
- Food items with prices (e.g., "Pizza Margherita - $15")
- Menu sections (e.g., "Appetizers", "Main Courses", "Desserts")
- Restaurant-related content (dishes, beverages, prices)

Be lenient - if you see food items, prices, or menu sections, consider it valid.

Return ONLY "VALID_MENU" if this is a restaurant menu, or "INVALID_MENU" if it's not.

Text to analyze:
${extractedText.substring(0, 4000)}`;

    const validationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: menuValidationPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (!validationResponse.ok) {
      console.error('Menu validation API error:', await validationResponse.text())
      throw new Error('Failed to validate menu content')
    }

    const validationResult = await validationResponse.json()
    const validationText = validationResult.choices[0].message.content.trim()
    console.log('Menu validation result:', validationText)

    if (validationText !== 'VALID_MENU') {
      console.log('Invalid menu content detected')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This file does not appear to be a restaurant menu. Please review your file and upload a valid menu document.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    }

    console.log('Menu validation passed, proceeding with analysis...')
    
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
