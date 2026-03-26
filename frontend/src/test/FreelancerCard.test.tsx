import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FreelancerCard from '../components/shared/FreelancerCard'
import type { FreelancerCardResponse } from '../api/types'

const base: FreelancerCardResponse = {
  id: 'abc-123',
  slug: 'elena-vasquez',
  name: 'Elena Vasquez',
  pronouns: 'she/her',
  summary: 'Award-winning illustrator.',
  current_locations: ['New York, NY', 'Mexico City'],
  style_tags: ['Illustration', 'Design', 'Photography', 'Typography'],
  audience_tags: ['Adult Fiction', 'Young Adult', 'Middle Grade'],
  featured: false,
}

function renderCard(props: Partial<FreelancerCardResponse> = {}) {
  return render(
    <MemoryRouter>
      <FreelancerCard freelancer={{ ...base, ...props }} />
    </MemoryRouter>
  )
}

describe('FreelancerCard', () => {
  it('renders the freelancer name', () => {
    renderCard()
    expect(screen.getByText('Elena Vasquez')).toBeInTheDocument()
  })

  it('uses slug in the link when available', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/freelancers/elena-vasquez')
  })

  it('falls back to id in the link when slug is absent', () => {
    renderCard({ slug: undefined })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/freelancers/abc-123')
  })

  it('renders pronouns when present', () => {
    renderCard()
    expect(screen.getByText('she/her')).toBeInTheDocument()
  })

  it('omits pronouns when absent', () => {
    renderCard({ pronouns: undefined })
    expect(screen.queryByText('she/her')).not.toBeInTheDocument()
  })

  it('renders locations joined with " / "', () => {
    renderCard()
    expect(screen.getByText('New York, NY / Mexico City')).toBeInTheDocument()
  })

  it('shows "No image" placeholder when there is no hero image', () => {
    renderCard({ hero_image_url: undefined })
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('shows at most 3 style tags', () => {
    renderCard({ style_tags: ['A', 'B', 'C', 'D', 'E'] })
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByText('D')).not.toBeInTheDocument()
  })

  it('shows at most 2 audience tags', () => {
    renderCard({ audience_tags: ['X', 'Y', 'Z'] })
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.queryByText('Z')).not.toBeInTheDocument()
  })

  it('renders without crashing when optional fields are absent', () => {
    renderCard({ style_tags: undefined, audience_tags: undefined, summary: undefined })
    expect(screen.getByText('Elena Vasquez')).toBeInTheDocument()
  })
})
