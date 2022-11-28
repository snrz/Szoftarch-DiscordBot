import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../models/movie';
import { DataService } from '../services/data.service';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-user-movies',
  templateUrl: './user-movies.component.html',
  styleUrls: ['./user-movies.component.css']
})
export class UserMoviesComponent implements OnInit {

  userTop10: Movie[]
  displayedColumnsTop10 = ['Title', 'Rating', 'Audience', 'Genre', 'Age']
  is_admin: boolean
  displayedColumnsTop10_admin = ['Title', 'Rating', 'Audience', 'Genre', 'Age', 'Actions']

  constructor(private movieService: MovieService, private router: Router, private dataService: DataService) { }

  ngOnInit(): void {
    if(!JSON.parse(sessionStorage.getItem("is_logged_in"))){
      this.router.navigate([''])
  }
    this.is_admin = JSON.parse(sessionStorage.getItem("is_admin"))
    this.movieService.getMoviesOfUser(JSON.parse(sessionStorage.getItem("selectedUser")).name).subscribe((res) =>{
      this.userTop10 = res
    })
    
  }

  delete(movie: Movie){
    this.movieService.deleteUserMovie(movie).subscribe((resp) =>{
      let newTop10 = [...this.userTop10]
      newTop10.forEach( (item, index) => {
        if(item === movie) newTop10.splice(index,1);
      });
      this.userTop10 = newTop10
    },
    (error: HttpErrorResponse) => {
      if(error.status == 404){
        window.alert("Could not delete movie.")
      }
    })
  }

  edit(movie: Movie){
    this.dataService.movie_to_edit = movie
    this.router.navigate(['/update'])
  }

}
