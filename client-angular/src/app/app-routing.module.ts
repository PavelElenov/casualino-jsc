import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { ChatsListComponent } from './chat/chats-list/chats-list.component';
import { AuthGuard } from './shared/guards/auth-guard.guard';

const routes: Routes = [
  {
    path:"",
    pathMatch:"full",
    redirectTo: "/login"
  },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path: "chats",
    component: ChatsListComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
