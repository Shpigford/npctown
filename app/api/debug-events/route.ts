import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a debug endpoint to test event creation
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to insert a test event
    const { data, error } = await supabase
      .from('events')
      .insert({
        type: 'system',
        description: 'Debug test event',
        metadata: { test: true, timestamp: new Date().toISOString() }
      })
      .select()

    if (error) {
      console.error('Failed to create test event:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }

    // Try to fetch recent events
    const { data: recentEvents, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('Failed to fetch events:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: 'Created event but failed to fetch',
        createdEvent: data,
        fetchError: fetchError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      createdEvent: data,
      recentEvents,
      totalEvents: recentEvents?.length || 0
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error',
      details: error
    }, { status: 500 })
  }
}