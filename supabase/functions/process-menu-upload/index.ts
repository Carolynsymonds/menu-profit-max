import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract dishes from various menu formats
function extractDishesFromMenu(menuData: any): any[] {
  const dishes: any[] = [];
  
  // Handle different menu data structures
  if (Array.isArray(menuData)) {
    // Direct array of dishes
    return menuData.map((item, index) => ({
      name: item.name || item.title || item.dish || `Dish ${index + 1}`,
      description: item.description || '',
      price: item.price || null,
      category: item.category || 'Main'
    }));
  }
  
  if (typeof menuData === 'object' && menuData !== null) {
    // Object with categories
    Object.keys(menuData).forEach(key => {
      const section = menuData[key];
      
      if (Array.isArray(section)) {
        section.forEach((item, index) => {
          dishes.push({
            name: item.name || item.title || item.dish || `${key} Item ${index + 1}`,
            description: item.description || '',
            price: item.price || null,
            category: key
          });
        });
      } else if (typeof section === 'object') {
        // Nested object structure
        Object.keys(section).forEach(subKey => {
          const subSection = section[subKey];
          if (Array.isArray(subSection)) {
            subSection.forEach((item, index) => {
              dishes.push({
                name: item.name || item.title || item.dish || `${subKey} Item ${index + 1}`,
                description: item.description || '',
                price: item.price || null,
                category: subKey
              });
            });
          }
        });
      }
    });
  }
  
  return dishes;
}

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

    // Extract all dishes from menu data first
    console.log('Extracting dishes from menu data...');
    const allDishes = extractDishesFromMenu(menuData);
    console.log(`Found ${allDishes.length} dishes in menu`);
    
    if (allDishes.length === 0) {
      throw new Error('No dishes found in menu data');
    }

    // Only analyze the FIRST dish with ChatGPT to save costs
    const firstDish = allDishes[0];
    console.log(`Analyzing first dish: ${firstDish.name}`);
    
    const analysisPrompt = `
Analyze this single restaurant dish and provide comprehensive profitability analysis.

Dish Data: ${JSON.stringify(firstDish)}

Please analyze this dish and return a JSON response with this exact structure:

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

Instructions:
- Intelligently identify likely ingredients even if not explicitly listed
- Estimate realistic food costs, labor time, and overhead
- Provide specific, actionable optimization suggestions  
- Consider typical restaurant profit margins (food cost should be 25-35% of price)
- If price isn't provided, suggest optimal pricing based on estimated costs
- Focus on practical recommendations that can immediately improve profitability

Return only valid JSON, no additional text.`;

    console.log('Sending first dish to ChatGPT for analysis...');

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
            content: 'You are a restaurant profitability expert. Analyze dish data and provide detailed cost analysis and optimization recommendations. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 3000,
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

    console.log('Raw ChatGPT response for first dish:', analysisContent);

    // Parse ChatGPT response for first dish
    let firstDishAnalysis;
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedContent = analysisContent.replace(/```json\n?|\n?```/g, '').trim();
      firstDishAnalysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing ChatGPT response:', parseError);
      throw new Error('Failed to parse dish analysis response');
    }

    console.log('First dish analyzed successfully');

    // Create placeholder data for remaining dishes (locked content)
    const remainingDishes = allDishes.slice(1).map((dish, index) => ({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      ingredients: [], // Empty - locked
      estimatedCostBreakdown: {
        ingredients: 0,
        labor: 0,
        overhead: 0,
        total: 0
      },
      profitabilityMetrics: {
        grossMargin: 0,
        netProfit: 0,
        marginCategory: 'Locked'
      },
      optimizationSuggestions: [],
      competitiveAnalysis: {
        marketPositioning: 'Upgrade to unlock',
        pricingRecommendation: 'Upgrade to unlock'
      },
      locked: true
    }));

    // Combine analyzed first dish with placeholder dishes
    const allAnalyzedDishes = [firstDishAnalysis, ...remainingDishes];
    
    console.log(`Processed ${allAnalyzedDishes.length} dishes (1 analyzed, ${remainingDishes.length} locked)`);

    // Format results for compatibility with existing UI
    const formattedResults = allAnalyzedDishes.map((dish: any) => ({
      dish: dish.name,
      analysis: {
        dishName: dish.name,
        costBreakdown: dish.estimatedCostBreakdown,
        profitabilityMetrics: dish.profitabilityMetrics,
        optimizationSuggestions: dish.optimizationSuggestions,
        competitiveAnalysis: dish.competitiveAnalysis,
        ingredients: dish.ingredients,
        category: dish.category,
        currentPrice: dish.price,
        locked: dish.locked || false
      }
    }));

    // Update menu upload with analysis results
    const { error: updateError } = await supabase
      .from('menu_uploads')
      .update({
        processed_dishes: allAnalyzedDishes,
        analysis_results: {
          dishes: formattedResults,
          menuOverview: {
            totalDishes: allAnalyzedDishes.length,
            analyzedDishes: 1,
            lockedDishes: remainingDishes.length,
            averageMargin: firstDishAnalysis.profitabilityMetrics?.grossMargin || 0,
            topPerformers: [firstDishAnalysis.name],
            improvementOpportunities: ['Unlock full analysis to see all optimization opportunities']
          },
          totalDishes: allAnalyzedDishes.length,
          successfulAnalyses: 1,
          lockedDishes: remainingDishes.length,
          completedAt: new Date().toISOString()
        },
        processing_status: 'completed'
      })
      .eq('id', menuUpload.id);

    if (updateError) {
      console.error('Error updating menu upload:', updateError);
      throw updateError;
    }

    console.log('Menu analysis completed successfully (freemium mode)');

    return new Response(JSON.stringify({
      success: true,
      menuUploadId: menuUpload.id,
      totalDishes: allAnalyzedDishes.length,
      successfulAnalyses: 1,
      lockedDishes: remainingDishes.length,
      analysisResults: formattedResults,
      menuOverview: {
        totalDishes: allAnalyzedDishes.length,
        analyzedDishes: 1,
        lockedDishes: remainingDishes.length,
        averageMargin: firstDishAnalysis.profitabilityMetrics?.grossMargin || 0,
        topPerformers: [firstDishAnalysis.name],
        improvementOpportunities: ['Unlock full analysis to see all optimization opportunities']
      }
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