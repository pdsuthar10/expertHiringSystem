import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import axios from 'axios';
import { setUser } from '../actions/setUser';
import { connect } from 'react-redux';
import {REQUEST_API_HEROKU} from '../api'
require('dotenv').config()

const CLIENT_ID = process.env.CLIENT_ID;


class GoogleBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogined: false,
      accessToken: ''
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  login (response) {
    if(response.tokenObj.access_token){
      axios.get(REQUEST_API_HEROKU+'users/findByEmail/'+response.profileObj.email)
        .then(res=>{
          if(Object.keys(res.data).length === 0){
            axios.post(REQUEST_API_HEROKU+'users/add',
            {
              name: response.profileObj.name,
              username: response.profileObj.email,
              password: response.profileObj.googleId
            },{
              "headers": {
                'Content-Type': 'application/json',
              }
            })
              .then(res=>{
               
                const tempUser = {
                  name: response.profileObj.name,
                  username: response.profileObj.email
                }
                sessionStorage.setItem('user',JSON.stringify(tempUser));
                this.props.setUser(tempUser);           
              })
              .catch(err=>console.log(err));
            
          }
          else{
            sessionStorage.setItem('user',JSON.stringify(res.data));
            this.props.setUser(res.data); 
          }
          this.setState(state => ({
            isLogined: true,
            accessToken: response.tokenObj.access_token
          }));
        })
        .catch(err=>console.log(err));
      
      
      }
  }

  logout (response) {
    this.setState(state => ({
      isLogined: false,
      accessToken: ''
    }));
  }

  handleLoginFailure (response) {
    alert('Failed to log in')
  }

  handleLogoutFailure (response) {
    alert('Failed to log out')
  }




  render() {
    console.log(process.env)
    return (
    <div>
      { this.state.isLogined ?
  
        <GoogleLogout
          clientId={ CLIENT_ID }
          buttonText='GOOGLE'
          onLogoutSuccess={ this.logout }
          onFailure={ this.handleLogoutFailure }
        > 
        </GoogleLogout>: <GoogleLogin
          clientId={CLIENT_ID}
          buttonText='GOOGLE'
          onSuccess={ this.login }
          onFailure={ this.handleLoginFailure }
          cookiePolicy={ 'single_host_origin' }
          responseType='code,token'
        />
      }
    </div>
    )
  }
}

const mapStateToProps = (state) => ({
  userState: state.userState
});


export default connect(mapStateToProps,{ setUser })(GoogleBtn);