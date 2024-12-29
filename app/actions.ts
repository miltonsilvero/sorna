'use server'

import { updateVotes } from '../lib/posts'
import { revalidatePath } from 'next/cache'

export async function handleVote(id: string, voteType: 'up' | 'down', isVoting: boolean) {
  updateVotes(id, voteType, isVoting)
  revalidatePath('/')
}

