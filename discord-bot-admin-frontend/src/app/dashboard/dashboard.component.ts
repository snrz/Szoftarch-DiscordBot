import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Movie } from '../models/movie';
import * as titles_config_file from '../../../../bot/config/titles_config.json'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  globalTop100: Movie[]
  userTop10: Movie[]
  displayedColumnsTop100: string[] =  ['Title', 'Rating', 'Audience', 'Genre', 'Age']
  displayedColumnsTop10: string[] = ['Title', 'Rating', 'Audience', 'Genre', 'Age', 'Actions']
  titles_config: any

  constructor(private dataService: DataService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    if(!this.dataService.is_user_logged_in){
        this.router.navigate([''])
    }
    this.titles_config = titles_config_file
    this.dataService.movie_titles = this.titles_config.titles
  }

  edit(movie: Movie){
    this.dataService.movie_to_edit = movie
    this.router.navigate(['/update'])
  }

  delete(movie: Movie){

  }

  upload(){
    this.router.navigate(['/upload'])
  }

}
