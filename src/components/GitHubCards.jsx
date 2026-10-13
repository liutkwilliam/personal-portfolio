import React from 'react'
import { Link } from 'react-router-dom'

export default function GitHubCards({ title, description, link }) {
  return (
    <div className="space-y-4">
      <p className='text-xl font-semibold'>{title}</p>
      <p>{description}</p>
      <Link href={link} />
    </div>
  )
}
