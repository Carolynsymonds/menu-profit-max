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
  upliftText?: string;
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
    
    // Validate that this is actually a restaurant menu
    console.log('Validating menu content...')
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
        'Authorization': `Bearer ${openAIApiKey}`,
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

    console.log('Menu validation passed, proceeding with analysis...')
    
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

IMPORTANT JSON RULES:
- Escape all quotes in strings (use \" for quotes within text)
- No trailing commas
- All strings must be properly quoted
- Use only double quotes, never single quotes

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

    // Parse GPT response - handle markdown code blocks and sanitize JSON
    let analysisResult: AnalysisResult
    try {
      // Remove markdown code blocks if present
      let jsonContent = gptContent.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Additional sanitization for common GPT JSON issues
      // Remove any trailing commas before closing braces/brackets
      jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1')
      
      // Log the content for debugging (first 500 chars)
      console.log('JSON content to parse (first 500 chars):', jsonContent.substring(0, 500))
      
      analysisResult = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError)
      console.error('Raw GPT content (first 1000 chars):', gptContent.substring(0, 1000))
      console.error('JSON content that failed (first 1000 chars):', jsonContent.substring(0, 1000))
      throw new Error(`GPT returned invalid JSON: ${parseError.message}`)
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
