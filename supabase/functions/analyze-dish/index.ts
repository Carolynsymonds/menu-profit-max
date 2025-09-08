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

serve(async (req) => {
  console.log('Analyze dish function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dishName } = await req.json();
    console.log('Analyzing dish:', dishName);

    if (!dishName) {
      throw new Error('Dish name is required');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      return new Response(JSON.stringify(cachedAnalysis.analysis_result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the analysis prompt
    const prompt = `You are a restaurant profitability consultant. Analyze the dish "${dishName}" and provide optimization recommendations to improve its profitability. Provide a structured JSON response with the following format:

{
  "originalDish": {
    "name": "dish name",
    "estimatedMargin": "percentage as number (e.g., 22)",
    "costBreakdown": {
      "ingredientCost": "estimated cost in GBP",
      "laborCost": "estimated labor cost in GBP",
      "menuPrice": "typical restaurant price in GBP"
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
        "ingredientSavings": "cost reduction in GBP",
        "newIngredientCost": "new ingredient cost in GBP", 
        "netSavings": "net savings per dish in GBP"
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

    console.log('Calling OpenAI API for dish analysis');

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
    console.log('OpenAI response received');

    let analysisResult;
    try {
      analysisResult = JSON.parse(openAIData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Extract profit margin for indexing
    const profitMargin = analysisResult.originalDish?.estimatedMargin || 0;

    // Cache the result in database
    await supabase
      .from('dish_analyses')
      .insert({
        dish_name: dishName.toLowerCase().trim(),
        analysis_result: analysisResult,
        profit_margin: profitMargin,
        suggestions: analysisResult.optimizations || []
      });

    console.log('Analysis cached successfully for:', dishName);

    return new Response(JSON.stringify(analysisResult), {
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