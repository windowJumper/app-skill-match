import { withSupabase } from 'npm:@supabase/server@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const authenticatedHandler = withSupabase({ auth: 'user' }, async (_request, context) => {
    const userId = context.userClaims?.sub;
    if (!userId) {
      return Response.json({ message: 'Sign in before deleting your account.' }, { status: 401, headers: corsHeaders });
    }

    try {
      const { error } = await context.supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        console.error('Account deletion failed:', error.message);
        return Response.json({ message: 'Your account could not be deleted. Contact support for help.' }, { status: 500, headers: corsHeaders });
      }

      return Response.json({ deleted: true }, { headers: corsHeaders });
    } catch (cause) {
      console.error('Account deletion request failed:', cause);
      return Response.json({ message: 'Your account could not be deleted. Contact support for help.' }, { status: 500, headers: corsHeaders });
    }
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ message: 'Method not allowed.' }, { status: 405, headers: corsHeaders });
  let response: Response;
  try {
    response = await authenticatedHandler(request);
  } catch (cause) {
    console.error('Account deletion handler failed:', cause);
    response = Response.json({ message: 'Your account could not be deleted. Contact support for help.' }, { status: 500, headers: corsHeaders });
  }
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
