import { useState } from 'react'
import { Button, InputLabel, Select, TextField } from '@material-ui/core'
import { saveProduct } from '../services/productServices'

const Form = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({
    name: '',
    size: '',
    type: '',
  })

  const validateField = ({ name, value }) => {
    setFormErrors(prevState => ({
      ...prevState,
      [name]: value.length ? '' : `The ${name} is required`,
    }))
  }

  const validateForm = ({ name, size, type }) => {
    validateField({ name: 'name', value: name })
    validateField({ name: 'size', value: size })
    validateField({ name: 'type', value: type })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setIsSaving(true)

    const { name, size, type } = e.target.elements

    validateForm({ name: name.value, size: size.value, type: type.value })

    await saveProduct()

    setIsSaving(false)
  }

  const handleBlur = e => {
    const { name, value } = e.target
    validateField({ name, value })
  }

  return (
    <>
      <h1>Create product</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          label="name"
          id="name"
          helperText={formErrors.name}
          name="name"
          onBlur={handleBlur}
        />
        <TextField
          label="size"
          id="size"
          name="size"
          helperText={formErrors.size}
          onBlur={handleBlur}
        />
        <InputLabel htmlFor="type">Type</InputLabel>
        <Select native value="" inputProps={{ name: 'type', id: 'type' }}>
          <option aria-label="None" value="" />
          <option value="electronic">Electronic</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
        </Select>
        {formErrors.type.length && <p>{formErrors.type}</p>}
        <Button disabled={isSaving} type="submit">
          Submit
        </Button>
      </form>
    </>
  )
}

export default Form
