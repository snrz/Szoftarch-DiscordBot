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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      let parsedhash = new URLSearchParams(fragment)
      let access_token = parsedhash.get("access_token")
      sessionStorage.setItem("access_token", JSON.stringify(access_token))
      let tokenType = parsedhash.get("token_type")
      this.http.get('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${tokenType} ${access_token}`,
        },
      }).subscribe(res => {
        sessionStorage.setItem("user", JSON.stringify(Object.values(res)[1])),
        sessionStorage.setItem("is_logged_in", JSON.stringify(true)),
        sessionStorage.setItem("is_admin", JSON.stringify(false))
        sessionStorage.setItem("refreshed", JSON.stringify(false))
        this.router.navigate(['/dashboard'])
      })
    });
  }

}
