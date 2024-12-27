import { getVotes } from '../../../../lib/posts'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const votes = getVotes(params.id)
    return NextResponse.json(votes)
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json({ error: 'Failed to fetch votes', details: error.message }, { status: 500 })
  }
}

