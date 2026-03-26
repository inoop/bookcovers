import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CoverCard from '../components/shared/CoverCard'
import type { BookCoverCardResponse } from '../api/types'

const base: BookCoverCardResponse = {
  id: 'cover-id',
  slug: 'garden-of-forgotten-things',
  title: 'The Garden of Forgotten Things',
  author_name: 'Isabelle Moreau',
  primary_image_url: undefined,
  contributors: [
    { id: 'c1', contributor_name: 'Elena Vasquez', contributor_type: 'illustrator' },
    { id: 'c2', contributor_name: 'Marcus Chen', contributor_type: 'designer' },
  ],
  genre_tags: [],
  audience_tags: [],
  visual_tags: [],
}

function renderCard(props: Partial<BookCoverCardResponse> = {}) {
  return render(
    <MemoryRouter>
      <CoverCard cover={{ ...base, ...props }} />
    </MemoryRouter>
  )
}

describe('CoverCard', () => {
  it('renders the title', () => {
    renderCard()
    expect(screen.getByText('The Garden of Forgotten Things')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    renderCard()
    expect(screen.getByText('Isabelle Moreau')).toBeInTheDocument()
  })

  it('uses slug in the link when available', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/covers/garden-of-forgotten-things')
  })

  it('falls back to id in the link when slug is absent', () => {
    renderCard({ slug: undefined })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/covers/cover-id')
  })

  it('renders contributors joined with ", "', () => {
    renderCard()
    expect(screen.getByText('Elena Vasquez, Marcus Chen')).toBeInTheDocument()
  })

  it('renders nothing for contributors when array is empty', () => {
    renderCard({ contributors: [] })
    expect(screen.queryByText(/,/)).not.toBeInTheDocument()
  })

  it('shows "No cover image" placeholder when primary_image_url is absent', () => {
    renderCard({ primary_image_url: undefined })
    expect(screen.getByText('No cover image')).toBeInTheDocument()
  })

  it('does not show the placeholder when an image url is provided', () => {
    renderCard({ primary_image_url: 'https://example.com/cover.jpg' })
    expect(screen.queryByText('No cover image')).not.toBeInTheDocument()
  })
})
