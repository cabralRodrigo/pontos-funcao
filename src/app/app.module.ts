import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ModalModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import * as services from './services/services';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ModalModule.forRoot()
    ],
    providers: [services.ProjetoService, services.CalculadorService],
    bootstrap: [AppComponent]
})
export class AppModule { }
