import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login-page',
  templateUrl: './admin-login-page.component.html',
  styleUrls: ['./admin-login-page.component.css']
})
export class AdminLoginPageComponent implements OnInit {

  error: string = "Email or password incorrect. Please try again.";
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  
  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
  }

  login(){
    let user_cred = {
      "username": this.username.value,
      "password": this.password.value 
    }
    
    this.auth.loginAdmin(user_cred).subscribe(resp => console.log(resp))
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
