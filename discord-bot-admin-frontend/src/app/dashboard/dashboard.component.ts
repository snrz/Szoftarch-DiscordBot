import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Movie } from '../models/movie';
import * as titles_config_file from '../../../../bot/config/titles_config.json'
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MovieService } from '../services/movie.service';
import { catchError } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'filter-dialog',
  templateUrl: 'filter-dialog.html',
})
export class FilterDialog {
  
  constructor(
    public dialogRef: MatDialogRef<FilterDialog>,
    @Inject(MAT_DIALOG_DATA) public filter: string,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

 
}

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
  filter: string = ""

  constructor(private dataService: DataService, private movieService: MovieService,private router: Router, private http: HttpClient, public dialog: MatDialog) { }

  ngOnInit(): void {
    if(!this.dataService.is_user_logged_in){
        this.router.navigate([''])
    }
    this.titles_config = titles_config_file
    this.dataService.movie_titles = this.titles_config.titles
    this.movieService.getMoviesOfUser(this.dataService.user_logged_in).subscribe((res) => this.userTop10 = res)
    this.movieService.getGlobalTop100().subscribe((res) => this.globalTop100 = res)
  }

  edit(movie: Movie){
    const dialogRef = this.dialog.open(FilterDialog, {
      width: '250px',
      data: {filter: this.filter},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.filter = result;
      let regex = RegExp(`[^\"]*${this.filter}[^\"]*`)
      let filtered_title_list = this.dataService.movie_titles.filter(title => title.match(regex))
      this.dataService.filtered_titles = filtered_title_list.slice(0, 25)
      this.dataService.movie_to_edit = movie
      this.router.navigate(['/update'])
    });


  }



  delete(movie: Movie){
    this.movieService.deleteUserMovie(movie).subscribe((resp) =>{
      this.userTop10.forEach( (item, index) => {
        if(item === movie) this.userTop10.splice(index,1);
      });
    },
    (error: HttpErrorResponse) => {
      if(error.status == 404){
        window.alert("Could not delete movie.")
      }
    })
  }

  upload(){
    const dialogRef = this.dialog.open(FilterDialog, {
      width: '250px',
      data: {filter: this.filter},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.filter = result;
      let regex = RegExp(`[^\"]*${this.filter}[^\"]*`)
      let filtered_title_list = this.dataService.movie_titles.filter(title => title.match(regex))
      this.dataService.filtered_titles = filtered_title_list.slice(0, 25)
      this.router.navigate(['/upload'])
    });
  }

  execute(){

  }

}
