'use client'

import { useState } from 'react'
import { handleVote } from './actions'
import { ArrowUp, ArrowDown } from 'lucide-react'
import React from 'react'

const getUpdatedVotes = async (id: string) => {
  try {
    const response = await fetch(`/api/votes/${id}`)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to fetch votes: ${errorData.error}. Details: ${errorData.details}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching votes:", error)
    throw error
  }
}

export default function VoteButtons({
  id,
  votes: initialVotes,
  initialUserVote,
}: { id: string; votes: number; initialUserVote: boolean }) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      const newVoteState = !userVote
      const voteChange = newVoteState ? 1 : -1

      // Optimistically update the UI
      setUserVote(newVoteState)
      setVotes(votes + voteChange)

      // Send the vote to the server
      await handleVote(id, newVoteState)

      // Fetch the updated votes from the server
      const updatedVotes = await getUpdatedVotes(id)
      setVotes(updatedVotes.total)
      setUserVote(updatedVotes.userVote)
      setError(null)
    } catch (error) {
      console.error("Error in handleClick:", error)
      setError("Failed to update vote. Please try again.")
      // Revert the optimistic update
      setUserVote(initialUserVote)
      setVotes(initialVotes)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleClick}
        className={`p-1 rounded-full transition-colors duration-200 hover:bg-gray-200 ${userVote ? "bg-gray-200" : ""}`}
        aria-label="Upvote"
      >
        <ArrowUp className={`w-6 h-6 ${userVote ? "text-blue-500" : "text-gray-500"}`} />
      </button>
      <span className="text-gray-700 font-medium">{votes}</span>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

