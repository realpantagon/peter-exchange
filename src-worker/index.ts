import { Hono } from 'hono'
import { cors } from "hono/cors"
import { createClient } from '@supabase/supabase-js'
import { zValidator } from '@hono/zod-validator';
import z from 'zod';

function getSupabase(c: any) {
    return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
}

const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("/*", cors())
    .get('/public/rates', async (c) => {
        const client = getSupabase(c)

        const { data, error } = await client
            .from('Peter_Exchange_Rate')
            .select('id, Currency, Cur, Rate')
            .order('id')

        if (error) return c.json({ error: error.message }, 500)

        return c.json(data)
    })
    .get('/public/rates/:id', async (c) => {
        const client = getSupabase(c)
        const id = c.req.param('id')

        const { data, error } = await client
            .from('Peter_Exchange_Rate')
            .select('id, Currency, Cur, Rate')
            .eq('id', id)

        if (error) return c.json({ error: error.message }, 500)

        return c.json(data)
    })
    .put('/public/rates/:id',
        zValidator("param", z.object({
            id: z.coerce.number()
        })),
        zValidator("json", z.object({
            Rate: z.coerce.number().positive()
        })),
        async (c) => {

            const client = getSupabase(c)
            const { id } = c.req.valid("param")

            try {
                const { Rate } = await c.req.valid("json")

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

export type AppType = typeof app;