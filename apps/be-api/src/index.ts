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

// PUT /public/rates/:id - Edit exchange rate
app.put('/public/rates/:id', async (c) => {
  const client = getSupabase(c)
  const id = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const { Rate } = body

    // Validate required field
    if (Rate === undefined) {
      return c.json({ error: 'Rate is required' }, 400)
    }

    // Validate Rate is a number
    if (typeof Rate !== 'number' || Rate <= 0) {
      return c.json({ error: 'Rate must be a positive number' }, 400)
    }

    const { data, error } = await client
      .from('Peter_Exchange_Rate')
      .update({ Rate })
      .eq('id', id)
      .select()

    if (error) return c.json({ error: error.message }, 500)

    if (!data || data.length === 0) {
      return c.json({ error: 'Rate not found' }, 404)
    }

    return c.json({ message: 'Rate updated successfully', data: data[0] })
  } catch (error) {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
})

export default app;