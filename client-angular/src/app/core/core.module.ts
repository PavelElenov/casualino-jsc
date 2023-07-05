import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login/login.component";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { ErrorComponent } from "./error/error.component";



@NgModule({
  declarations: [
    LoginComponent,
    ErrorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ]
})
export class CoreModule { }
