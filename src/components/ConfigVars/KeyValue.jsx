import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Typography,
  IconButton,
  Button,
  Fab,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';


const style = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    maxWidth: 300,
    minWidth: 200,
    marginRight: 24,
    marginBottom: 12,
  },
  buttons: {
    div: {
      marginTop: 24,
      marginBottom: 24,
    },
    back: {
      marginRight: 12,
    },
  },
  stepDescription: {
    marginTop: '24px',
  },
  h6: {
    marginBottom: '12px',
  },
  bold: {
    fontWeight: 'bold',
  },
};

export default class KeyValue extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      errorText: null,
      key: '',
      values: props.values.length !== 0 ? this.props.values : [{ key: '', value: '' }],
    };
  }

  handleChange = (event) => {
    const values = [...this.state.values];
    values[parseInt(event.target.id[event.target.id.length - 1], 10)][event.target.id.substr(0, event.target.id.indexOf('-'))] = event.target.value;

    this.setState({ values }, () => console.log(this.state.values));
  }

  addConfig = (event) => {
    this.setState(prevState => ({
      values: [...prevState.values, { key: '', value: '' }],
    }));
  }

  removeConfig = (idx, event) => {
    let values = [...this.state.values];
    values.splice(idx, 1);
    this.setState({ values });
  }

  submitConfig = () => {
    this.props.onSubmit(this.state.values);
  }

  render() {
    const { errorText, values } = this.state;
    return (
      <div className={style.container} >

        {
          values.map((val, idx) => {
            const keyId = `key-${idx}`;
            const valueId = `value-${idx}`;

            return (
              <div key={idx}>
                <TextField
                  style={style.textField}
                  name={keyId}
                  id={keyId}
                  className="key"
                  label="Key"
                  onChange={this.handleChange}
                  error={!!errorText}
                  helperText={errorText || ''}
                  autoFocus
                  data-id={idx}
                  value={values[idx].key}
                  variant="filled"
                />
                <TextField
                  style={style.textField}
                  className="value"
                  label="Value"
                  multiline
                  fullWidth
                  onChange={this.handleChange}
                  error={!!errorText}
                  helperText={errorText || ''}
                  value={values[idx].value}
                  autoFocus
                  data-id={idx}
                  id={valueId}
                  name={valueId}
                  variant="filled"
                />
                {idx > 0 && (
                  <IconButton
                    className={`remove-${idx}`}
                    onClick={this.removeConfig.bind(this, idx)}
                    id={`button-${idx}`}
                  >
                    <RemoveIcon htmlColor="red" />
                  </IconButton>
                )}
              </div>
            );
          })
        }
        <Fab size="small" color="secondary" className="add-config" onClick={this.addConfig}><AddIcon htmlColor="white" /></Fab>

        <Typography variant="body2" style={style.stepDescription}>
          {'Add your config vars, they will appear in the ENV in a KEY=PAIR format'}
        </Typography>
        <Button
          style={style.buttons.div}
          variant="contained"
          className="next"
          color="primary"
          onClick={this.submitConfig}
        >{'Next'}</Button>
      </div>
    );
  }
}

KeyValue.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  values: PropTypes.array.isRequired
};
