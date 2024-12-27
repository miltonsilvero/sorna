import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')
const votesFile = path.join(process.cwd(), 'data', 'votes.json')

export function getSortedPostsData() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
    console.warn("'posts' directory was created as it did not exist.")
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      content: matterResult.content,
      ...(matterResult.data as { date: string; title: string }),
      votes: getVotes(id).total
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.votes !== b.votes) {
      return b.votes - a.votes // Sort by votes first
    }
    // If votes are equal, sort by date
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function getPostData(id: string) {
  if (!fs.existsSync(postsDirectory)) {
    throw new Error("Posts directory does not exist.")
  }

  const fullPath = path.join(postsDirectory, `${id}.md`)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post with id ${id} does not exist.`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  const votes = getVotes(id)

  return {
    id,
    content: matterResult.content,
    ...(matterResult.data as { date: string; title: string }),
    votes: votes.total,
    userVotes: votes.userVotes
  }
}

export function getVotes(id: string): { total: number; userVotes: { up: boolean; down: boolean } } {
  try {
    if (!fs.existsSync(votesFile)) {
      return { total: 0, userVotes: { up: false, down: false } }
    }
    const votesData = fs.readFileSync(votesFile, 'utf8')
    const votes = JSON.parse(votesData)
    const postVotes = votes[id] || { up: 0, down: 0, userVotes: { up: false, down: false } }
    return {
      total: postVotes.up - postVotes.down,
      userVotes: postVotes.userVotes
    }
  } catch (error) {
    console.error(`Error getting votes for post ${id}:`, error)
    return { total: 0, userVotes: { up: false, down: false } }
  }
}

export function updateVotes(id: string, voteType: 'up' | 'down', isVoting: boolean) {
  try {
    let votes = {}
    if (fs.existsSync(votesFile)) {
      const votesData = fs.readFileSync(votesFile, 'utf8')
      votes = JSON.parse(votesData)
    }
    if (!votes[id]) {
      votes[id] = { up: 0, down: 0, userVotes: { up: false, down: false } }
    }
    if (isVoting) {
      votes[id][voteType] += 1
    } else {
      votes[id][voteType] -= 1
    }
    votes[id].userVotes[voteType] = isVoting
    if (!fs.existsSync(path.dirname(votesFile))) {
      fs.mkdirSync(path.dirname(votesFile), { recursive: true })
    }
    fs.writeFileSync(votesFile, JSON.stringify(votes))
  } catch (error) {
    console.error(`Error updating votes for post ${id}:`, error)
    throw error
  }
}

