import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../models/movie';
import { DataService } from '../services/data.service';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  movieToEdit: Movie
  titles: string[]

  constructor(private dataService: DataService, private http: HttpClient, private movieService: MovieService, private router: Router) { }

  ngOnInit(): void {
    if(!JSON.parse(sessionStorage.getItem("is_logged_in"))){
      this.router.navigate([''])
    }
    this.movieToEdit = this.dataService.movie_to_edit
    this.titles = this.dataService.filtered_titles
    console.log(this.movieToEdit)
  }

  edit(){
    console.log(this.movieToEdit)
    this.movieService.updateUserMovie(this.movieToEdit).subscribe((resp) => {
        this.router.navigate(['/dashboard'])
    },
    (error: HttpErrorResponse) => {
      if(error.status == 404){
        window.alert('Something bad happened, could not update movie')
      }
    })

  }

}
