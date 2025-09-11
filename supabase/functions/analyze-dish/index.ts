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
    "strategy": "Current/baseline version of the dish",
    "recipeRating": 5,
    "recipeUrl": "#",
    "price": "realistic price in USD",
    "prepLabor": "estimated prep labor cost in USD", 
    "foodCost": "estimated food cost in USD",
    "estimatedVolume": 5000,
    "ingredients": [
      {
        "name": "ingredient name",
        "quantity": "numeric amount only (e.g., 1, 2, 0.5)",
        "unit": "unit only (e.g., lb, tbsp, cup)",
        "cost": "cost in USD as number"
      }
    ],
    "method": [
      "Step 1: First cooking instruction",
      "Step 2: Second cooking instruction",
      "Step 3: Continue with remaining steps..."
    ]
  },
  "highMargin": {
    "dishName": "${dishName}",
    "strategy": "Given the following recipe: [RECIPE], suggest me one high-margin strategy that keeps the dish tasty but reduces cost. Be specific, practical, and written in one short actionable line (e.g., 'Swap 25% mushrooms with peas & stems', 'Swap out 25% Beef for Mushroom').",
    "recipeRating": 5,
    "recipeUrl": "#",
    "price": "same or similar price as standard",
    "prepLabor": "same prep labor cost as standard (no labor optimization)",
    "foodCost": "reduced food cost after optimization", 
    "estimatedVolume": 5000,
    "ingredients": [
      {
        "name": "optimized ingredient name (cost-saving swap when possible)",
        "quantity": "numeric amount only (potentially adjusted for efficiency)",
        "unit": "unit only",
        "cost": "reduced cost in USD as number"
      }
    ],
    "method": [
      "Step 1: Optimized preparation method",
      "Step 2: Cost-efficient cooking technique",
      "Step 3: Continue with cost-saving steps..."
    ]
  },
  "premium": {
    "dishName": "${dishName}",
    "strategy": "ULTRA-PREMIUM upgrade with luxury ingredients and fine-dining presentation",
    "recipeRating": 5,
    "recipeUrl": "#", 
    "price": "significantly higher premium price (Michelin-star level)",
    "prepLabor": "potentially higher labor cost for refined presentation",
    "foodCost": "much higher food cost for luxury ingredients",
    "estimatedVolume": 5000,
    "ingredients": [
      {
        "name": "luxury ingredient name (e.g., wagyu beef, truffle oil, A5 beef, gold leaf)",
        "quantity": "numeric amount only",
        "unit": "unit only",
        "cost": "premium cost in USD as number"
      }
    ],
    "method": [
      "Step 1: Premium preparation technique",
      "Step 2: Fine-dining presentation method",
      "Step 3: Luxury finishing touches..."
    ]
  },
  "appetizers": [
    {
      "starter": "appetizer name",
      "ingredientCost": "Very Low/Low/Medium/High",
      "marginPotential": "number from 1-5",
      "perceivedPremium": "number from 1-5", 
      "whyItWorks": "explanation of why this appetizer complements the main dish"
    }
  ],
  "toppings": [
    {
      "name": "topping/extra name",
      "ingredientCost": "Very Low/Low/Medium/High",
      "marginPotential": "number from 1-5",
      "perceivedPremium": "number from 1-5",
      "whyItWorks": "explanation of why this topping enhances the main dish"
    }
  ]
}

CRITICAL GUIDELINES:

EVERY STRATEGY MUST INCLUDE:
- Complete ingredients list with specific quantities, units, and costs
- Complete cooking method with numbered steps
- All pricing data calculated consistently

HIGH MARGIN STRATEGY - ONE CONCISE ACTIONABLE LINE:
- NEVER change core ingredients that define the dish
- Must be ONE specific, actionable swap in 8 words or less
- Format: "Swap X% ingredient A for ingredient B" or "Replace ingredient A with ingredient B"
- Examples: "Swap 25% beef for mushrooms", "Use chicken thighs instead of breast", "Replace heavy cream with yogurt blend"
- Focus on ONE main cost-saving change that maintains dish quality
- Target: 20-40% cost reduction while keeping the dish authentic

