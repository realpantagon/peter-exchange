import { Hono } from 'hono'
import { cors } from "hono/cors"
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>()

app.use("/*", cors())

function getSupabase(c: any) {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET /public/rates
app.get('/public/rates', async (c) => {
  const client = getSupabase(c)

  const { data, error } = await client
    .from('Peter_Exchange_Rate')
    .select('id, Currency, Cur, Rate')
    .order('id')

  if (error) return c.json({ error: error.message }, 500)

  return c.json(data)
})

export default app;