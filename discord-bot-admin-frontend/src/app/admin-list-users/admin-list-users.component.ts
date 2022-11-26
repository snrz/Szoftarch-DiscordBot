import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-admin-list-users',
  templateUrl: './admin-list-users.component.html',
  styleUrls: ['./admin-list-users.component.css']
})
export class AdminListUsersComponent implements OnInit {

  users: string[]
  displayedColumns = ['Users', 'Actions']

  constructor(private router: Router) { }

  ngOnInit(): void {
    if(!JSON.parse(sessionStorage.getItem("is_logged_in"))){
      this.router.navigate([''])
  }
    this.users = JSON.parse(sessionStorage.getItem('users'))
  }

  list_movies(user: string){
    sessionStorage.setItem("selectedUser", JSON.stringify(user))
    this.router.navigate(['/movies_of'])
  }

}
