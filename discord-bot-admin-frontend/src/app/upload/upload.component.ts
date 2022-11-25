import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../models/movie';
import { DataService } from '../services/data.service';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private dataService: DataService, private movieService: MovieService, private router: Router) { }

  movie: Movie = {title: "", rating: "", genre: "", agegroup: "", audience: "", user: JSON.parse(sessionStorage.getItem("user"))}
  titles: string[]

  ngOnInit(): void {
    this.titles = this.dataService.filtered_titles
  }

  upload(){
    this.movieService.uploadUserMovie(this.movie).subscribe((resp) => {
      this.router.navigate(['/dashboard'])
    },(error: HttpErrorResponse) => {
      if(error.status == 404){
        window.alert('Something bad happened, could not upload movie')
      }
    })
  }

}
