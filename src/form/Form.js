import {Button, InputLabel, Select, TextField} from '@material-ui/core'

const Form = () => (
  <>
    <h1>Create product</h1>
    <form>
      <TextField label="name" id="name" />
      <TextField label="size" id="size" />
      <InputLabel htmlFor="type">Type</InputLabel>
      <Select native value="" inputProps={{name: 'type', id: 'type'}}>
        <option aria-label="None" value="None" />
        <option value="electronic">Electronic</option>
        <option value="furniture">Furniture</option>
        <option value="clothing">Clothing</option>
      </Select>
      <Button>Submit</Button>
    </form>
  </>
)

export default Form
