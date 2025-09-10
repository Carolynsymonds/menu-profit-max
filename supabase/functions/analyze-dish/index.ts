import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Pricing comparison analysis handler
async function handlePricingComparison(dishName: string) {
  const prompt = `You are a restaurant profitability consultant. Analyze the dish "${dishName}" and create three strategic pricing variations to maximize profitability.

Create a pricing comparison with these three strategies:
1. STANDARD: Current/baseline version of the dish
2. HIGH MARGIN: Same dish with cost-saving optimizations (PRESERVE DISH AUTHENTICITY)  
3. PREMIUM: Upgraded version with ultra-luxury ingredients and fine-dining presentation

Provide a structured JSON response with the following format:

{
  "standard": {
    "dishName": "${dishName}",
    "strategy": "",
    "recipeRating": 5,
    "recipeUrl": "#",
    "price": "realistic price in USD",
    "prepLabor": "estimated prep labor cost in USD", 
    "foodCost": "estimated food cost in USD",
    "estimatedVolume": 5000
  },
  "highMargin": {
    "dishName": "${dishName}",
    "strategy": "brief description of SMART cost-saving strategy that MAINTAINS dish identity",
    "recipeRating": 5,
    "recipeUrl": "#",
    "price": "same or similar price as standard",
    "prepLabor": "labor cost after optimization",
    "foodCost": "reduced food cost after optimization", 
    "estimatedVolume": 5000
  },
  "premium": {
    "dishName": "${dishName}",
    "strategy": "brief description of ULTRA-PREMIUM upgrade with luxury ingredients",
    "recipeRating": 5,
    "recipeUrl": "#", 
    "price": "significantly higher premium price (Michelin-star level)",
    "prepLabor": "potentially higher labor cost for refined presentation",
    "foodCost": "much higher food cost for luxury ingredients",
    "estimatedVolume": 5000
  },
  "appetizers": [
    {
      "starter": "appetizer name",
      "ingredientCost": "Very Low/Low/Medium/High",
      "marginPotential": "number from 1-5",
      "perceivedPremium": "number from 1-5", 
      "whyItWorks": "explanation of why this appetizer complements the main dish"
    }
  ]
}

CRITICAL GUIDELINES:

HIGH MARGIN STRATEGY - PRESERVE AUTHENTICITY:
- NEVER change core ingredients that define the dish (e.g., NO quinoa in risotto, NO tofu in beef dishes)
- Focus on SMART cost reductions: portion optimization, supplier efficiency, prep method improvements
- Acceptable changes: reducing garnish portions, local vs imported ingredients, batch prep efficiency
- FORBIDDEN changes: fundamental ingredient swaps that alter the dish's essence
- Target: 20-40% cost reduction while maintaining quality and authenticity

PREMIUM STRATEGY - ULTRA-LUXURY:
- Price increase: 100-200% or MORE (think Michelin-star restaurants)
- Use truly luxury ingredients: wagyu beef, A5 beef, truffle, caviar, gold leaf, aged premium cheeses
- Add fine-dining presentation: tableside service, premium plateware, elaborate garnishes
- Example: $15 pizza → $45-60 with truffle oil, premium aged cheeses, gold leaf
- Example: $25 pasta → $75-85 with fresh white truffle, aged Parmigiano-Reggiano (24+ months)

GENERAL RULES:
- Base all costs on realistic restaurant pricing
- Keep the dish's core identity intact across all three versions
- All costs should be in USD format (numbers only, no currency symbols)
- Ensure the math makes sense: prep + food = prime cost, price - prime = profit
- Generate 5 appetizer suggestions that complement ${dishName}
- Focus on high-margin appetizers with low ingredient costs but good perceived value
- Consider flavor profiles that pair well with ${dishName}
- Ingredient costs: Very Low (under $1), Low ($1-2), Medium ($2-4), High ($4+)
- Margin potential: 5=85-90%, 4=75-85%, 3=65-75%, 2=55-65%, 1=45-55%
- Perceived premium: 5=indulgent/upscale, 4=upmarket, 3=standard, 2=casual, 1=basic

Respond ONLY with the JSON structure, no additional text.`;

  console.log('Calling OpenAI API for pricing comparison:', dishName);

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a restaurant profitability consultant. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI pricing comparison response received for:', dishName);

    let pricingData;
    try {
      let content = openAIData.choices[0].message.content;
      
      // Clean up the response
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (content.includes('```')) {
        content = content.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }
      
      content = content.replace(/\/\/.*$/gm, ''); // Remove comments
      content = content.trim();
      content = content.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      pricingData = JSON.parse(content);
      console.log('Parsed pricing comparison data:', pricingData);
    } catch (parseError) {
      console.error('Failed to parse pricing comparison JSON:', parseError);
      console.error('Raw content:', openAIData.choices[0].message.content);
      throw new Error('Failed to parse AI response for pricing comparison');
    }

    return new Response(JSON.stringify({
      type: 'pricing-comparison',
      data: pricingData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pricing comparison:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('Analyze dish function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dishNames, dishName, menuContext, analysisType } = await req.json();
    
    // Support both single dish and multiple dishes
    const dishesToAnalyze = dishNames || [dishName];
    console.log('Analyzing dishes:', dishesToAnalyze);
    console.log('Analysis type:', analysisType);

    if (!dishesToAnalyze || dishesToAnalyze.length === 0) {
      throw new Error('At least one dish name is required');
    }

    // Handle pricing comparison analysis
    if (analysisType === 'pricing-comparison') {
      return await handlePricingComparison(dishesToAnalyze[0]);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process multiple dishes in parallel
    const results = await Promise.all(dishesToAnalyze.map(async (dishName: string, index: number) => {
      const currentMenuContext = Array.isArray(menuContext) ? menuContext[index] : menuContext;
      
      // Skip cache if menu context provided for more accurate analysis
      if (!currentMenuContext) {
        // Check if we have a recent analysis cached (within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: cachedAnalysis } = await supabase
          .from('dish_analyses')
          .select('*')
          .eq('dish_name', dishName.toLowerCase().trim())
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (cachedAnalysis) {
          console.log('Returning cached analysis for:', dishName);
          return { dishName, analysis: cachedAnalysis.analysis_result, fromCache: true };
        }
      }

      return { dishName, analysis: null, fromCache: false, menuContext: currentMenuContext };
    }));

    // Separate cached and non-cached results
    const cachedResults = results.filter(r => r.fromCache);
    const uncachedDishes = results.filter(r => !r.fromCache);

    let newAnalyses: any[] = [];
    
    // Process uncached dishes
    if (uncachedDishes.length > 0) {
      newAnalyses = await Promise.all(uncachedDishes.map(async (result: any) => {
        const { dishName, menuContext: currentMenuContext } = result;

        // Create enhanced prompt for menu context or standard prompt
        let prompt;
        
        if (currentMenuContext) {
          // Enhanced prompt with actual menu data
          prompt = `You are a restaurant profitability consultant. Analyze the dish "${dishName}" using the provided menu information and give detailed optimization recommendations.

DISH DETAILS:
- Name: ${dishName}
- Current Price: $${currentMenuContext.price || 'Unknown'}
- Ingredients: ${currentMenuContext.ingredients ? currentMenuContext.ingredients.join(', ') : 'Not specified'}
- Recipe/Description: ${currentMenuContext.recipe || 'Not provided'}
- Prep Time: ${currentMenuContext.prepTime || 'Unknown'} minutes
- Category: ${currentMenuContext.category || 'Unknown'}

Provide a structured JSON response with the following format:

{
  "originalDish": {
    "name": "${dishName}",
    "estimatedMargin": "percentage as number (e.g., 22)",
    "costBreakdown": {
      "ingredientCost": "estimated cost in USD based on provided ingredients",
      "laborCost": "estimated labor cost in USD based on prep time",
      "menuPrice": "${currentMenuContext.price || 'estimated price'}"
    },
    "ingredientList": ["ingredient with quantity and cost based on actual ingredients provided"]
  },
  "optimizations": [
    {
      "optimization": "specific actionable change based on actual ingredients and recipe",
      "marginImprovement": "percentage point increase (e.g., 8)",
      "impact": "explanation of financial and operational benefits",
      "implementation": "step-by-step instructions for implementing this change",
      "costSavings": {
        "ingredientSavings": "cost reduction in USD",
        "newIngredientCost": "new ingredient cost in USD", 
        "netSavings": "net savings per dish in USD"
      }
    }
  ],
  "tip": "actionable advice for improving profitability based on actual menu data"
}

Focus on specific recommendations based on the actual ingredients and recipe provided. Consider ingredient substitutions, portion optimization, prep efficiency improvements, and pricing strategies.`;
        } else {
          // Standard prompt for dishes without menu context
          prompt = `You are a restaurant profitability consultant. Analyze the dish "${dishName}" and provide optimization recommendations to improve its profitability. Provide a structured JSON response with the following format:

{
  "originalDish": {
    "name": "${dishName}",
    "estimatedMargin": "percentage as number (e.g., 22)",
    "costBreakdown": {
      "ingredientCost": "estimated cost in USD",
      "laborCost": "estimated labor cost in USD",
      "menuPrice": "typical restaurant price in USD"
    },
    "ingredientList": ["ingredient with quantity and cost (e.g., '2 chicken breasts ($4.50)')", "1 cup mixed greens ($1.20)", "etc."]
  },
  "optimizations": [
    {
      "optimization": "specific actionable change (e.g., Replace chicken with eggplant)",
      "marginImprovement": "percentage point increase (e.g., 8)",
      "impact": "explanation of financial and operational benefits",
      "implementation": "step-by-step instructions for implementing this change",
      "costSavings": {
        "ingredientSavings": "cost reduction in USD",
        "newIngredientCost": "new ingredient cost in USD", 
        "netSavings": "net savings per dish in USD"
      }
    }
  ],
  "tip": "actionable advice for improving profitability"
}

Guidelines:
- Focus on optimizing the SAME dish, not suggesting different dishes
- Provide 4-5 specific optimization recommendations such as:
  * Ingredient substitutions (lower-cost alternatives with similar taste)
  * Portion adjustments (reducing expensive ingredients while maintaining quality)
  * Preparation method changes (more efficient cooking techniques)
  * Supplier optimizations (domestic vs imported ingredients)
  * Upselling opportunities (add-ons that increase revenue)
- Base analysis on realistic restaurant costs and supplier options
- Ensure optimizations preserve the dish's core identity and taste profile
- Provide specific cost savings and margin improvement percentages
- Make recommendations practical and immediately implementable

Respond ONLY with the JSON structure, no additional text.`;
        }

        console.log('Calling OpenAI API for dish analysis:', dishName);

        // Call OpenAI API
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are a restaurant profitability consultant. Respond only with valid JSON.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7
          }),
        });

        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const openAIData = await openAIResponse.json();
        console.log('OpenAI response received for:', dishName);

        let analysisResult;
        try {
          let content = openAIData.choices[0].message.content;
          
          // Strip markdown code blocks if present
          if (content.includes('```json')) {
            content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
          } else if (content.includes('```')) {
            content = content.replace(/```\s*/g, '').replace(/```\s*$/g, '');
          }
          
          // Remove JavaScript-style comments that make JSON invalid
          content = content.replace(/\/\/.*$/gm, '');
          
          // Clean up any extra whitespace and trailing commas
          content = content.trim();
          content = content.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          analysisResult = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI JSON response for:', dishName, parseError);
          console.error('Raw content:', openAIData.choices[0].message.content);
          throw new Error(`Failed to parse AI response for ${dishName}`);
        }

        // Extract profit margin for indexing
        const profitMargin = analysisResult.originalDish?.estimatedMargin || 0;

        // Cache the result in database with menu context
        await supabase
          .from('dish_analyses')
          .insert({
            dish_name: dishName.toLowerCase().trim(),
            analysis_result: {
              ...analysisResult,
              menu_context: currentMenuContext || null,
              analysis_type: currentMenuContext ? 'menu_upload' : 'individual'
            },
            profit_margin: profitMargin,
            suggestions: analysisResult.optimizations || []
          });

        console.log('Analysis cached successfully for:', dishName);
        return { dishName, analysis: analysisResult, fromCache: false };
      }));
    }

    // Combine all results
    const allResults = [
      ...cachedResults.map(r => ({ dishName: r.dishName, analysis: r.analysis })),
      ...newAnalyses
    ];

    // If single dish (backward compatibility)
    if (dishesToAnalyze.length === 1) {
      return new Response(JSON.stringify(allResults[0].analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Multiple dishes - return structured format
    const multiDishResult = {
      dishes: allResults.map(r => ({
        dishName: r.dishName,
        ...r.analysis
      }))
    };

    return new Response(JSON.stringify(multiDishResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-dish function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze dish',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});