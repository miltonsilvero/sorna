'use server'

import { updateVotes } from '../lib/posts'
import { revalidatePath } from 'next/cache'

export async function handleVote(id: string, isVoting: boolean) {
  await updateVotes(id, isVoting)
  revalidatePath("/")
  revalidatePath(`/posts/${id}`)
}

