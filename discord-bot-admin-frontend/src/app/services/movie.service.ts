import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  baseUrl = "http://localhost:5000/"

  constructor(private http: HttpClient) { }


  getMoviesOfUser(user: string): Observable<Movie[]>{
      let url = this.baseUrl + `movies/${user}`
      return this.http.get<Movie[]>(url).pipe(catchError(this.handleError))
  }

  getMoviesOfUserByTitle(user: string, title: string): Observable<Movie[]>{
    let url = this.baseUrl + `movies/${user}/${title}`
    return this.http.get<Movie[]>(url).pipe(catchError(this.handleError))
  }

  getMoviesByQuery(query: string): Observable<Movie[]> {
      let url = this.baseUrl + `movies/query/${query}`
      return this.http.get<Movie[]>(url).pipe(catchError(this.handleError))
  }

  deleteUserMovie(body: any): Observable<any>{
    let url = this.baseUrl + `delete`
    return this.http.post<any>(url, body).pipe(catchError(this.handleError))
  }

  updateUserMovie(body: Movie): Observable<any>{
    let url = this.baseUrl + `update`
    return this.http.put<any>(url, body).pipe(catchError(this.handleError))
  }

  uploadUserMovie(body: Movie): Observable<any>{
    let url = this.baseUrl + `upload`
    return this.http.post<any>(url, body).pipe(catchError(this.handleError))
  }


  

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
