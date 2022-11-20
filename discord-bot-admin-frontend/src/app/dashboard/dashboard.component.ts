import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { readFileSync } from 'fs';
import { Movie } from '../models/movie';
import * as titles_config from '../../../../bot/config/titles_config.json'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  globalTop100: Movie[]
  userTop10: Movie[]
  displayedColumns: string[] = ['Title', 'Rating', 'Audience', 'Genre', 'Age', 'Actions']

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    if(!this.dataService.is_user_logged_in){
        this.router.navigate([''])
    }
  }

  edit(movie: Movie){
    this.dataService.movie_to_edit = movie
    this.router.navigate(['/update'])
  }

  delete(movie: Movie){

  }

}
