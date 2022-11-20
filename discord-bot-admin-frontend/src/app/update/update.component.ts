import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Movie } from '../models/movie';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  movieToEdit: Movie
  movies: Movie[]

  constructor(private dataService: DataService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  edit(){

  }

}
