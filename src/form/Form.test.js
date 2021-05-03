import {screen, render} from '@testing-library/react'
import Form from './Form'

describe('when the form is mounted', () => {
  it('should there must be a create product form page', () => {
    render(<Form />)
    expect(
      screen.getByRole('heading', {name: /create product/i}),
    ).toBeInTheDocument()
  })
})
