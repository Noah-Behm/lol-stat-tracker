import React from 'react';
import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // import first
import './Signup.css';
import { TextField, Button, Box } from '@material-ui/core';


const Signup = () => {

  const navigate = useNavigate()


  const [user, setUser] = useState({
    user_signup:"",
    pass_signup:"",
  });


  const [userLogin, setUserLogin] = useState({
    user_login:"",
    pass_login:"",
  });


  const handleChangeSignup = (e) => {
    setUser(prev=>({...prev, [e.target.name]: e.target.value}));
  };


  const handleChangeLogin = (e) => {
    setUserLogin(prev=>({...prev, [e.target.name]: e.target.value}));
  };


  const handleClickSignup = async e =>{
    
    try{
        await axios.post("http://localhost:8800/signup", user)
        toast.success("User successfully added to the system.", {
          position: toast.POSITION.TOP_CENTER
        });
    }catch (err) {
        console.log(err)
    }
  }


  const handleClickLogin = async e =>{
    
    try{
        const res = await axios.post("http://localhost:8800/login", userLogin)
        if (res.data.length > 0){
          navigate("/home", {state:{name:userLogin.user_login,password:userLogin.pass_login}})
        }
        else{
          toast.warn("This username and password combination does not exist.", {
            position: toast.POSITION.TOP_CENTER
          });
        }
        //console.log(res)
    }catch (err) {
        console.log(err)
    }
  }

  //console.log(user)
  //console.log(userLogin)
  return (
    <div className='background'>
      <div className='head_line'>
        <h1 className='head_text'>I NEED OIL ASAP</h1>
      </div>

      <div className='form'>

        <ToastContainer />
        <div className='login_box'>
          <form action="#" method="POST">
            <h2 className='box_header'>Log In</h2>
            <Box className='wrapper'><TextField type="text" placeholder="username" onChange={handleChangeLogin} name = "user_login" className='form_input'></TextField></Box>
            <Box className='wrapper'><TextField type="password" placeholder="password" onChange={handleChangeLogin} name = "pass_login" className='form_input'></TextField></Box>
            <Button onClick={handleClickLogin} name = "login_button" className='submit_button' variant="outlined">Log In</Button>
          </form>
        </div>

        <div className='signup_box'>
          <form action="#" method="POST">
            <h2 className='box_header'>Sign Up</h2>
            <Box className='wrapper'><TextField type="text" placeholder="username" onChange={handleChangeSignup} name = "user_signup" className='form_input'></TextField></Box>
            <Box className='wrapper'><TextField type="password" placeholder="password" onChange={handleChangeSignup} name = "pass_signup" className='form_input'></TextField></Box>
            <Button onClick={handleClickSignup} name = "signup_button" className='submit_button' variant="outlined">Sign Up</Button>
          </form>
        </div>

      </div>

      <div className='foot_line'>
        <p className='foot_text'>beep boop boop pow</p>
        <p className='foot_text'>I am a droid, please give me oil</p>
        <p className='foot_text'>empty space empty space</p>
      </div>

    </div>

  )
}

export default Signup