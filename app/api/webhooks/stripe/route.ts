import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

import { db } from '@/lib/db'
import { usersMetadata } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe/config'
import { PlanId,PLANS } from '@/lib/stripe/plans'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  switch (event.type) {
    case 'checkout.session.completed':
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      const customerId = session.customer as string
      const userId = session.client_reference_id as string
      const planId = session.metadata?.planId as PlanId

      if (userId && planId && PLANS[planId]) {
        await db
          .update(usersMetadata)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            plan: planId,
            usageLimit: PLANS[planId].quota === Infinity ? 999999 : PLANS[planId].quota
          })
          .where(eq(usersMetadata.id, userId))
      }
      break

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const updatedSub = event.data.object as Stripe.Subscription
      const updatedPlanId = updatedSub.metadata.planId as PlanId
      
      if (updatedSub.status === 'canceled' || updatedSub.status === 'unpaid') {
        await db
          .update(usersMetadata)
          .set({
            plan: 'anon',
            usageLimit: PLANS.anon.quota
          })
          .where(eq(usersMetadata.stripeSubscriptionId, updatedSub.id))
      } else if (updatedPlanId && PLANS[updatedPlanId]) {
        await db
          .update(usersMetadata)
          .set({
            plan: updatedPlanId,
            usageLimit: PLANS[updatedPlanId].quota === Infinity ? 999999 : PLANS[updatedPlanId].quota
          })
          .where(eq(usersMetadata.stripeSubscriptionId, updatedSub.id))
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return new NextResponse(null, { status: 200 })
}
