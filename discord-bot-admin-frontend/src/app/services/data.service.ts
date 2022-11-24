import { Injectable } from '@angular/core';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  user_logged_in: any
  is_user_logged_in: any
  access_token: any
  movie_to_edit: Movie
  movie_titles: string[]
  filtered_titles: string[]

  constructor() { }
}
