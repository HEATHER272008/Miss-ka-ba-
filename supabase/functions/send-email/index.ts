import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to_email: string;
  to_name: string;
  student_name: string;
  status: string;
  time: string;
}

const getStatusMessage = (status: string, studentName: string): string => {
  switch (status) {
    case "present":
      return `Good day, Ma'am/Sir! Your son/daughter, ${studentName}, has safely arrived at school.`;
    case "late":
      return `Good day, Ma'am/Sir! Your son/daughter, ${studentName}, has arrived late at school. Please ensure timely arrival in the future.`;
    case "absent":
      return `Good day, Ma'am/Sir! Your son/daughter, ${studentName}, was marked absent today. If this is an error, please contact the school administration.`;
    case "half_day":
      return `Good day, Ma'am/Sir! Your son/daughter, ${studentName}, was marked for half-day attendance today.`;
    case "welcome":
      return `Welcome to Holy Cross of Davao College Attendance System! Your account has been successfully created. You can now use the app to track attendance and receive notifications.`;
    default:
      return `Good day, Ma'am/Sir! Your son/daughter, ${studentName}, has safely arrived at school.`;
  }
};

const getSubject = (status: string, studentName: string): string => {
  switch (status) {
    case "present":
      return `✅ ${studentName} has arrived at school`;
    case "late":
      return `⚠️ ${studentName} arrived late at school`;
    case "absent":
      return `🚫 ${studentName} was marked absent`;
    case "half_day":
      return `📝 ${studentName} - Half Day Attendance`;
    case "welcome":
      return `Welcome to Holy Cross of Davao College!`;
    default:
      return `Attendance Update for ${studentName}`;
  }
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("[send-email] RESEND_API_KEY is missing");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);

    const { to_email, to_name, student_name, status, time }: EmailRequest =
      await req.json();

    if (!to_email || !student_name || !status) {
      throw new Error("to_email, student_name, and status are required");
    }

    const message = getStatusMessage(status, student_name);
    const subject = getSubject(status, student_name);

    console.log("[send-email] sending via Resend", {
      to_email,
      to_name,
      student_name,
      status,
    });

    const emailResponse = await resend.emails.send({
      from: "Holy Cross of Davao College <onboarding@resend.dev>",
      to: [to_email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e40af;">Holy Cross of Davao College</h1>
            <p style="color: #6b7280;">Attendance Notification System</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #374151; margin: 0;">
              Dear ${to_name || "Parent/Guardian"},
            </p>
            <p style="font-size: 16px; color: #374151; margin-top: 16px;">
              ${message}
            </p>
            ${time ? `<p style="font-size: 14px; color: #6b7280; margin-top: 16px;">Time: ${time}</p>` : ""}
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message from CathoLink Attendance System.</p>
            <p>Holy Cross of Davao College</p>
          </div>
        </div>
      `,
    });

    console.log("[send-email] Resend response:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        provider: "resend",
        id: emailResponse.data?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
