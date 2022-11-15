import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  globalTop100: any
  userTop10: any
  displayedColumns: string[] = ['Title', 'Rating', 'Audience', 'Genre', 'Age']

  constructor() { }

  ngOnInit(): void {
  }

}
