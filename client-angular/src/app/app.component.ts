import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { UserIsActiveService } from "./shared/services/userIsActive/user-is-active.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit{
  @ViewChild("appComponent", {read: ViewContainerRef}) container!: ViewContainerRef;

  constructor(private userIsActiveService: UserIsActiveService){}
  ngOnInit(): void {
    this.userIsActiveService.checkForUserActivity(document.querySelector("body") as HTMLElement);
  }
  
}
