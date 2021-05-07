import { screen, render, fireEvent, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  CREATED_STATUS,
  ERROR_SERVER_STATUS,
  INVALID_REQUEST_STATUS,
} from '../const/httpStatus'
import Form from './Form'

describe('<Form />', () => {
  const server = setupServer(
    rest.post('/products', (req, res, ctx) => {
      const { name, size, type } = req.body

      if (name && size && type) {
        return res(ctx.status(CREATED_STATUS))
      }
      return res(ctx.status(ERROR_SERVER_STATUS))
    }),
  )

  beforeAll(() => server.listen())

  afterAll(() => server.close())

  beforeEach(() => render(<Form />))

  afterEach(() => server.resetHandlers())

  describe('when the form is mounted', () => {
    it('should there must be a create product form page', () => {
      expect(
        screen.getByRole('heading', { name: /create product/i }),
      ).toBeInTheDocument()
    })

    it('should exists the fields: name, size, type (electronic, furniture, clothing)', () => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/size/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
      expect(screen.queryByText(/electronic/i)).toBeInTheDocument()
      expect(screen.queryByText(/furniture/i)).toBeInTheDocument()
      expect(screen.queryByText(/clothing/i)).toBeInTheDocument()
    })

    it('should exists the submit button', () => {
      expect(
        screen.getByRole('button', { name: /submit/i }),
      ).toBeInTheDocument()
    })
  })

  describe('when the user submits the form without values', () => {
    it('should display validation messages', async () => {
      expect(
        screen.queryByText(/the name is required/i),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/the size is required/i),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/the type is required/i),
      ).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      expect(screen.queryByText(/the name is required/i)).toBeInTheDocument()
      expect(screen.queryByText(/the size is required/i)).toBeInTheDocument()
      expect(screen.queryByText(/the type is required/i)).toBeInTheDocument()

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /submit/i }),
        ).not.toBeDisabled(),
      )
    })
  })

  // If the user blurs a field that is empty, then the form must display the
  //   required message for that field.
  describe('when the user blurs an empty field', () => {
    it('should display a validation error message for the input name', () => {
      expect(
        screen.queryByText(/the name is required/i),
      ).not.toBeInTheDocument()

      fireEvent.blur(screen.getByLabelText(/name/i), {
        target: { name: 'name', value: '' },
      })

      expect(screen.queryByText(/the name is required/i)).toBeInTheDocument()
    })

    it('should display a validation error message for the input size', () => {
      expect(
        screen.queryByText(/the size is required/i),
      ).not.toBeInTheDocument()

      fireEvent.blur(screen.getByLabelText(/size/i), {
        target: { name: 'size', value: '' },
      })

      expect(screen.queryByText(/the size is required/i)).toBeInTheDocument()
    })
  })

  describe('when the user submits the form properly and the server returns created status', () => {
    it('should the submit button be disabled until the request is done', async () => {
      const submitButton = screen.getByRole('button', { name: /submit/i })

      expect(submitButton).not.toBeDisabled()

      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()

      await waitFor(() => expect(submitButton).not.toBeDisabled())
    })

    it('should the form page must display the success message “Product stored”_ and clean the fields values.', async () => {
      const nameInput = screen.getByLabelText(/name/i)
      const sizeInput = screen.getByLabelText(/size/i)
      const typeSelect = screen.getByLabelText(/type/i)

      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'My product' },
      })
      fireEvent.change(sizeInput, {
        target: { name: 'size', value: '10' },
      })
      fireEvent.change(typeSelect, {
        target: { name: 'type', value: 'electronic' },
      })

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() =>
        expect(screen.getByText(/product stored/i)).toBeInTheDocument(),
      )

      expect(nameInput).toHaveValue('')
      expect(sizeInput).toHaveValue('')
      expect(typeSelect).toHaveValue('')
    })
  })

  describe('when the user submits the form and the server returns an unexpected error', () => {
    it('should the form page must display the error message _“Unexpected error, please try again”', async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() =>
        expect(
          screen.getByText(/unexpected error, please try again/i),
        ).toBeInTheDocument(),
      )
    })
  })

  describe('when the user submits the form and the server returns an invalid request error', () => {
    it('should the form page must display the error message “The form is invalid, the fields name, size, type are required”', async () => {
      server.use(
        rest.post('/products', (req, res, ctx) => {
          return res(
            ctx.status(INVALID_REQUEST_STATUS),
            ctx.json({
              message:
                'The form is invalid, the fields name, size, type are required',
            }),
          )
        }),
      )

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() =>
        expect(
          screen.getByText(
            /the form is invalid, the fields name, size, type are required/i,
          ),
        ).toBeInTheDocument(),
      )
    })
  })

  describe('when the user submits the form and the server returns an invalid request error', () => {
    it('should the form page must display the error message “The form is invalid, the fields name, size, type are required”', async () => {
      server.use(
        rest.post('/products', (req, res) =>
          res.networkError('Connection error, please try later'),
        ),
      )

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() =>
        expect(
          screen.getByText(/connection error, please try later/i),
        ).toBeInTheDocument(),
      )
    })
  })
})
