import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
    @Inject(MAT_DIALOG_DATA) public filter: any,
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
  filter: any
  queryResult: Movie[]
  username: string

  constructor(private dataService: DataService, private movieService: MovieService,private router: Router, private http: HttpClient, public dialog: MatDialog, private changeDetectorRefs: ChangeDetectorRef) { }

  ngOnInit(): void {
    if(!JSON.parse(sessionStorage.getItem("is_logged_in"))){
        this.router.navigate([''])
    }
    if(!JSON.parse(sessionStorage.getItem("refreshed"))){
      sessionStorage.setItem("refreshed", JSON.stringify(true))
      location.reload()
    }
    this.username = JSON.parse(sessionStorage.getItem("user"))
    this.titles_config = titles_config_file
    this.dataService.movie_titles = this.titles_config.titles
    this.movieService.getMoviesOfUser(JSON.parse(sessionStorage.getItem("user"))).subscribe((res) => this.userTop10 = res)
    this.movieService.getGlobalTop100().subscribe((res) => this.globalTop100 = res)
    this.movieService.getAllUsers().subscribe((res) => sessionStorage.setItem('users', JSON.stringify(res)))
    
  }

  edit(movie: Movie){
      this.dataService.movie_to_edit = movie
      this.router.navigate(['/update'])
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

  upload(){
    if(this.userTop10.length >= 10){
      window.alert("You can only store 10 movies!")
    }
    else{
      const dialogRef = this.dialog.open(FilterDialog, {
        width: '250px',
        data: {filter: this.filter},
      })
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.filter = result;
        if(this.filter){
          let regex = RegExp(`[^\"]*${this.filter}[^\"]*`)
          let filtered_title_list = this.dataService.movie_titles.filter(title => title.match(regex))
          let unique_filtered_title_list = [... new Set(filtered_title_list)]
          this.dataService.filtered_titles = unique_filtered_title_list.slice(0, 25)
          this.router.navigate(['/upload'])
        }
        
      })
    }
    
  }

  execute(query: string){
    this.movieService.getMoviesByQuery(query).subscribe((resp) => {
      this.queryResult = resp
      console.log(this.queryResult)
      let textarea = <HTMLInputElement>document.getElementById("queryResultTextArea")
      textarea.value = JSON.stringify(this.queryResult)
    },
    (error: HttpErrorResponse) => {
      window.alert("Could not execute query.")
    })

  }

}
