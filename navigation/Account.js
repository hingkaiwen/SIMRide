import React, { Component } from 'react';
import { Text, View } from 'react-native';
import firebase from '../firebase/base';
import 'firebase/firestore';
import "firebase/storage";
import {user} from './Login';

var clickedUser;
var Util = require('../util/Util');

class Account extends React.Component {
  constructor(props) {

    super(props);
    this.logout = this.logout.bind(this);
    this.submitEditProfile = this.submitEditProfile.bind(this);
    this.submitPassword = this.submitPassword.bind(this);
    this.applyDriver = this.applyDriver.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleImgChange = this.handleImgChange.bind(this);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
      isDriver: '',
      isAdmin: '',
      id: '',
      image: null,
      frontURL: '',
      backURL: '',
      progress: 0
    };
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleImgChange = e => {
    if (e.target.files[0]) {
      const image = e.target.files[0];
      this.setState(() => ({
        image
      }));
    }
  };

  handleFrontUpload = () => {
    const { image } = this.state;
    if (image != null) {
      const uploadTask = firebase.storage().ref().child(`license/${user[7]}/front`).put(image);
      uploadTask.on(
        "state_changed",
        snapshot => {
          // progress function ...
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this.setState({
            progress
          });
          console.log('Upload is ' + progress + '% done');
        },
        error => {
          // Error function ...
          alert('Error: ' + error)
          console.log(error);
        },
        () => {
          // complete function ...
          alert('Image is uploaded!');
          document.getElementById('btnImgFrontUpload').style.display = 'none';
          document.getElementById('btnImgBackUpload').style.display = 'inline-block';
          document.getElementById('td_license').innerHTML = 'License Back:';
          document.getElementById('file').value = "";
          firebase.storage()
            .ref("license/" + user[7])
            .child("front")
            .getDownloadURL()
            .then(frontURL => {
              this.setState({
                frontURL
              });
            });
        }
      );
    }
    else {
      alert('Error: No file selected');
    }
  };

  handleBackUpload = () => {
    const { image } = this.state;
    if (image != null) {
      const uploadTask = firebase.storage().ref().child(`license/${user[7]}/back`).put(image);
      uploadTask.on(
        "state_changed",
        snapshot => {
          // progress function ...
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this.setState({
            progress
          });
          console.log('Upload is ' + progress + '% done');
        },
        error => {
          // Error function ...
          console.log(error);
        },
        () => {
          // complete function ...
          alert('Image is uploaded!')
          firebase.storage()
            .ref("license/" + user[7])
            .child("back")
            .getDownloadURL()
            .then(backURL => {
              this.setState({
                backURL
              });
            });
        }
      );
    }
    else {
      alert('Error: No file selected');
    }
  };

  // goes back to login page if stumble upon another page by accident without logging in
  componentDidMount() {
    if (typeof user[3] === 'undefined') {
      firebase.auth().signOut();
    }
    else {
      if (user[4].toString().toLowerCase() === "no") {
        document.getElementById('btnApplyDriver').style.display = "block";
      }
    }
  }

  logout() {
    user[0] = '';
    user[1] = '';
    user[2] = '';
    user[3] = '';
    user[4] = '';
    user[5] = '';
    user[6] = '';
    user[7] = '';

    console.log(user.email);
    firebase.auth().signOut();
  }

  editProfile() {
    Util.editProfile();
  }