PREMIUM STRATEGY - ULTRA-LUXURY:
- Price increase: 100-200% or MORE (think Michelin-star restaurants)
- Use truly luxury ingredients: wagyu beef, A5 beef, truffle, caviar, gold leaf, aged premium cheeses
- Add fine-dining presentation: tableside service, premium plateware, elaborate garnishes
- Example: $15 pizza → $45-60 with truffle oil, premium aged cheeses, gold leaf
- Example: $25 pasta → $75-85 with fresh white truffle, aged Parmigiano-Reggiano (24+ months)

INGREDIENTS & METHOD REQUIREMENTS:
- Each strategy must include detailed ingredients list with realistic costs
- Include 6-12 key ingredients per dish with specific quantities and costs
- Method should include 6-8 step-by-step cooking instructions
- For High Margin: Show SPECIFIC ingredient swaps with cost savings explained
- For Premium: Use luxury ingredients (wagyu, truffle, caviar, gold leaf, aged cheeses)
- Ensure ingredient costs add up to the foodCost field

GENERAL RULES:
- Base all costs on realistic restaurant pricing
- Keep the dish's core identity intact across all three versions
- All costs should be in USD format (numbers only, no currency symbols)
- Ensure the math makes sense: prep + food = prime cost, price - prime = profit
- Generate 5 appetizer suggestions that complement ${dishName}
- Focus on high-margin appetizers with low ingredient costs but good perceived value
- Consider flavor profiles that pair well with ${dishName}
- Generate 4-5 topping/extra suggestions that can be added to enhance ${dishName}
- Focus on high-margin toppings with low ingredient costs but good perceived value
- Consider add-ons that complement the dish without overwhelming it (sauces, garnishes, extras)
- Ingredient costs: Very Low (under $1), Low ($1-2), Medium ($2-4), High ($4+)
- Margin potential: 5=85-90%, 4=75-85%, 3=65-75%, 2=55-65%, 1=45-55%
- Perceived premium: 5=indulgent/upscale, 4=upmarket, 3=standard, 2=casual, 1=basic

Respond ONLY with the JSON structure, no additional text.`;

  console.log('Calling OpenAI API for pricing comparison:', dishName);
  console.log('OpenAI API key configured:', !!openAIApiKey);
  console.log('Prompt length:', prompt.length);

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using reliable model that supports large responses
        messages: [
          { 
            role: 'system', 
            content: 'You are a restaurant profitability consultant. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000, // Using max_tokens for this model
        temperature: 0.3 // Lower temperature for more consistent JSON output
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error response status:', openAIResponse.status);
      console.error('OpenAI API error headers:', Object.fromEntries(openAIResponse.headers.entries()));
      console.error('OpenAI API error data:', errorData);
      throw new Error(`OpenAI API error (${openAIResponse.status}): ${JSON.stringify(errorData)}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI pricing comparison response received for:', dishName);

    let pricingData;
    try {
      let content = openAIData.choices[0].message.content;
      console.log('Raw OpenAI response content length:', content.length);
      console.log('Raw OpenAI response content (first 500 chars):', content.substring(0, 500));
      console.log('Raw OpenAI response content (last 500 chars):', content.substring(Math.max(0, content.length - 500)));
      
      // Check if response appears truncated by looking for incomplete JSON structures
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      
      console.log('JSON structure check - Open braces:', openBraces, 'Close braces:', closeBraces);
      console.log('JSON structure check - Open brackets:', openBrackets, 'Close brackets:', closeBrackets);
      
      if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.error('Response appears to be truncated - mismatched braces/brackets');
        throw new Error('AI response appears to be truncated - JSON structure is incomplete');
      }
      
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
      console.log('Parsed pricing comparison data successfully');
      
      // Validate that all strategies have ingredients
      ['standard', 'highMargin', 'premium'].forEach(strategy => {
        if (!pricingData[strategy]?.ingredients) {
          console.warn(`Missing ingredients for ${strategy} strategy`);
        } else {
          console.log(`${strategy} strategy has ${pricingData[strategy].ingredients.length} ingredients`);
        }
      });
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
          console.log('Raw OpenAI response content:', content);
          
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
          console.log('Parsed analysis result:', JSON.stringify(analysisResult, null, 2));
          
          // Validate that all strategies have ingredients
          ['standard', 'highMargin', 'premium'].forEach(strategy => {
            if (!analysisResult[strategy]?.ingredients) {
              console.warn(`Missing ingredients for ${strategy} strategy`);
            }
          });
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