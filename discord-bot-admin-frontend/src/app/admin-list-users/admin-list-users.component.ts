import { HttpClient } from '@angular/common/http';
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
  is_admin: boolean
  user_logged_in: string
  blocked_users: string[]
  users_with_block_status: any[]

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    if(!JSON.parse(sessionStorage.getItem("is_logged_in"))){
      this.router.navigate([''])
    }
    this.is_admin = JSON.parse(sessionStorage.getItem('is_admin'))
    this.user_logged_in = JSON.parse(sessionStorage.getItem('user'))
    this.users = JSON.parse(sessionStorage.getItem('users'))
    this.users_with_block_status = JSON.parse(sessionStorage.getItem('users_with_block_status'))
    

  }

  list_movies(user: string){
    sessionStorage.setItem("selectedUser", JSON.stringify(user))
    this.router.navigate(['/movies_of'])
  }

  block(element: any){
    let block_url = "http://localhost:5000/blocklist/add"
    element.blocked = true
    this.http.post(block_url, element).subscribe((res) => {
      
    })
  }

}
