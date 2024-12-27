'use client'

import { useState } from 'react'
import { handleVote } from './actions'
import { ArrowUp, ArrowDown } from 'lucide-react'
import React from 'react'

const getUpdatedVotes = async (id: string) => {
  try {
    const response = await fetch(`/api/votes/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch votes: ${errorData.error}. Details: ${errorData.details}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching votes:', error);
    throw error;
  }
};

export default function VoteButtons({ id, votes: initialVotes, initialUserVotes = { up: false, down: false } }: { id: string; votes: number; initialUserVotes?: { up: boolean; down: boolean } }) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVotes, setUserVotes] = useState(initialUserVotes)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (voteType: 'up' | 'down') => {
    try {
      const newUserVotes = { ...userVotes, [voteType]: !(userVotes && userVotes[voteType]) };
      const voteChange = newUserVotes[voteType] ? 1 : -1;
      const newTotalVotes = voteType === 'up' ? votes + voteChange : votes - voteChange;

      // Optimistically update the UI
      setUserVotes(newUserVotes);
      setVotes(newTotalVotes);

      // Send the vote to the server
      await handleVote(id, voteType, newUserVotes[voteType]);

      // Fetch the updated votes from the server
      const updatedVotes = await getUpdatedVotes(id);
      setVotes(updatedVotes.total);
      setUserVotes(updatedVotes.userVotes);
      setError(null);
    } catch (error) {
      console.error('Error in handleClick:', error);
      setError('Failed to update votes. Please try again.');
      // Revert the optimistic update
      setUserVotes(initialUserVotes);
      setVotes(initialVotes);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleClick('up')}
          className={`p-1 rounded-full transition-colors duration-200 hover:bg-gray-200 ${
            userVotes && userVotes.up ? 'bg-gray-200' : ''
          }`}
          aria-label="Upvote"
        >
          <ArrowUp className={`w-6 h-6 ${userVotes && userVotes.up ? 'text-blue-500' : 'text-gray-500'}`} />
        </button>
        <span className="text-gray-700 font-medium">{votes}</span>
        <button
          onClick={() => handleClick('down')}
          className={`p-1 rounded-full transition-colors duration-200 hover:bg-gray-200 ${
            userVotes && userVotes.down ? 'bg-gray-200' : ''
          }`}
          aria-label="Downvote"
        >
          <ArrowDown className={`w-6 h-6 ${userVotes && userVotes.down ? 'text-red-500' : 'text-gray-500'}`} />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

