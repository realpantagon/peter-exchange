import { Hono } from 'hono'
import { cors } from "hono/cors"
import { createClient } from '@supabase/supabase-js'
import { zValidator } from '@hono/zod-validator';
import z from 'zod';

// Transaction validation schemas
const createTransactionSchema = z.object({
    Currency: z.string(),
    Cur: z.string(),
    Rate: z.string(),
    Amount: z.string(),
    Total_TH: z.string(),
    Branch: z.string().optional(),
    Transaction_Type: z.enum(['Buying', 'Selling']),
    Customer_Passport_no: z.string().optional(),
    Customer_Nationality: z.string().optional(),
    Customer_Name: z.string().optional()
});

const updateTransactionSchema = z.object({
    Currency: z.string().optional(),
    Cur: z.string().optional(),
    Rate: z.string().optional(),
    Amount: z.string().optional(),
    Total_TH: z.string().optional(),
    Branch: z.string().optional(),
    Transaction_Type: z.enum(['Buying', 'Selling']).optional(),
    Customer_Passport_no: z.string().optional(),
    Customer_Nationality: z.string().optional(),
    Customer_Name: z.string().optional()
});

function getSupabase(c: any) {
    return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
}

const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("/*", cors())
    .get('/public/rates', async (c) => {
        const client = getSupabase(c)
        // const branchId = c.req.query('branchid') // Future use: filter rates by branch

        // Note: If you want to filter rates by branch, you'll need to add Branch column to Peter_Exchange_Rate table
        // For now, just returning all rates regardless of branch parameter
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
            Rate: z.coerce.string()
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

    // Transaction CRUD endpoints

    // GET all transactions
    .get('/public/transactions', async (c) => {
        const client = getSupabase(c)
        const branchId = c.req.query('branchid')

        let query = client
            .from('Peter_Exchange_Transaction')
            .select('*')
            .order('created_at', { ascending: false })

        // Filter by branch if provided
        if (branchId) {
            query = query.eq('Branch', branchId)
        }

        const { data, error } = await query

        if (error) return c.json({ error: error.message }, 500)

        return c.json(data)
    })

    // GET single transaction
    .get('/public/transactions/:id', async (c) => {
        const client = getSupabase(c)
        const id = c.req.param('id')

        const { data, error } = await client
            .from('Peter_Exchange_Transaction')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return c.json({ error: error.message }, 500)

        return c.json(data)
    })

    // POST new transaction
    .post('/public/transactions',
        zValidator("json", createTransactionSchema),
        async (c) => {
            const client = getSupabase(c)

            try {
                const transactionData = await c.req.valid("json")

                const { data, error } = await client
                    .from('Peter_Exchange_Transaction')
                    .insert([transactionData])
                    .select()

                if (error) return c.json({ error: error.message }, 500)

                if (!data || data.length === 0) {
                    return c.json({ error: 'Failed to create transaction' }, 500)
                }

                return c.json({ message: 'Transaction created successfully', data: data[0] }, 201)
            } catch (error) {
                return c.json({ error: 'Invalid JSON body' }, 400)
            }
        })

    // PUT update transaction
    .put('/public/transactions/:id',
        zValidator("param", z.object({
            id: z.coerce.number()
        })),
        zValidator("json", updateTransactionSchema),
        async (c) => {
            const client = getSupabase(c)
            const { id } = c.req.valid("param")

            try {
                const updateData = await c.req.valid("json")

                const { data, error } = await client
                    .from('Peter_Exchange_Transaction')
                    .update(updateData)
                    .eq('id', id)
                    .select()

                if (error) return c.json({ error: error.message }, 500)

                if (!data || data.length === 0) {
                    return c.json({ error: 'Transaction not found' }, 404)
                }

                return c.json({ message: 'Transaction updated successfully', data: data[0] })
            } catch (error) {
                return c.json({ error: 'Invalid JSON body' }, 400)
            }
        })

    // DELETE transaction
    .delete('/public/transactions/:id',
        zValidator("param", z.object({
            id: z.coerce.number()
        })),
        async (c) => {
            const client = getSupabase(c)
            const { id } = c.req.valid("param")

            const { data, error } = await client
                .from('Peter_Exchange_Transaction')
                .delete()
                .eq('id', id)
                .select()

            if (error) return c.json({ error: error.message }, 500)

            if (!data || data.length === 0) {
                return c.json({ error: 'Transaction not found' }, 404)
            }

            return c.json({ message: 'Transaction deleted successfully', data: data[0] })
        })

    // SPA fallback: Try to serve the asset, fallback to index.html if not found (and not an API call)
    .get('/*', async (c) => {
        const asset = await c.env.ASSETS.fetch(c.req.raw)
        
        if (asset.status === 404 && !c.req.path.startsWith('/public/')) {
            const url = new URL(c.req.url)
            url.pathname = '/index.html'
            return c.env.ASSETS.fetch(new Request(url, c.req.raw))
        }
        
        return asset
    })

export default app;

export type AppType = typeof app;