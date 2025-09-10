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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and extract dishes from menu
    const processedDishes = extractDishesFromMenu(menuData);
    console.log(`Extracted ${processedDishes.length} dishes from menu`);

    // Store menu upload in database
    const { data: menuUpload, error: insertError } = await supabase
      .from('menu_uploads')
      .insert({
        user_email: userEmail,
        original_filename: filename,
        menu_data: menuData,
        processed_dishes: processedDishes,
        processing_status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting menu upload:', insertError);
      throw insertError;
    }

    console.log(`Menu upload stored with ID: ${menuUpload.id}`);

    // Process each dish for analysis
    const analysisPromises = processedDishes.map(async (dish: any) => {
      try {
        // Call analyze-dish function for each dish
        const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-dish', {
          body: {
            dishName: dish.name,
            menuContext: {
              ingredients: dish.ingredients,
              recipe: dish.recipe,
              price: dish.price,
              prepTime: dish.prep_time,
              menuUploadId: menuUpload.id
            }
          }
        });

        if (analysisError) {
          console.error(`Error analyzing dish ${dish.name}:`, analysisError);
          return null;
        }

        return {
          dish: dish.name,
          analysis: analysisResult
        };
      } catch (error) {
        console.error(`Failed to analyze dish ${dish.name}:`, error);
        return null;
      }
    });

    // Wait for all analyses to complete
    const analysisResults = await Promise.all(analysisPromises);
    const successfulAnalyses = analysisResults.filter(result => result !== null);

    console.log(`Completed analysis for ${successfulAnalyses.length} dishes`);

    // Update menu upload with analysis results
    const { error: updateError } = await supabase
      .from('menu_uploads')
      .update({
        analysis_results: {
          dishes: successfulAnalyses,
          totalDishes: processedDishes.length,
          successfulAnalyses: successfulAnalyses.length,
          completedAt: new Date().toISOString()
        },
        processing_status: 'completed'
      })
      .eq('id', menuUpload.id);

    if (updateError) {
      console.error('Error updating menu upload:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      menuUploadId: menuUpload.id,
      totalDishes: processedDishes.length,
      successfulAnalyses: successfulAnalyses.length,
      analysisResults: successfulAnalyses
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

function extractDishesFromMenu(menuData: any): any[] {
  const dishes: any[] = [];
  
  try {
    // Handle different possible menu structures
    if (menuData.menu && menuData.menu.sections) {
      // Structure: { menu: { sections: [...] } }
      menuData.menu.sections.forEach((section: any) => {
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item: any) => {
            dishes.push(processMenuItem(item, section.name));
          });
        }
      });
    } else if (menuData.sections && Array.isArray(menuData.sections)) {
      // Structure: { sections: [...] }
      menuData.sections.forEach((section: any) => {
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item: any) => {
            dishes.push(processMenuItem(item, section.name));
          });
        }
      });
    } else if (menuData.items && Array.isArray(menuData.items)) {
      // Structure: { items: [...] }
      menuData.items.forEach((item: any) => {
        dishes.push(processMenuItem(item));
      });
    } else if (Array.isArray(menuData)) {
      // Structure: [...]
      menuData.forEach((item: any) => {
        dishes.push(processMenuItem(item));
      });
    }
  } catch (error) {
    console.error('Error extracting dishes from menu:', error);
  }

  return dishes;
}

function processMenuItem(item: any, sectionName?: string): any {
  return {
    name: item.name || item.title || 'Unknown Dish',
    price: item.price || null,
    ingredients: item.ingredients || [],
    recipe: item.recipe || item.description || '',
    prep_time: item.prep_time || item.prepTime || null,
    section: sectionName || 'Unknown Section',
    category: item.category || sectionName || 'Unknown'
  };
}