import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterChipGroup from '../components/shared/FilterChipGroup'

const OPTIONS = ['Fantasy', 'Romance', 'Thriller']

function setup(selected: string[] = []) {
  const onChange = vi.fn()
  render(
    <FilterChipGroup
      label="Genre"
      options={OPTIONS}
      selected={selected}
      onChange={onChange}
    />
  )
  return { onChange }
}

describe('FilterChipGroup', () => {
  it('renders the label', () => {
    setup()
    expect(screen.getByText('Genre')).toBeInTheDocument()
  })

  it('renders all options', () => {
    setup()
    for (const opt of OPTIONS) {
      expect(screen.getByText(opt)).toBeInTheDocument()
    }
  })

  it('calls onChange with item added when clicking unselected chip', async () => {
    const { onChange } = setup([])
    await userEvent.click(screen.getByText('Fantasy'))
    expect(onChange).toHaveBeenCalledWith(['Fantasy'])
  })

  it('calls onChange with item removed when clicking selected chip', async () => {
    const { onChange } = setup(['Fantasy', 'Romance'])
    await userEvent.click(screen.getByText('Fantasy'))
    expect(onChange).toHaveBeenCalledWith(['Romance'])
  })

  it('preserves other selections when adding a new item', async () => {
    const { onChange } = setup(['Romance'])
    await userEvent.click(screen.getByText('Fantasy'))
    expect(onChange).toHaveBeenCalledWith(['Romance', 'Fantasy'])
  })

  it('does not call onChange when not clicked', () => {
    const { onChange } = setup()
    expect(onChange).not.toHaveBeenCalled()
  })
})
