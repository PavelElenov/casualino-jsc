import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { IState } from "src/app/+store";
import { selectError } from "src/app/+store/selectors";

@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrls: ["./error.component.scss"]
})
export class ErrorComponent implements OnInit, OnDestroy{
  error!:string;
  subscriptions$: Subscription[] = []
  constructor(private store: Store<IState>){}
  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe());
  }
  ngOnInit(): void {
    const subscription = this.store.select(selectError).subscribe(error => this.error = error);
    this.subscriptions$.push(subscription);
  }
  
}
