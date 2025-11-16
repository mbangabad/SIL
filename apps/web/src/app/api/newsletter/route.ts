/**
 * Newsletter API Endpoint
 * Handles email subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/newsletter
 * Subscribe an email to the newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Integration options:
    // 1. Store in database:
    //    await db.newsletter.create({ data: { email, subscribedAt: new Date() } });
    //
    // 2. Send to email service (Mailchimp):
    //    await mailchimp.lists.addListMember(AUDIENCE_ID, { email_address: email });
    //
    // 3. Send to ConvertKit:
    //    await fetch('https://api.convertkit.com/v3/forms/FORM_ID/subscribe', {
    //      method: 'POST',
    //      headers: { 'Content-Type': 'application/json' },
    //      body: JSON.stringify({ api_key: API_KEY, email }),
    //    });

    // For now, just log it
    console.log('[Newsletter] New subscriber:', email);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
    });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
