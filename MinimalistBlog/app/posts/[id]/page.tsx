import { getPostData, getSortedPostsData } from '../../../lib/posts'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import VoteButtons from '../../VoteButtons'
import React from 'react'

export async function generateStaticParams() {
  try {
    const posts = getSortedPostsData()
    return posts.map((post) => ({
      id: post.id,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function Post({ params }: { params: { id: string } }) {
  try {
    const postData = await getPostData(params.id)

    return (
      <article className="prose lg:prose-xl">
        <h1>{postData.title}</h1>
        <div className="flex items-center justify-between text-gray-500 mb-4">
          <span>{postData.date}</span>
          <VoteButtons id={postData.id} votes={postData.votes} />
        </div>
        <ReactMarkdown>{postData.content}</ReactMarkdown>
      </article>
    )
  } catch (error) {
    console.error("Error fetching post data:", error)
    notFound()
  }
}

