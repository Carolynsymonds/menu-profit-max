import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { menuData, userEmail, filename } = await req.json();
    
    console.log(`Processing menu upload for user: ${userEmail}, filename: ${filename}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store menu upload in database
    const { data: menuUpload, error: insertError } = await supabase
      .from('menu_uploads')
      .insert({
        user_email: userEmail,
        original_filename: filename,
        menu_data: menuData,
        processing_status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting menu upload:', insertError);
      throw insertError;
    }

    console.log(`Menu upload stored with ID: ${menuUpload.id}`);

    // Analyze entire menu with ChatGPT in one call
    const analysisPrompt = `
Analyze this restaurant menu JSON data and provide comprehensive profitability analysis for all dishes. 

Menu Data: ${JSON.stringify(menuData)}

Please analyze every dish in the menu and return a JSON response with this exact structure:

{
  "dishes": [
    {
      "name": "dish name",
      "category": "menu category/section",
      "price": "current menu price or null if not provided",
      "ingredients": ["list of likely ingredients based on dish name and description"],
      "estimatedCostBreakdown": {
        "ingredients": "estimated ingredient cost",
        "labor": "estimated labor cost", 
        "overhead": "estimated overhead cost",
        "total": "total estimated cost"
      },
      "profitabilityMetrics": {
        "grossMargin": "gross profit margin percentage",
        "netProfit": "net profit amount",
        "marginCategory": "High/Medium/Low"
      },
      "optimizationSuggestions": [
        "specific actionable suggestions to improve profitability"
      ],
      "competitiveAnalysis": {
        "marketPositioning": "how this dish compares to market",
        "pricingRecommendation": "suggested pricing strategy"
      }
    }
  ],
  "menuOverview": {
    "totalDishes": "number of dishes analyzed",
    "averageMargin": "overall menu margin",
    "topPerformers": ["list of most profitable dishes"],
    "improvementOpportunities": ["menu-wide suggestions"]
  }
}

Instructions:
- Extract ALL dishes from the JSON regardless of structure
- For each dish, intelligently identify likely ingredients even if not explicitly listed
- Estimate realistic food costs, labor time, and overhead
- Provide specific, actionable optimization suggestions
- Consider typical restaurant profit margins (food cost should be 25-35% of price)
- If prices aren't provided, suggest optimal pricing based on estimated costs
- Focus on practical recommendations that can immediately improve profitability

Return only valid JSON, no additional text.`;

    console.log('Sending menu to ChatGPT for comprehensive analysis...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant profitability expert. Analyze menu data and provide detailed cost analysis and optimization recommendations for each dish. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisContent = openAIData.choices[0].message.content;

    console.log('Raw ChatGPT response:', analysisContent);

    // Parse ChatGPT response
    let menuAnalysis;
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedContent = analysisContent.replace(/```json\n?|\n?```/g, '').trim();
      menuAnalysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing ChatGPT response:', parseError);
      throw new Error('Failed to parse menu analysis response');
    }

    console.log(`ChatGPT analyzed ${menuAnalysis.dishes.length} dishes`);

    // Format results for compatibility with existing UI
    const formattedResults = menuAnalysis.dishes.map((dish: any) => ({
      dish: dish.name,
      analysis: {
        dishName: dish.name,
        costBreakdown: dish.estimatedCostBreakdown,
        profitabilityMetrics: dish.profitabilityMetrics,
        optimizationSuggestions: dish.optimizationSuggestions,
        competitiveAnalysis: dish.competitiveAnalysis,
        ingredients: dish.ingredients,
        category: dish.category,
        currentPrice: dish.price
      }
    }));

    // Update menu upload with analysis results
    const { error: updateError } = await supabase
      .from('menu_uploads')
      .update({
        processed_dishes: menuAnalysis.dishes,
        analysis_results: {
          dishes: formattedResults,
          menuOverview: menuAnalysis.menuOverview,
          totalDishes: menuAnalysis.dishes.length,
          successfulAnalyses: menuAnalysis.dishes.length,
          completedAt: new Date().toISOString()
        },
        processing_status: 'completed'
      })
      .eq('id', menuUpload.id);

    if (updateError) {
      console.error('Error updating menu upload:', updateError);
      throw updateError;
    }

    console.log('Menu analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      menuUploadId: menuUpload.id,
      totalDishes: menuAnalysis.dishes.length,
      successfulAnalyses: menuAnalysis.dishes.length,
      analysisResults: formattedResults,
      menuOverview: menuAnalysis.menuOverview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-menu-upload function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process menu upload'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});