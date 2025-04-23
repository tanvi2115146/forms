import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({providedIn: 'root' })

export class FormService{
    constructor(private http:HttpClient){}

    saveForm(formData:any){
        return this.http.post('http://localhost:3000/forms',{fields:formData});
    }
}