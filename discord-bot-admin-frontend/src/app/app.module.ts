import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RouterModule } from '@angular/router';
import { AdminLoginPageComponent } from './admin-login-page/admin-login-page.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { HomePageComponent } from './home-page/home-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    AdminLoginPageComponent,
    MainToolbarComponent,
    HomePageComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(
      [
        {path: '', component: HomePageComponent},
        {path: 'login', component: LoginPageComponent},
        {path: 'admin-login', component: AdminLoginPageComponent},
        {path: 'dashboard', component: DashboardComponent}
      ]
    ),
    NoopAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
