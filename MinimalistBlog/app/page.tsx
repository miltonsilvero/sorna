import Link from 'next/link'
import { getSortedPostsData } from '../lib/posts'
import VoteButtons from './VoteButtons'
import React from 'react'

export default function Home() {
  const allPostsData = getSortedPostsData()

  return (
    <div>
      {allPostsData.length > 0 ? (
        <ul className="space-y-8">
          {allPostsData.map(({ id, date, title, content, votes }) => (
            <li key={id} className="border-b pb-8">
              <Link href={`/posts/${id}`} className="text-2xl font-semibold hover:underline">
                {title}
              </Link>
              <br />
              <small className="text-gray-500">{date}</small>
              <p className="mt-2 text-gray-700">
                {content.split(' ').slice(0, 30).join(' ')}...
              </p>
              <div className="flex items-center justify-between mt-4">
                <Link href={`/posts/${id}`} className="text-blue-600 hover:underline">
                  Read more
                </Link>
                <VoteButtons id={id} votes={votes} initialUserVotes={{ up: false, down: false }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-8">No posts found. Create a markdown file in the 'posts' directory to get started!</p>
      )}
    </div>
  )
}

