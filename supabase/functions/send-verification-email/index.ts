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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, dishesData }: VerificationRequest = await req.json();

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

    // Construct verification URL
    const verificationUrl = `${req.headers.get('origin') || 'https://lovable.app'}/dish-analysis-results?verify=${verificationToken}`;

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "Unlock Your Complete Dish Analysis",
      html: `
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
      `,
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

serve(handler);