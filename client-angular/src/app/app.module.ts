import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ChatModule } from "./chat/chat.module";
import { CoreModule } from "./core/core.module";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { reducers } from "./+store";
import { SharedModule } from "./shared/shared.module";

import { ActionReducer, MetaReducer } from "@ngrx/store";

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state, action) {
        console.log("@ngrx action", { ...action });
        const result = reducer(state, action);

        console.log("@ngrx previous state", state, "current state", result);
        return result;
    };
}

export const metaReducers: MetaReducer<any>[] = [debug];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ChatModule,
    CoreModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
