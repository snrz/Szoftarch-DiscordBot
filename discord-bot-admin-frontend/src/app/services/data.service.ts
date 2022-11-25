import { Injectable } from '@angular/core';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  movie_to_edit: Movie
  movie_titles: string[]
  filtered_titles: string[]

  constructor() { }
}
