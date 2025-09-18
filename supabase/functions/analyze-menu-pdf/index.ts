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

interface AnalysisResult {
  items: MenuItem[];
  categories: string[];
  totalItems: number;
  analysisDate: string;
}

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

    // Convert base64 to buffer
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))
    
    // Extract text from PDF (simplified - in production you'd use a proper PDF parser)
    const extractedText = await extractTextFromPDF(fileBuffer)
    
    // Analyze the text to extract menu items
    const analysisResult = await analyzeMenuText(extractedText)

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function extractTextFromPDF(buffer: Uint8Array): Promise<string> {
  // This is a simplified implementation
  // In production, you'd use a proper PDF parsing library like pdf-parse or pdf2pic
  // For now, we'll simulate text extraction
  
  // Convert buffer to string (this won't work for actual PDFs, but demonstrates the flow)
  const text = new TextDecoder().decode(buffer)
  
  // Simulate extracted menu text
  return `
    APPETIZERS
    Buffalo Wings - Spicy chicken wings with celery and ranch - $12.99
    Mozzarella Sticks - Golden fried cheese with marinara sauce - $8.99
    Spinach Artichoke Dip - Creamy dip with tortilla chips - $10.99
    
    MAIN COURSES
    Grilled Salmon - Atlantic salmon with lemon butter sauce - $24.99
    Ribeye Steak - 12oz ribeye with garlic mashed potatoes - $32.99
    Chicken Parmesan - Breaded chicken with pasta and marinara - $18.99
    Caesar Salad - Romaine lettuce with parmesan and croutons - $14.99
    
    DESSERTS
    Chocolate Cake - Rich chocolate cake with vanilla ice cream - $7.99
    Tiramisu - Classic Italian dessert - $8.99
    Cheesecake - New York style cheesecake - $6.99
  `
}

async function analyzeMenuText(text: string): Promise<AnalysisResult> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const items: MenuItem[] = []
  const categories: string[] = []
  let currentCategory = ''

  for (const line of lines) {
    // Check if line is a category header (all caps, no price)
    if (line.match(/^[A-Z\s]+$/) && !line.includes('$')) {
      currentCategory = line
      if (!categories.includes(currentCategory)) {
        categories.push(currentCategory)
      }
      continue
    }

    // Check if line contains a price (ends with $X.XX)
    const priceMatch = line.match(/\$(\d+\.?\d*)$/)
    if (priceMatch) {
      const price = priceMatch[0]
      const dishPart = line.replace(price, '').trim()
      
      // Split dish name and ingredients (assuming format: "Dish Name - Ingredients")
      const parts = dishPart.split(' - ')
      const dishTitle = parts[0] || dishPart
      const ingredients = parts[1] ? parts[1].split(',').map(ing => ing.trim()) : []

      items.push({
        dishTitle: dishTitle.trim(),
        ingredients,
        price,
        category: currentCategory || 'Uncategorized'
      })
    }
  }

  return {
    items,
    categories,
    totalItems: items.length,
    analysisDate: new Date().toISOString()
  }
}
