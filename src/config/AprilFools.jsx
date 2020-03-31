import React from 'react';
import { Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, Button, Snackbar } from '@material-ui/core';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const isTrue = str => (str.toLowerCase() === 'true');

export default class AprilFools extends React.Component {
  constructor() {
    super();
    const shown = localStorage.getItem('april-fools-shown');
    this.state = {
      open: false,
      shown: shown !== null ? isTrue(shown) : false,
      snack: false,
    };
  }

  stopSquirrel = async () => {
    this.setState({ snack: false });
    await document.getElementById('zarathustra').pause();
    document.getElementById('squirrel').classList.remove('show-squirrel');
  }

  goGoGadgetSquirrel = async () => {
    this.setState({ open: false });
    localStorage.setItem('april-fools-shown', 'true');
    await document.getElementById('zarathustra').play();
    document.getElementById('squirrel').classList.add('show-squirrel');
    await sleep(12000);
    this.setState({ snack: true });
  };

  openDialog = async () => {
    if (!this.state.shown) {
      await sleep(2000);
      this.setState({ open: true, shown: true });
    }
  };

  render() {
    this.openDialog();
    return (
      <React.Fragment>
        <div id="squirrel-container">
          <img id="squirrel" className="hide-squirrel" src="/images/squirrel.png" /> {/* eslint-disable-line */}
          <audio id="zarathustra"> {/* eslint-disable-line */}
            <source src="/zarathustra.mp3" />
          </audio>
        </div>
        <Dialog
          open={this.state.open}
        >
          <DialogTitle>Enable Akkeris beta features?</DialogTitle>
          <DialogContent>
            <DialogContentText>
                Would you like to opt-in to new Akkeris beta features?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.goGoGadgetSquirrel} color="secondary">Disagree</Button>
            <Button onClick={this.goGoGadgetSquirrel} color="primary">Agree</Button>
          </DialogActions>
        </Dialog>
        <div>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.snack}
            action={(
              <Button color="secondary" size="small" onClick={this.stopSquirrel}>Stop</Button>
            )}
            message="April Fools!"
          />
        </div>
      </React.Fragment>
    );
  }
}