  submitEditProfile(e) {
    e.preventDefault();
    if (this.state.firstName != "" && this.state.lastName != "") {
      user[0] = this.state.firstName;
      user[1] = this.state.lastName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            fname: user[0]
          })
          snapshot.ref.update({
            lname: user[1]
          })
        });

      //Util.updateProfile(user[3], user[0], user[1], user[7]);
    }

    else if (this.state.firstName != "" && this.state.lastName === "") {
      user[0] = this.state.firstName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            fname: user[0]
          })
        });
    }

    else if (this.state.firstName == "" && this.state.lastName != "") {
      user[1] = this.state.lastName;

      const accountsRef = firebase.database().ref('accounts/' + user[7]);
      accountsRef.orderByChild('email')
        .equalTo(user[3])
        .once('value')
        .then(function (snapshot) {
          snapshot.ref.update({
            lname: user[1]
        })
      });
    }

    else {
      alert("Account was not updated.")
    }
    document.getElementById('lblfName').innerHTML = user[0];
    document.getElementById('lbllName').innerHTML = user[1];

    Util.profilePageReset();

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  cancelEditProfile() {
    Util.profilePageReset();

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  changePassword() {
    document.getElementById('tblProfile').style.display = 'none';
    document.getElementById('tblPassword').style.display = 'block';
    document.getElementById('tblApplyDriver').style.display = 'none';

    document.getElementById('lblfName').style.display = 'none';
    document.getElementById('lbllName').style.display = 'none';

    document.getElementById('editfName').style.display = 'none';
    document.getElementById('editlName').style.display = 'none';

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('changePasswordButton').style.display = 'none';
    document.getElementById('submitEditButton').style.display = 'none';
    document.getElementById('cancelEditButton').style.display = 'none';
    document.getElementById('submitPasswordButton').style.display = 'inline';
    document.getElementById('cancelPasswordButton').style.display = 'inline';

    document.getElementById('editfName').value = "";
    document.getElementById('editlName').value = "";
  }

  submitPassword(e) {
    e.preventDefault();

    if (this.state.newPassword === this.state.confirmPassword) {
      var user = firebase.auth().currentUser;

      user.updatePassword(this.state.confirmPassword).then(function () {
        alert("Password updated successfully!");
      }).catch(function (error) {
        alert(error);
      });

      Util.profilePageReset();

    document.getElementById('editNewPassword').value = "";
    document.getElementById('confirmNewPassword').value = "";
    }
    else {
      alert("Passwords do not match!");
    }
  }

  cancelPassword() {
    Util.profilePageReset();

    document.getElementById('editNewPassword').value = "";
    document.getElementById('confirmNewPassword').value = "";
  }

  applyDriver() {
    document.getElementById('tblProfile').style.display = 'none';
    document.getElementById('tblPassword').style.display = 'none';
    document.getElementById('tblApplyDriver').style.display = 'block';

    document.getElementById('lblfName').style.display = 'none';
    document.getElementById('lbllName').style.display = 'none';

    document.getElementById('editfName').style.display = 'none';
    document.getElementById('editlName').style.display = 'none';

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('changePasswordButton').style.display = 'none';
    document.getElementById('submitEditButton').style.display = 'none';
    document.getElementById('cancelEditButton').style.display = 'none';
    document.getElementById('submitPasswordButton').style.display = 'none';
    document.getElementById('cancelPasswordButton').style.display = 'none';
    document.getElementById('btnApplyDriver').style.display = 'none';
    document.getElementById('cancelApplyDriverButton').style.display = 'inline-block';
    document.getElementById('btnImgFrontUpload').style.display = 'inline-block';
  }

  cancelApplyDriver() {
    Util.profilePageReset();
    document.getElementById('tblApplyDriver').style.display = 'none';
    document.getElementById('btnApplyDriver').style.display = 'block';
    document.getElementById('cancelApplyDriverButton').style.display = 'none';
    document.getElementById('btnImgFrontUpload').style.display = 'none';
    document.getElementById('btnImgBackUpload').style.display = 'none';
  }

render() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <div id='acctPage'>
        <div>
          <h1>{user[2] + "'s Account"}</h1>
          <table id='tblProfile'>
            <tr>
              <td>First Name:</td>
              <td>
                <label id='lblfName' style={{display:'inline'}}>{user[0]}</label>
                <input id='editfName' style={{display:'none'}} value={this.state.firstName} onChange={this.handleChange} type="text" name="firstName" />
              </td>
            </tr>
            <tr>
              <td>Last Name:</td>
              <td>
                <label id='lbllName' style={{display:'inline'}}>{user[1]}</label>
                <input id='editlName' style={{display:'none'}} value={this.state.lastName} onChange={this.handleChange} type="text" name="lastName" />
              </td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>
                <label id='lblEmail' style={{display:'inline'}} name='email'>{user[3]}</label>
              </td>
            </tr>
            <tr>
              <td>isDriver:</td>
              <td>
                <label id='lblDriver' name='isDriver'>{user[5]}</label>
              </td>
            </tr>
            <tr>
              <td>isAdmin:</td>
              <td>
                <label id='lblAdmin' name='isAdmin'>{user[6]}</label>
              </td>
            </tr>
          </table>
          <table id='tblPassword' style={{display: 'none'}}>
            <tr>
              <td>New Password:</td>
              <td><input id='editNewPassword' value={this.state.newPassword} onChange={this.handleChange} type="password" name="newPassword" /></td>
            </tr>
            <tr>
              <td>Confirm Password:</td>
              <td><input id='editConfirmPassword' value={this.state.confirmPassword} onChange={this.handleChange} type="password" name="confirmPassword" /></td>
            </tr>
          </table>

          <div id="tblApplyDriver" style={{display: 'none'}}>
            <div>
              <div>
                <table>
                  <tr id='uploadedFront'>
                    <td>
                      {this.state.frontURL && <img src={this.state.frontURL} height='150' width='200' />}
                    </td>
                    <td>
                      {this.state.backURL && <img src={this.state.backURL} height='150' width='200' />}   
                    </td>
                  </tr>
                </table>
                <table>
                  <tr>
                    <td id='td_license'>License Front:</td>
                    <td><input type="file" id='file' accept="image/*" onChange={this.handleImgChange} /></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          <br />
          <br />
          <button id='btnImgFrontUpload' onClick={this.handleFrontUpload} style={{display:'none'}}>Upload Front</button>
          <button id='btnImgBackUpload' onClick={this.handleBackUpload} style={{display:'none'}}>Upload Back</button>
          <button id='cancelApplyDriverButton' onClick={this.cancelApplyDriver} style={{display:'none'}}>Cancel</button>
          <button id='editButton' onClick={this.editProfile}>Edit Profile</button>
          <button id='changePasswordButton' onClick={this.changePassword}>Change Password</button>
          <button id='submitEditButton' onClick={this.submitEditProfile} style={{display:'none'}}>Update</button>
          <button id='cancelEditButton' onClick={this.cancelEditProfile} style={{display:'none'}}>Cancel</button>
          <button id='submitPasswordButton' onClick={this.submitPassword} style={{display:'none'}}>Update</button>
          <button id='cancelPasswordButton' onClick={this.cancelPassword} style={{display:'none'}}>Cancel</button>
          <div>
            <button id='btnApplyDriver' onClick={this.applyDriver} style={{display:'none'}}>Apply to be a driver</button>
          </div>
          <br/>
          <button onClick={this.logout}>Logout</button>
        </div>
      </div>
    </View>
    );
  }
}

export default Account;
