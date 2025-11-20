import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Autocomplete,
  Paper,
  Stack
} from '@mui/material';
import './App.css';

const fruitOptions = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
  'Honeydew'
];

function App() {
  const [checked, setChecked] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [selectedFruit, setSelectedFruit] = useState(null);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          PlayAct - Material UI Testing Demo
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Stack spacing={4}>
            {/* Checkbox Section */}
            <Box data-testid="checkbox-section" id="checkbox-section">
              <Typography variant="h5" gutterBottom id="checkbox-heading">
                Checkbox Component
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    slotProps={{ input: { 'aria-label': 'Accept terms' } }}
                    id="accept-checkbox"
                    data-testid="accept-checkbox"
                  />
                }
                label="I accept the terms and conditions"
                id="accept-checkbox-label"
              />
              <Typography
                variant="body2"
                sx={{ mt: 1 }}
                data-testid="checkbox-status"
                id="checkbox-status"
              >
                Status: {checked ? 'Accepted' : 'Not Accepted'}
              </Typography>
            </Box>

            {/* TextField Section */}
            <Box data-testid="textfield-section" id="textfield-section">
              <Typography variant="h5" gutterBottom id="textfield-heading">
                TextField Component
              </Typography>
              <TextField
                fullWidth
                label="Enter your name"
                variant="outlined"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                helperText={`Character count: ${textValue.length}`}
                slotProps={{
                  htmlInput: {
                    'data-testid': 'name-input',
                    id: 'name-input'
                  }
                }}
              />
              {textValue && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                  data-testid="textfield-output"
                  id="textfield-output"
                >
                  Hello, {textValue}!
                </Typography>
              )}
            </Box>

            {/* Autocomplete Section */}
            <Box data-testid="autocomplete-section" id="autocomplete-section">
              <Typography variant="h5" gutterBottom id="autocomplete-heading">
                Autocomplete Component
              </Typography>
              <Autocomplete
                options={fruitOptions}
                value={selectedFruit}
                onChange={(event, newValue) => setSelectedFruit(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select a fruit"
                    slotProps={{
                      htmlInput: {
                        ...params.inputProps,
                        'data-testid': 'fruit-autocomplete-input',
                        id: 'fruit-autocomplete-input'
                      }
                    }}
                    id="fruit-autocomplete-textfield"
                  />
                )}
                data-testid="fruit-autocomplete"
                id="fruit-autocomplete"
              />
              {selectedFruit && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                  data-testid="autocomplete-output"
                  id="autocomplete-output"
                >
                  You selected: {selectedFruit}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
