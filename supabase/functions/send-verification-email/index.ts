import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  dishesData: any[];
  purpose?: 'unlock-analysis' | 'download-report';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, dishesData, purpose = 'unlock-analysis' }: VerificationRequest = await req.json();

    if (!email || !dishesData) {
      return new Response(
        JSON.stringify({ error: "Email and dishes data are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store verification record
    const { error: dbError } = await supabase
      .from('dish_analysis_verifications')
      .insert({
        email,
        verification_token: verificationToken,
        dishes_data: dishesData,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification record" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate email content based on purpose
    let emailContent;
    let subject;
    
    if (purpose === 'download-report') {
      // For download report, generate comprehensive report content
      const dishName = dishesData[0]?.standard?.dishName || dishesData[0]?.dishName || 'Your Dishes';
      
      subject = "Your Complete Dish Analysis Report";
      emailContent = generateReportEmailHTML(dishesData, dishName);
    } else {
      // For unlock analysis, use verification flow
      const verificationUrl = `${req.headers.get('origin') || 'https://lovable.app'}/dish-analysis-results?verify=${verificationToken}`;
      subject = "Unlock Your Complete Dish Analysis";
      emailContent = generateVerificationEmailHTML(dishesData, verificationUrl);
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "MenuProfitMax <onboarding@resend.dev>",
      to: [email],
      subject,
      html: emailContent,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Verification email sent successfully to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully",
        verificationToken // Include for testing purposes
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

// Generate verification email HTML
function generateVerificationEmailHTML(dishesData: any[], verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unlock Your Dish Analysis</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a202c; font-size: 28px; font-weight: bold; margin: 0;">
            🍽️ MenuProfitMax
          </h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
            Your Analysis is Ready!
          </h2>
          <p style="color: #e2e8f0; font-size: 16px; margin: 0; line-height: 1.5;">
            We've completed the analysis of your ${dishesData.length} dishes. Click below to unlock your complete results.
          </p>
        </div>
        
        <div style="margin-bottom: 32px;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; width: 100%; box-sizing: border-box;">
            🔓 Verify & Unlock Analysis
          </a>
        </div>
        
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <h3 style="color: #334155; font-size: 18px; margin: 0 0 12px 0;">What you'll get:</h3>
          <ul style="color: #64748b; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Complete profit optimization suggestions for all dishes</li>
            <li>Detailed cost breakdowns and margin analysis</li>
            <li>Monthly earnings projections</li>
            <li>Actionable recommendations to boost profitability</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">
            This verification link expires in 24 hours.<br>
            If you didn't request this analysis, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate report email HTML with comprehensive analysis
function generateReportEmailHTML(dishesData: any[], dishName: string): string {
  const data = dishesData[0];
  const strategies = data.standard ? [data.standard, data.highMargin, data.premium] : [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Dish Analysis Report</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f8fafc;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1a202c; font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">
            🍽️ MenuProfitMax Report
          </h1>
          <h2 style="color: #4f46e5; font-size: 24px; margin: 0; text-transform: capitalize;">
            ${dishName} Analysis
          </h2>
        </div>
        
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 40px;">
          <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 16px 0;">
            📊 Executive Summary
          </h3>
          <p style="color: #e2e8f0; font-size: 16px; margin: 0; line-height: 1.6;">
            Your comprehensive dish analysis reveals optimization opportunities that could significantly boost your profitability. Review the detailed strategies below.
          </p>
        </div>
        
        ${strategies.length > 0 ? `
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1a202c; font-size: 20px; margin: 0 0 24px 0; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">
            💰 Pricing Strategy Comparison
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: 600;">Strategy</th>
                <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right; font-weight: 600;">Price</th>
                <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right; font-weight: 600;">Food Cost</th>
                <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right; font-weight: 600;">Profit</th>
              </tr>
            </thead>
            <tbody>
              ${strategies.map(strategy => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: 500;">${strategy.strategy || 'Standard'}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">£${Number(strategy.price || 0).toFixed(2)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">£${Number(strategy.foodCost || 0).toFixed(2)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right; color: #059669; font-weight: 600;">£${(Number(strategy.price || 0) - Number(strategy.foodCost || 0) - Number(strategy.prepLabor || 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.appetizers && data.appetizers.length > 0 ? `
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1a202c; font-size: 20px; margin: 0 0 24px 0; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">
            🥗 High-Margin Appetizer Suggestions
          </h3>
          ${data.appetizers.slice(0, 3).map((appetizer: any) => `
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1a202c; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">${appetizer.starter}</h4>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">${appetizer.whyItWorks}</p>
              <div style="display: flex; gap: 16px; font-size: 12px; color: #4f46e5; font-weight: 500;">
                <span>Cost: ${appetizer.ingredientCost}</span>
                <span>Margin Potential: ${appetizer.marginPotential}/5</span>
                <span>Premium Value: ${appetizer.perceivedPremium}/5</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${data.toppings && data.toppings.length > 0 ? `
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1a202c; font-size: 20px; margin: 0 0 24px 0; border-bottom: 2px solid #4f46e5; padding-bottom: 8px;">
            🧂 Up-sell Toppings & Extras
          </h3>
          ${data.toppings.slice(0, 3).map((topping: any) => `
            <div style="background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1a202c; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">${topping.name}</h4>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">${topping.whyItWorks}</p>
              <div style="display: flex; gap: 16px; font-size: 12px; color: #7c3aed; font-weight: 500;">
                <span>Cost: ${topping.ingredientCost}</span>
                <span>Margin Potential: ${topping.marginPotential}/5</span>
                <span>Premium Value: ${topping.perceivedPremium}/5</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 24px; margin-bottom: 40px;">
          <h3 style="color: #166534; font-size: 18px; margin: 0 0 16px 0;">🎯 Key Recommendations</h3>
          <ul style="color: #15803d; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Implement high-margin pricing strategy to increase profitability</li>
            <li>Introduce complementary appetizers to boost average order value</li>
            <li>Offer premium toppings and extras for additional revenue</li>
            <li>Monitor food costs regularly to maintain optimal margins</li>
            <li>Test pricing strategies with customer feedback and sales data</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding-top: 32px; border-top: 2px solid #e2e8f0;">
          <h3 style="color: #1a202c; font-size: 18px; margin: 0 0 16px 0;">Ready to Optimize Your Menu?</h3>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
            This analysis provides actionable insights to boost your restaurant's profitability.<br>
            Start implementing these strategies today to see results.
          </p>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.4;">
              <strong>📧 Report generated by MenuProfitMax</strong><br>
              For questions or support, contact us at support@menuprofitmax.com
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);