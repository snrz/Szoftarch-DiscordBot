import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.css']
})
export class MainToolbarComponent implements OnInit {

  is_admin: boolean
  is_logged_in: boolean

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.is_admin = JSON.parse(sessionStorage.getItem("is_admin"))
    this.is_logged_in = JSON.parse(sessionStorage.getItem("is_logged_in"))
  }

  logout(){
    sessionStorage.clear()
    this.router.navigate([''])
  }

}
