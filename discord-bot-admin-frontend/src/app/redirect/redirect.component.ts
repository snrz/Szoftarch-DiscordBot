import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(private route: ActivatedRoute, private dataService: DataService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      let parsedhash = new URLSearchParams(fragment)
      let access_token = parsedhash.get("access_token")
      this.dataService.access_token = access_token
      let tokenType = parsedhash.get("token_type")
      this.http.get('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${tokenType} ${access_token}`,
        },
      }).subscribe(res => {
        this.dataService.user_logged_in = Object.values(res)[1],
        this.dataService.is_user_logged_in = true,
        this.router.navigate(['/dashboard'])
      })
    });
  }

}
