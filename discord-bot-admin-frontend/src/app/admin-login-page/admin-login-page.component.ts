import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import * as admin_config from '../../../../bot/config/admin_config.json';
import {hashSync} from 'bcryptjs';

@Component({
  selector: 'app-admin-login-page',
  templateUrl: './admin-login-page.component.html',
  styleUrls: ['./admin-login-page.component.css']
})
export class AdminLoginPageComponent implements OnInit {

  errormsg: string = "Username or password incorrect. Please try again.";
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  admin_conf: any
  
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.admin_conf = admin_config
  }

  login(){
    console.log(this.admin_conf.admin1)
    let user_cred = {
      "username": this.username.value,
      "password": hashSync(this.password.value, this.admin_conf.admin1) 
    }
    
    console.log(user_cred)

    this.auth.loginAdmin(user_cred).subscribe((resp) => {
      if(resp.status == 200){
        sessionStorage.setItem("user", JSON.stringify(this.username.value))
        sessionStorage.setItem("is_logged_in", JSON.stringify(true))
        sessionStorage.setItem("is_admin", JSON.stringify(true))
        this.router.navigate(['/dashboard'])
      }
    },
    (error: HttpErrorResponse) => {
      if(error.status == 404){
        window.alert(this.errormsg)
      }
    }
    )
  }

  getErrorMessage() {
    if (this.username.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.password.hasError('required')) {
      return 'You must enter a value';
    }

    return this.username.hasError('email') ? 'Not a valid email' : '';
  }

}
