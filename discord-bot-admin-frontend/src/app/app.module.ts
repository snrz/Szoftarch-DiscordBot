import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AdminLoginPageComponent } from './admin-login-page/admin-login-page.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { HomePageComponent } from './home-page/home-page.component';
import { DashboardComponent, FilterDialog } from './dashboard/dashboard.component';
import { RedirectComponent } from './redirect/redirect.component';
import { HttpClientModule } from '@angular/common/http';
import { UpdateComponent } from './update/update.component';
import { UploadComponent } from './upload/upload.component';
import { AdminListUsersComponent } from './admin-list-users/admin-list-users.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLoginPageComponent,
    MainToolbarComponent,
    HomePageComponent,
    DashboardComponent,
    RedirectComponent,
    UpdateComponent,
    UploadComponent,
    FilterDialog,
    AdminListUsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(
      [
        {path: '', component: HomePageComponent},
        {path: 'admin-login', component: AdminLoginPageComponent},
        {path: 'dashboard', component: DashboardComponent},
        {path: 'redirect', component: RedirectComponent},
        {path: 'update', component: UpdateComponent},
        {path: 'upload', component: UploadComponent}
      ]
    ),
    NoopAnimationsModule,
    MaterialModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
